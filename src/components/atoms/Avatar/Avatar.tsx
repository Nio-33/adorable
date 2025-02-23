import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../../config/theme';
import { Typography } from '../Typography/Typography';

type AvatarSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | number;

const AVATAR_SIZES: Record<string, number> = {
  tiny: 24,
  small: 32,
  medium: 40,
  large: 48,
  xlarge: 56,
};

interface AvatarProps {
  size?: AvatarSize;
  uri?: string;
  fallback?: string;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 'medium',
  uri,
  fallback,
  style,
  imageStyle,
  textStyle,
  onPress,
}) => {
  const getSize = (size: AvatarSize): number => {
    if (typeof size === 'number') return size;
    return AVATAR_SIZES[size] || AVATAR_SIZES.medium;
  };

  const actualSize = getSize(size);
  const containerStyle: ViewStyle = {
    width: actualSize,
    height: actualSize,
    borderRadius: actualSize / 2,
  };

  const renderContent = () => {
    if (uri) {
      return (
        <Image
          source={{ uri }}
          style={[styles.image, {
            width: actualSize,
            height: actualSize,
            borderRadius: actualSize / 2,
          } as ImageStyle, imageStyle]}
          resizeMode="cover"
        />
      );
    }

    if (fallback) {
      return (
        <View style={[styles.fallback, containerStyle, style]}>
          <Typography
            variant="body1"
            color={COLORS.text.inverse}
            style={[
              styles.fallbackText,
              { fontSize: actualSize * 0.4 },
              textStyle,
            ] as TextStyle}
          >
            {fallback.toUpperCase()}
          </Typography>
        </View>
      );
    }

    return (
      <View style={[styles.placeholder, containerStyle, style]}>
        <Typography
          variant="body1"
          color={COLORS.text.disabled}
          style={[
            styles.fallbackText,
            { fontSize: actualSize * 0.4 },
            textStyle,
          ] as TextStyle}
        >
          ?
        </Typography>
      </View>
    );
  };

  return (
    <View style={[containerStyle, style]} onTouchEnd={onPress}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: COLORS.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontWeight: '600',
  },
}); 