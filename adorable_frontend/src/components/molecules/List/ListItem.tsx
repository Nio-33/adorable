import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { Typography } from '../../atoms/Typography';
import { BaseComponentProps } from '../../common/types';

export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string | null | undefined;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  avatar?: ImageSourcePropType;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  divider?: boolean;
  compact?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftContent,
  rightContent,
  avatar,
  onPress,
  selected = false,
  disabled = false,
  divider = true,
  compact = false,
  style,
  testID,
}) => {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    compact ? styles.compactContainer : styles.defaultContainer,
    selected && styles.selectedContainer,
    disabled && styles.disabledContainer,
    divider && styles.divider,
    style,
  ];

  const content = (
    <>
      {leftContent && <View style={styles.leftContent}>{leftContent}</View>}
      
      {avatar && (
        <Image
          source={avatar}
          style={compact ? styles.compactAvatar : styles.avatar}
        />
      )}
      
      <View style={styles.content}>
        <Typography
          variant={compact ? 'body2' : 'body1'}
          color={disabled ? COLORS.text.tertiary : COLORS.text.primary}
          numberOfLines={1}
        >
          {title}
        </Typography>
        
        {subtitle != null && (
          <Typography
            variant="caption"
            color={disabled ? COLORS.text.tertiary : COLORS.text.secondary}
            numberOfLines={compact ? 1 : 2}
            style={styles.subtitle}
          >
            {subtitle}
          </Typography>
        )}
      </View>
      
      {rightContent && (
        <View style={styles.rightContent}>{rightContent}</View>
      )}
    </>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  defaultContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    minHeight: 64,
  },
  compactContainer: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  selectedContainer: {
    backgroundColor: COLORS.background.secondary,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  leftContent: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.md,
  },
  compactAvatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: SPACING.xs,
  },
  rightContent: {
    marginLeft: SPACING.md,
  },
}); 