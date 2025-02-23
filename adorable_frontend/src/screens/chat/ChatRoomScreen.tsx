import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Image as ImageIcon, MapPin } from 'lucide-react-native';
import { ChatMessage, ChatUser, chatService } from '../../services/ChatService';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../hooks/useLocation';
import { RootStackParamList } from '../../types/navigation';
import { ErrorView } from '../../components/common/ErrorView';
import { Icon } from '../../components/common/Icon';
import { MediaActionSheet } from '../../components/chat/MediaActionSheet';
import { mediaPickerService } from '../../services/MediaPickerService';
import { ChatAvatar } from '../../components/chat/ChatAvatar';
import { MediaViewer } from '../../components/chat/MediaViewer';

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ChatRoomScreen: React.FC = () => {
  const route = useRoute<ChatRoomRouteProp>();
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const { user } = useAuth();
  const { location } = useLocation();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { roomId } = route.params;

  const loadMessages = async () => {
    if (!user) return;
    try {
      setError(null);
      const fetchedMessages = await chatService.getMessages(roomId);
      setMessages(fetchedMessages.sort((a, b) => a.timestamp - b.timestamp));
      await chatService.markMessagesAsRead(roomId, user.uid);
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !inputText.trim()) return;
    try {
      setSending(true);
      const sender: ChatUser = {
        id: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || undefined,
      };
      await chatService.sendMessage(roomId, sender, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleShareLocation = async () => {
    if (!user || !location) return;
    try {
      setSending(true);
      const sender: ChatUser = {
        id: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || undefined,
      };
      await chatService.sendLocationMessage(roomId, sender, location);
    } catch (err) {
      console.error('Error sharing location:', err);
    } finally {
      setSending(false);
    }
  };

  const handleShareMedia = () => {
    setShowMediaOptions(true);
  };

  const handleSelectPhoto = async () => {
    try {
      setSending(true);
      setShowMediaOptions(false);
      const response = await mediaPickerService.pickFromGallery({ mediaType: 'photo' });
      
      if (response.assets && response.assets[0]?.uri && user) {
        const sender: ChatUser = {
          id: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || undefined,
        };
        await chatService.sendMediaMessage(roomId, sender, response.assets[0].uri, 'image');
      }
    } catch (err) {
      console.error('Error selecting photo:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setSending(true);
      setShowMediaOptions(false);
      const response = await mediaPickerService.takePhoto();
      
      if (response.assets && response.assets[0]?.uri && user) {
        const sender: ChatUser = {
          id: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || undefined,
        };
        await chatService.sendMediaMessage(roomId, sender, response.assets[0].uri, 'image');
      }
    } catch (err) {
      console.error('Error taking photo:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectVideo = async () => {
    try {
      setSending(true);
      setShowMediaOptions(false);
      const response = await mediaPickerService.pickFromGallery({ mediaType: 'video' });
      
      if (response.assets && response.assets[0]?.uri && user) {
        const sender: ChatUser = {
          id: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || undefined,
        };
        await chatService.sendMediaMessage(roomId, sender, response.assets[0].uri, 'video');
      }
    } catch (err) {
      console.error('Error selecting video:', err);
    } finally {
      setSending(false);
    }
  };

  const handleRecordVideo = async () => {
    try {
      setSending(true);
      setShowMediaOptions(false);
      const response = await mediaPickerService.recordVideo();
      
      if (response.assets && response.assets[0]?.uri && user) {
        const sender: ChatUser = {
          id: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || undefined,
        };
        await chatService.sendMediaMessage(roomId, sender, response.assets[0].uri, 'video');
      }
    } catch (err) {
      console.error('Error recording video:', err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();

    const unsubscribe = chatService.subscribeToMessages(roomId, (newMessage) => {
      setMessages((prev) => [...prev, newMessage].sort((a, b) => a.timestamp - b.timestamp));
      if (newMessage.senderId !== user?.uid) {
        chatService.markMessagesAsRead(roomId, user?.uid || '');
      }
    });

    return () => unsubscribe();
  }, [roomId, user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.subscribeToTypingStatus(roomId, (users) => {
      setTypingUsers(users.filter(id => id !== user.uid));
    });

    return () => unsubscribe();
  }, [roomId, user]);

  const handleMediaPress = (url: string, type: 'image' | 'video') => {
    setSelectedMedia({ url, type });
    setShowMediaViewer(true);
  };

  const handleInputFocus = () => {
    if (!user) return;
    chatService.updateTypingStatus(roomId, user.uid, true);
  };

  const handleInputBlur = () => {
    if (!user) return;
    chatService.updateTypingStatus(roomId, user.uid, false);
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing status to true
    chatService.updateTypingStatus(roomId, user.uid, true);

    // Set a timeout to set typing status to false after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      chatService.updateTypingStatus(roomId, user.uid, false);
    }, 2000);
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>
          {typingUsers.length === 1
            ? 'Someone is typing...'
            : 'Multiple people are typing...'}
        </Text>
      </View>
    );
  };

  const renderMessage = ({ item: message }: { item: ChatMessage }) => {
    const isOwnMessage = message.senderId === user?.uid;

    return (
      <View style={styles.messageWrapper}>
        {!isOwnMessage && (
          <ChatAvatar
            photoURL={message.senderPhoto}
            displayName={message.senderName}
            size={32}
          />
        )}
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          ]}
        >
          {!isOwnMessage && (
            <Text style={styles.senderName}>{message.senderName}</Text>
          )}
          {message.type === 'location' && message.location && (
            <TouchableOpacity
              style={styles.locationMessage}
              onPress={() => {
                if (message.location) {
                  navigation.navigate('Map', { location: message.location });
                }
              }}
            >
              <Icon icon={MapPin} size={20} color="#007AFF" />
              <Text style={styles.locationText}>Shared Location</Text>
            </TouchableOpacity>
          )}
          {message.type === 'media' && message.mediaUrl && (
            <View style={styles.mediaContainer}>
              <Image
                source={{ uri: message.mediaUrl }}
                style={styles.mediaPreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.mediaOverlay}
                onPress={() => handleMediaPress(message.mediaUrl!, message.mediaUrl?.endsWith('.mp4') ? 'video' : 'image')}
              >
                <Icon icon={ImageIcon} size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {message.type === 'text' && (
            <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
              {message.content}
            </Text>
          )}
          <Text style={[styles.timestamp, isOwnMessage && styles.ownTimestamp]}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {isOwnMessage && (
          <ChatAvatar
            photoURL={message.senderPhoto}
            displayName={message.senderName}
            size={32}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadMessages} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />
        {renderTypingIndicator()}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleShareMedia}
            disabled={sending}
          >
            <Icon icon={ImageIcon} size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleShareLocation}
            disabled={sending || !location}
          >
            <Icon icon={MapPin} size={24} color="#007AFF" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            <Icon
              icon={Send}
              size={24}
              color={!inputText.trim() || sending ? '#999' : '#fff'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MediaActionSheet
        visible={showMediaOptions}
        onClose={() => setShowMediaOptions(false)}
        onSelectPhoto={handleSelectPhoto}
        onTakePhoto={handleTakePhoto}
        onSelectVideo={handleSelectVideo}
        onRecordVideo={handleRecordVideo}
      />

      {selectedMedia && (
        <MediaViewer
          visible={showMediaViewer}
          mediaUrl={selectedMedia.url}
          mediaType={selectedMedia.type}
          onClose={() => {
            setShowMediaViewer(false);
            setSelectedMedia(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  messageContainer: {
    flex: 1,
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  ownMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  locationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  mediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  mediaButton: {
    padding: 8,
  },
  locationButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 8,
    maxHeight: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  typingContainer: {
    padding: 8,
    backgroundColor: '#f0f0f0',
  },
  typingText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
}); 