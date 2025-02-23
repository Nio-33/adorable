import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  remove,
  onValue,
  Database,
  DataSnapshot,
  update,
  query,
  orderByChild,
  limitToLast,
  off,
  DatabaseReference,
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  StorageReference,
} from 'firebase/storage';
import { FIREBASE_CONFIG } from '../config/constants';
import { User, Message, ChatRoom } from '../types';
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
  // Your Firebase config here
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
};

class FirebaseService {
  private app: FirebaseApp;
  private auth: Auth;
  private database: Database;
  private storage: ReturnType<typeof getStorage>;

  constructor() {
    if (!firebase.apps.length) {
      this.app = initializeApp(FIREBASE_CONFIG);
    } else {
      this.app = initializeApp(FIREBASE_CONFIG);
    }
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
    this.storage = getStorage(this.app);
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    if (!this.auth.currentUser) throw new Error('No user signed in');
    return updateProfile(this.auth.currentUser, { displayName, photoURL });
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return this.auth.onAuthStateChanged(callback);
  }

  // Realtime Database methods
  async setData(path: string, data: any): Promise<void> {
    const dbRef = ref(this.database, path);
    return set(dbRef, data);
  }

  async getData(path: string): Promise<any> {
    const dbRef = ref(this.database, path);
    const snapshot = await get(dbRef);
    return snapshot.val();
  }

  async pushData(path: string, data: any): Promise<string> {
    const dbRef = ref(this.database, path);
    const newRef = push(dbRef);
    await set(newRef, data);
    return newRef.key as string;
  }

  async removeData(path: string): Promise<void> {
    const dbRef = ref(this.database, path);
    return remove(dbRef);
  }

  onDataChange(path: string, callback: (snapshot: DataSnapshot) => void): () => void {
    const dbRef = ref(this.database, path);
    const unsubscribe = onValue(dbRef, callback);
    return unsubscribe;
  }

  // User presence system
  setupPresence(userId: string): void {
    const userStatusRef = ref(this.database, `/status/${userId}`);
    const connectedRef = ref(this.database, '.info/connected');

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // User is online
        set(userStatusRef, {
          state: 'online',
          lastSeen: new Date().toISOString(),
        });

        // When user disconnects, update the status
        set(userStatusRef, {
          state: 'offline',
          lastSeen: new Date().toISOString(),
        }).catch(console.error);
      }
    });
  }

  // Chat system
  async sendMessage(chatId: string, message: any): Promise<string> {
    return this.pushData(`/chats/${chatId}/messages`, {
      ...message,
      timestamp: new Date().toISOString(),
    });
  }

  onNewMessage(chatId: string, callback: (snapshot: DataSnapshot) => void): () => void {
    return this.onDataChange(`/chats/${chatId}/messages`, callback);
  }

  // User location updates
  async updateUserLocation(userId: string, location: { latitude: number; longitude: number }): Promise<void> {
    return this.setData(`/locations/${userId}`, {
      ...location,
      timestamp: new Date().toISOString(),
    });
  }

  onUserLocationChanged(userId: string, callback: (snapshot: DataSnapshot) => void): () => void {
    return this.onDataChange(`/locations/${userId}`, callback);
  }

  // Database references
  public getChatRoomsRef(userId: string): DatabaseReference {
    return ref(this.database, `/chatRooms/${userId}`);
  }

  public getMessagesRef(roomId: string): DatabaseReference {
    return ref(this.database, `/messages/${roomId}`);
  }

  public getChatRoomRef(roomId: string): DatabaseReference {
    return ref(this.database, `/chatRooms/${roomId}`);
  }

  // Storage references
  public getStorageRef(path: string): StorageReference {
    return storageRef(this.storage, path);
  }

  // Chat room operations
  public async createChatRoom(room: Omit<ChatRoom, 'id'>) {
    const chatRoomsRef = ref(this.database, '/chatRooms');
    const newRoomRef = push(chatRoomsRef);
    const roomWithId = { ...room, id: newRoomRef.key! };
    await set(newRoomRef, roomWithId);
    return roomWithId;
  }

  public async updateChatRoom(roomId: string, updates: Partial<ChatRoom>) {
    const roomRef = ref(this.database, `/chatRooms/${roomId}`);
    await update(roomRef, updates);
  }

  // Message operations
  public async sendMessage(roomId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const messagesRef = ref(this.database, `/messages/${roomId}`);
    const newMessageRef = push(messagesRef);
    const messageWithId: Message = {
      ...message,
      id: newMessageRef.key!,
      timestamp: message.timestamp,
    };
    await set(newMessageRef, messageWithId);
    return messageWithId;
  }

  public async markMessagesAsRead(roomId: string, messageIds: string[]) {
    const updates: Record<string, boolean> = {};
    messageIds.forEach(messageId => {
      updates[`/messages/${roomId}/${messageId}/read`] = true;
    });
    const dbRef = ref(this.database);
    await update(dbRef, updates);
  }

  // Storage operations
  public async uploadFile(path: string, file: Blob) {
    const fileRef = this.getStorageRef(path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  // Real-time subscriptions
  public subscribeToMessages(roomId: string, callback: (messages: Message[]) => void) {
    const messagesRef = this.getMessagesRef(roomId);
    const messagesQuery = query(
      messagesRef,
      orderByChild('timestamp'),
      limitToLast(20)
    );
    
    onValue(messagesQuery, (snapshot) => {
      const messages = Object.values(snapshot.val() || {}).map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      })) as Message[];
      callback(messages);
    });

    return () => off(messagesRef);
  }

  public subscribeToChatRooms(userId: string, callback: (rooms: ChatRoom[]) => void) {
    const roomsRef = this.getChatRoomsRef(userId);
    
    onValue(roomsRef, (snapshot) => {
      const rooms = Object.values(snapshot.val() || {}).map((room: any) => ({
        ...room,
        updatedAt: new Date(room.updatedAt),
        lastMessage: room.lastMessage ? {
          ...room.lastMessage,
          timestamp: new Date(room.lastMessage.timestamp),
        } : undefined,
      })) as ChatRoom[];
      callback(rooms);
    });

    return () => off(roomsRef);
  }

  // Cleanup
  public cleanup() {
    if (this.app) {
      this.app.delete();
    }
  }
}

export const firebaseService = new FirebaseService(); 