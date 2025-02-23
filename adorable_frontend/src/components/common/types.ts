import { StyleProp, ViewStyle, TextStyle } from 'react-native';

// Common props shared across components
export interface BaseComponentProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

// Common text props
export interface BaseTextProps extends BaseComponentProps {
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Input variants
export type InputVariant = 'default' | 'filled' | 'outlined';

// Typography variants
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

// Status types for components
export type ComponentStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

// Loading state types
export type LoadingSize = 'small' | 'medium' | 'large';

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale';

// Icon sizes
export type IconSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
