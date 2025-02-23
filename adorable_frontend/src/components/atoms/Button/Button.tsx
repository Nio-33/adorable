import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';
import { Typography } from '../Typography/Typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) {return COLORS.disabled;}
    switch (variant) {
      case 'primary':
        return COLORS.primary.main;
      case 'secondary':
        return COLORS.secondary.main;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return COLORS.primary.main;
    }
  };

  const getTextColor = () => {
    if (disabled) {return COLORS.text.disabled;}
    switch (variant) {
      case 'primary':
      case 'secondary':
        return COLORS.text.inverse;
      case 'outline':
      case 'text':
        return COLORS.primary.main;
      default:
        return COLORS.text.inverse;
    }
  };

  const getBorderColor = () => {
    if (disabled) {return COLORS.disabled;}
    switch (variant) {
      case 'outline':
        return COLORS.primary.main;
      default:
        return 'transparent';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return SPACING.sm;
      case 'large':
        return SPACING.lg;
      default:
        return SPACING.md;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          padding: getPadding(),
          width: fullWidth ? '100%' : undefined,
        },
        variant === 'text' && styles.textButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.text.inverse : COLORS.primary.main}
          size="small"
        />
      ) : (
        <Typography
          variant="button"
          color={getTextColor()}
          style={[styles.text, textStyle]}
        >
          {children}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textButton: {
    padding: 0,
    borderWidth: 0,
  },
  text: {
    textAlign: 'center',
  },
});
