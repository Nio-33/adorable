import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING } from '../../../config/theme';
import { Typography, Avatar } from '../../atoms';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  avatarUrl?: string;
  avatarFallback?: string;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  divider?: boolean;
  compact?: boolean;
  style?: any;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftContent,
  rightContent,
  avatarUrl,
  avatarFallback,
  onPress,
  selected = false,
  disabled = false,
  divider = true,
  compact = false,
  style,
}) => {
  const renderContent = () => (
    <>
      {leftContent || (avatarUrl || avatarFallback ? (
        <Avatar
          uri={avatarUrl}
          fallback={avatarFallback}
          size={compact ? "small" : "medium"}
        />
      ) : null)}
      <View style={[styles.content, !leftContent && !avatarUrl && !avatarFallback && styles.noLeftContent]}>
        <Typography
          variant={compact ? "body2" : "body1"}
          color={disabled ? COLORS.text.disabled : COLORS.text.primary}
          numberOfLines={1}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            color={disabled ? COLORS.text.disabled : COLORS.text.secondary}
            numberOfLines={1}
            style={styles.subtitle}
          >
            {subtitle}
          </Typography>
        )}
      </View>
      {rightContent}
    </>
  );

  const containerStyle = [
    styles.container,
    compact && styles.compactContainer,
    selected && styles.selected,
    disabled && styles.disabled,
    divider && styles.divider,
    style,
  ];

  if (onPress && !disabled) {
    return (
      <Pressable
        style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
        onPress={onPress}
      >
        {renderContent()}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background.primary,
  },
  compactContainer: {
    paddingVertical: SPACING.sm,
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  noLeftContent: {
    marginLeft: 0,
  },
  subtitle: {
    marginTop: SPACING.xs,
  },
  selected: {
    backgroundColor: COLORS.background.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
}); 