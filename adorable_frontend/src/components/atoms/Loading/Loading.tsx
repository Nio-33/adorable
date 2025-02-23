import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../../config/theme';
import { LoadingSize, BaseComponentProps } from '../../common/types';
import { Typography } from '../Typography';

export interface LoadingProps extends BaseComponentProps {
  size?: LoadingSize;
  color?: string;
  text?: string;
  fullscreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  color = COLORS.primary,
  text,
  style,
  fullscreen = false,
  testID,
}) => {
  const sizeMap: Record<LoadingSize, 'small' | 'large'> = {
    small: 'small',
    medium: 'large',
    large: 'large',
  };

  const containerStyle = [
    styles.container,
    fullscreen && styles.fullscreen,
    style,
  ];

  return (
    <View style={containerStyle} testID={testID}>
      <ActivityIndicator
        size={sizeMap[size]}
        color={color}
        style={size === 'large' && styles.largeSpinner}
      />
      {text && (
        <Typography
          variant="caption"
          color={COLORS.text.secondary}
          style={styles.text}
        >
          {text}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 999,
  },
  largeSpinner: {
    transform: [{ scale: 1.5 }],
  },
  text: {
    marginTop: 8,
  },
}); 