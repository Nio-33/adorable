import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { User } from 'lucide-react-native';
import { Icon } from '../common/Icon';

interface ChatAvatarProps {
  photoURL?: string;
  displayName: string;
  size?: number;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  photoURL,
  displayName,
  size = 40,
  showOnlineStatus = false,
  isOnline = false,
}) => {
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      {photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholderAvatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {size >= 30 ? (
            <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
          ) : (
            <Icon icon={User} size={size * 0.6} color="#fff" />
          )}
        </View>
      )}
      {showOnlineStatus && (
        <View
          style={[
            styles.onlineStatus,
            {
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E',
              right: -size * 0.1,
              bottom: -size * 0.1,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#E1E1E1',
  },
  placeholderAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '600',
  },
  onlineStatus: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
