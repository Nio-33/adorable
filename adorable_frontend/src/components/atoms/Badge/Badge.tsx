import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { Typography } from '../Typography';
import { ComponentStatus, BaseComponentProps } from '../../common/types';

export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface BadgeProps extends BaseComponentProps {
  content?: string | number;
  size?: BadgeSize;
  status?: ComponentStatus;
  position?: BadgePosition;
  standalone?: boolean;
  dot?: boolean;
  children?: React.ReactNode;
}

const BADGE_SIZES: Record<BadgeSize, number> = {
  small: 16,
  medium: 20,
  large: 24,
};

export const Badge: React.FC<BadgeProps> = ({
  content,
  size = 'medium',
  status = 'default',
  position = 'top-right',
  standalone = false,
  dot = false,
  children,
  style,
  testID,
}) => {
  const badgeSize = BADGE_SIZES[size];
  const isDot = dot || !content;
  const minWidth = isDot ? badgeSize : badgeSize * 1.5;

  const badgeStyle: StyleProp<ViewStyle> = [
    styles.badge,
    styles[`${status}Badge`],
    {
      minWidth,
      height: badgeSize,
      borderRadius: badgeSize / 2,
    },
    !standalone && styles[position],
    isDot && { width: badgeSize },
    style,
  ];

  const renderBadge = () => (
    <View style={badgeStyle} testID={testID}>
      {!isDot && (
        <Typography
          variant="caption"
          color={COLORS.text.inverse}
          textStyle={styles.content}
        >
          {content}
        </Typography>
      )}
    </View>
  );

  if (standalone) {
    return renderBadge();
  }

  return (
    <View style={styles.container}>
      {children}
      {renderBadge()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  content: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: TYPOGRAPHY.lineHeight.xs,
  } as TextStyle,
  // Status styles
  defaultBadge: {
    backgroundColor: COLORS.primary,
  },
  successBadge: {
    backgroundColor: COLORS.status.success,
  },
  warningBadge: {
    backgroundColor: COLORS.status.warning,
  },
  errorBadge: {
    backgroundColor: COLORS.status.error,
  },
  infoBadge: {
    backgroundColor: COLORS.status.info,
  },
  // Position styles
  'top-right': {
    position: 'absolute',
    top: -SPACING.xs,
    right: -SPACING.xs,
  },
  'top-left': {
    position: 'absolute',
    top: -SPACING.xs,
    left: -SPACING.xs,
  },
  'bottom-right': {
    position: 'absolute',
    bottom: -SPACING.xs,
    right: -SPACING.xs,
  },
  'bottom-left': {
    position: 'absolute',
    bottom: -SPACING.xs,
    left: -SPACING.xs,
  },
}); 