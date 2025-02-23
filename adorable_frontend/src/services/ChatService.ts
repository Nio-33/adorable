import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import { Location } from '../types/map';

export interface ChatUser {
  id: string;
  displayName: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  content: string;
  timestamp: number;
  type: 'text' | 'location' | 'media';
  mediaUrl?: string;
  location?: Location;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatRoom {
  id: string;
  participants: ChatUser[];
  lastMessage?: ChatMessage;
  lastActivity: number;
  unreadCount: { [userId: string]: number };
}

export class ChatService {
  private static instance: ChatService;
  private readonly CHAT_ROOMS_REF = 'chat_rooms';
  private readonly MESSAGES_REF = 'messages';
  private readonly MEDIA_STORAGE_PATH = 'chat_media';
  private readonly ONLINE_STATUS_REF = 'online_status';
  private readonly TYPING_STATUS_REF = 'typing_status';
  private onlineStatusRef?: any;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async createChatRoom(participants: ChatUser[]): Promise<string> {
    try {
      const chatRoomRef = database().ref(this.CHAT_ROOMS_REF).push();
      const chatRoom: ChatRoom = {
        id: chatRoomRef.key!,
        participants,
        lastActivity: Date.now(),
        unreadCount: participants.reduce((acc, user) => ({ ...acc, [user.id]: 0 }), {}),
      };

      await chatRoomRef.set(chatRoom);
      return chatRoom.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const snapshot = await database()
        .ref(this.CHAT_ROOMS_REF)
        .orderByChild('lastActivity')
        .once('value');

      const rooms = snapshot.val() || {};
      return Object.values(rooms)
        .filter((room: unknown): room is ChatRoom =>
          typeof room === 'object' &&
          room !== null &&
          'participants' in room &&
          Array.isArray((room as ChatRoom).participants) &&
          (room as ChatRoom).participants.some(p => p.id === userId)
        );
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      throw error;
    }
  }

  async sendMessage(
    roomId: string,
    sender: ChatUser,
    content: string,
    type: ChatMessage['type'] = 'text',
    extras: Partial<ChatMessage> = {}
  ): Promise<void> {
    try {
      const messageRef = database().ref(`${this.MESSAGES_REF}/${roomId}`).push();
      const message: ChatMessage = {
        id: messageRef.key!,
        senderId: sender.id,
        senderName: sender.displayName,
        senderPhoto: sender.photoURL,
        content,
        timestamp: Date.now(),
        type,
        status: 'sent',
        ...extras,
      };

      await messageRef.set(message);

      // Update chat room's last message and activity
      await database().ref(`${this.CHAT_ROOMS_REF}/${roomId}`).update({
        lastMessage: message,
        lastActivity: message.timestamp,
      });

      // Increment unread count for other participants
      const roomSnapshot = await database()
        .ref(`${this.CHAT_ROOMS_REF}/${roomId}`)
        .once('value');
      const room = roomSnapshot.val();

      const updates: { [key: string]: any } = {};
      room.participants
        .filter((participant: ChatUser) => participant.id !== sender.id)
        .forEach((participant: ChatUser) => {
          updates[`unreadCount/${participant.id}`] = (room.unreadCount[participant.id] || 0) + 1;
        });

      await database().ref(`${this.CHAT_ROOMS_REF}/${roomId}`).update(updates);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendLocationMessage(
    roomId: string,
    sender: ChatUser,
    location: Location
  ): Promise<void> {
    await this.sendMessage(roomId, sender, 'Shared a location', 'location', { location });
  }

  async sendMediaMessage(
    roomId: string,
    sender: ChatUser,
    mediaUri: string,
    mediaType: 'image' | 'video'
  ): Promise<void> {
    try {
      // Upload media to Firebase Storage
      const filename = `${Date.now()}_${mediaType}`;
      const reference = storage().ref(`${this.MEDIA_STORAGE_PATH}/${roomId}/${filename}`);
      await reference.putFile(mediaUri);
      const mediaUrl = await reference.getDownloadURL();

      // Send message with media URL
      await this.sendMessage(roomId, sender, `Shared a ${mediaType}`, 'media', { mediaUrl });
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  async getMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const snapshot = await database()
        .ref(`${this.MESSAGES_REF}/${roomId}`)
        .orderByChild('timestamp')
        .limitToLast(limit)
        .once('value');

      return Object.values(snapshot.val() || {});
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  subscribeToMessages(roomId: string, callback: (message: ChatMessage) => void): () => void {
    const messagesRef = database().ref(`${this.MESSAGES_REF}/${roomId}`);

    messagesRef.on('child_added', (snapshot) => {
      const message = snapshot.val();
      callback(message);
    });

    return () => messagesRef.off('child_added');
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    try {
      await database()
        .ref(`${this.CHAT_ROOMS_REF}/${roomId}/unreadCount/${userId}`)
        .set(0);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async deleteMessage(roomId: string, messageId: string): Promise<void> {
    try {
      await database().ref(`${this.MESSAGES_REF}/${roomId}/${messageId}`).remove();
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      await database().ref(`${this.ONLINE_STATUS_REF}/${userId}`).update({
        isOnline,
        lastSeen: database.ServerValue.TIMESTAMP,
      });
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  }

  subscribeToOnlineStatus(userId: string, callback: (status: { isOnline: boolean; lastSeen: number }) => void): () => void {
    const statusRef = database().ref(`${this.ONLINE_STATUS_REF}/${userId}`);

    statusRef.on('value', (snapshot) => {
      const status = snapshot.val() || { isOnline: false, lastSeen: Date.now() };
      callback(status);
    });

    return () => statusRef.off('value');
  }

  startOnlineStatusTracking(userId: string): void {
    if (this.onlineStatusRef) {
      this.onlineStatusRef.off();
    }

    this.onlineStatusRef = database().ref(`${this.ONLINE_STATUS_REF}/${userId}`);

    // Set online status when connected
    database().ref('.info/connected').on('value', async (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }

      try {
        await this.onlineStatusRef.onDisconnect().update({
          isOnline: false,
          lastSeen: database.ServerValue.TIMESTAMP,
        });

        await this.onlineStatusRef.update({
          isOnline: true,
          lastSeen: database.ServerValue.TIMESTAMP,
        });
      } catch (error) {
        console.error('Error setting online status:', error);
      }
    });
  }

  stopOnlineStatusTracking(): void {
    if (this.onlineStatusRef) {
      this.onlineStatusRef.off();
      this.onlineStatusRef = undefined;
    }
    database().ref('.info/connected').off();
  }

  async updateTypingStatus(roomId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      await database().ref(`${this.TYPING_STATUS_REF}/${roomId}/${userId}`).set({
        isTyping,
        timestamp: database.ServerValue.TIMESTAMP,
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
      throw error;
    }
  }

  subscribeToTypingStatus(roomId: string, callback: (typingUsers: string[]) => void): () => void {
    const typingRef = database().ref(`${this.TYPING_STATUS_REF}/${roomId}`);

    typingRef.on('value', (snapshot) => {
      const typingStatus = snapshot.val() || {};
      const now = Date.now();
      const typingUsers = Object.entries(typingStatus)
        .filter(([_, status]: [string, any]) => {
          return status.isTyping && now - status.timestamp < 10000; // Consider typing timeout after 10 seconds
        })
        .map(([userId]) => userId);

      callback(typingUsers);
    });

    return () => typingRef.off('value');
  }
}

export const chatService = ChatService.getInstance();
