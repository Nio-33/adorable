import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  ViewProps,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../config/theme';
import { Typography } from '../../atoms/Typography';
import { BaseComponentProps } from '../../common/types';

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: ImageSourcePropType;
  imageAspectRatio?: number;
  onPress?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  elevated?: boolean;
  bordered?: boolean;
  padding?: keyof typeof SPACING;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  image,
  imageAspectRatio = 16 / 9,
  onPress,
  children,
  footer,
  header,
  elevated = true,
  bordered = false,
  padding = 'md',
  style,
  testID,
}) => {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    elevated && styles.elevated,
    bordered && styles.bordered,
    style,
  ];

  const contentStyle: StyleProp<ViewStyle> = [
    styles.content,
    { padding: SPACING[padding] },
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.8}
        testID={testID}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {renderContent()}
    </View>
  );

  function renderContent() {
    return (
      <>
        {header}
        
        {image && (
          <Image
            source={image}
            style={[styles.image, { aspectRatio: imageAspectRatio }]}
            resizeMode="cover"
          />
        )}

        <View style={contentStyle}>
          {title && (
            <Typography variant="subtitle1" style={styles.title}>
              {title}
            </Typography>
          )}
          
          {subtitle && (
            <Typography
              variant="body2"
              color={COLORS.text.secondary}
              style={styles.subtitle}
            >
              {subtitle}
            </Typography>
          )}

          {children}
        </View>

        {footer && <View style={styles.footer}>{footer}</View>}
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  elevated: {
    ...SHADOWS.medium,
  },
  bordered: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  image: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    marginBottom: SPACING.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    padding: SPACING.md,
  },
}); 