import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button, Loading } from '../../components/atoms';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { Message } from '../../types';
import type { MessagesStackParamList } from './navigation/MessagesNavigator';

type ChatRoomRouteProp = RouteProp<MessagesStackParamList, 'ChatRoom'>;

export const ChatRoomScreen: React.FC = () => {
  const route = useRoute<ChatRoomRouteProp>();
  const { roomId } = route.params;
  const { user } = useAuth();
  const {
    messages,
    loading,
    error,
    sendMessage,
    loadMoreMessages,
    markAsRead,
  } = useChat(user?.id || '');
  const [messageText, setMessageText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    markAsRead();
  }, [markAsRead]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    try {
      await sendMessage(messageText.trim());
      setMessageText('');
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === user?.id;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Typography
            variant="body2"
            color={isOwnMessage ? COLORS.text.inverse : COLORS.text.primary}
          >
            {message.content}
          </Typography>
          <Typography
            variant="caption"
            color={isOwnMessage ? COLORS.text.inverse : COLORS.text.secondary}
            style={styles.timestamp}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Typography>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loading text="Loading messages..." />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Typography variant="body1" color={COLORS.status.error}>
          {error}
        </Typography>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        onLayout={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.text.tertiary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Typography
            variant="button"
            color={!messageText.trim() ? COLORS.text.tertiary : COLORS.text.inverse}
          >
            Send
          </Typography>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageContainer: {
    marginVertical: SPACING.xs,
    flexDirection: 'row',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.sm,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: COLORS.primary,
  },
  otherBubble: {
    backgroundColor: COLORS.background.secondary,
  },
  timestamp: {
    marginTop: SPACING.xs,
    fontSize: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    color: COLORS.text.primary,
  },
  sendButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.background.tertiary,
  },
}); 