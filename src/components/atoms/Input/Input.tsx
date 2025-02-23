import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../config/theme';
import { Typography } from '../Typography/Typography';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography
          variant="body2"
          color={error ? COLORS.error : COLORS.text.primary}
          style={styles.label}
        >
          {label}
        </Typography>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
          style,
        ].filter(Boolean) as StyleProp<ViewStyle>}
      >
        <TextInput
          {...textInputProps}
          style={[styles.input, inputStyle]}
          placeholderTextColor={COLORS.text.secondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      {error && (
        <Typography
          variant="caption"
          color={COLORS.error}
          style={styles.errorText}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
    overflow: 'hidden',
  },
  input: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  focused: {
    borderColor: COLORS.primary.main,
  },
  error: {
    borderColor: COLORS.error,
  },
  errorText: {
    marginTop: SPACING.xs,
  },
}); 