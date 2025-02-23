import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../config/theme';
import { InputVariant, BaseComponentProps } from '../../common/types';
import { Typography } from '../Typography';

export interface InputProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  variant?: InputVariant;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  variant = 'default',
  placeholder,
  label,
  error,
  helperText,
  secureTextEntry = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  style,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onFocus,
  onBlur,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    variant && styles[`${variant}Container`],
    isFocused && styles.focusedContainer,
    error && styles.errorContainer,
    disabled && styles.disabledContainer,
    style,
  ];

  const inputStyles: StyleProp<TextStyle> = [
    styles.input,
    variant && styles[`${variant}Input`],
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    error && styles.errorInput,
    disabled && styles.disabledInput,
  ];

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Typography
          variant="caption"
          color={error ? COLORS.status.error : COLORS.text.secondary}
          style={styles.label}
        >
          {label}
        </Typography>
      )}
      
      <View style={containerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={inputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.tertiary}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {(error || helperText) && (
        <Typography
          variant="caption"
          color={error ? COLORS.status.error : COLORS.text.tertiary}
          style={styles.helperText}
        >
          {error || helperText}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background.secondary,
  },
  defaultContainer: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  filledContainer: {
    backgroundColor: COLORS.background.tertiary,
  },
  outlinedContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  focusedContainer: {
    borderColor: COLORS.primary,
  },
  errorContainer: {
    borderColor: COLORS.status.error,
  },
  disabledContainer: {
    backgroundColor: COLORS.background.tertiary,
    borderColor: COLORS.border.light,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
  },
  defaultInput: {},
  filledInput: {},
  outlinedInput: {},
  inputWithLeftIcon: {
    paddingLeft: SPACING.xs,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.xs,
  },
  errorInput: {
    color: COLORS.status.error,
  },
  disabledInput: {
    color: COLORS.text.tertiary,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  helperText: {
    marginTop: SPACING.xs,
  },
  leftIcon: {
    paddingLeft: SPACING.md,
  },
  rightIcon: {
    paddingRight: SPACING.md,
  },
}); 