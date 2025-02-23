import React from 'react';
import { Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../../config/theme';
import { TypographyVariant, BaseTextProps } from '../../common/types';

export interface TypographyProps extends BaseTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color,
  align = 'left',
  style,
  textStyle,
  numberOfLines,
  children,
  testID,
}) => {
  const textStyles: StyleProp<TextStyle> = [
    styles.base,
    styles[variant],
    {
      color: color || COLORS.text.primary,
      textAlign: align,
    },
    textStyle,
  ];

  return (
    <Text
      style={textStyles}
      numberOfLines={numberOfLines}
      testID={testID}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  h1: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    lineHeight: TYPOGRAPHY.lineHeight.xxxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  h2: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    lineHeight: TYPOGRAPHY.lineHeight.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  h3: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    lineHeight: TYPOGRAPHY.lineHeight.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  h4: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: TYPOGRAPHY.lineHeight.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  subtitle1: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    lineHeight: TYPOGRAPHY.lineHeight.lg,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  subtitle2: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  body1: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
  },
  body2: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    lineHeight: TYPOGRAPHY.lineHeight.sm,
  },
  caption: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: TYPOGRAPHY.lineHeight.xs,
  },
  button: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: TYPOGRAPHY.lineHeight.md,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textTransform: 'uppercase',
  },
  overline: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    lineHeight: TYPOGRAPHY.lineHeight.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
}); 