import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../../config/theme';
import { Typography, Avatar, Button } from '../../atoms';
import { User } from '../../../types';

export interface UserCardProps {
  user: User;
  onPress?: () => void;
  onConnect?: () => void;
  isConnected?: boolean;
  distance?: number;
  compact?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  onConnect,
  isConnected,
  distance,
  compact = false,
}) => {
  const renderDistance = () => {
    if (typeof distance !== 'number') {return null;}
    return (
      <Typography variant="caption" color={COLORS.text.secondary}>
        {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)}km away`}
      </Typography>
    );
  };

  const renderContent = () => (
    <>
      <Avatar
        uri={user.photoURL || user.avatarUrl}
        fallback={user.displayName?.[0] || user.username[0]}
        size={compact ? 'medium' : 'large'}
      />
      <View style={styles.info}>
        <Typography variant={compact ? 'body1' : 'h4'}>
          {user.displayName || user.username}
        </Typography>
        <Typography
          variant="caption"
          color={COLORS.text.secondary}
          numberOfLines={1}
          style={styles.username}
        >
          @{user.username}
        </Typography>
        {user.bio && !compact && (
          <Typography
            variant="body2"
            color={COLORS.text.secondary}
            numberOfLines={2}
            style={styles.bio}
          >
            {user.bio}
          </Typography>
        )}
        {renderDistance()}
      </View>
      {onConnect && (
        <Button
          variant={isConnected ? 'outline' : 'primary'}
          size="small"
          onPress={onConnect}
          style={styles.connectButton}
        >
          {isConnected ? 'Connected' : 'Connect'}
        </Button>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.container, compact ? styles.compactContainer : styles.fullContainer]}
        onPress={onPress}
      >
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, compact ? styles.compactContainer : styles.fullContainer]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  compactContainer: {
    padding: SPACING.sm,
    marginVertical: SPACING.xs,
  },
  fullContainer: {
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  username: {
    marginTop: SPACING.xs,
  },
  bio: {
    marginTop: SPACING.sm,
  },
  connectButton: {
    marginLeft: SPACING.sm,
  },
});
