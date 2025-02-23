import React from 'react';
import { Text, TextStyle, StyleSheet, StyleProp } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../../config/theme';

type TypographyVariant = keyof typeof TYPOGRAPHY;

interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  onPress?: () => void;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  color = COLORS.text.primary,
  style,
  numberOfLines,
  onPress,
}) => {
  return (
    <Text
      style={[styles[variant], { color }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create(
  Object.entries(TYPOGRAPHY).reduce((acc, [key, value]) => {
    acc[key as TypographyVariant] = value;
    return acc;
  }, {} as Record<TypographyVariant, TextStyle>)
);
