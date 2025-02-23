import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ImageSourcePropType,
  TextStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../../config/theme';
import { Typography } from '../Typography';
import { BaseComponentProps } from '../../common/types';

export type AvatarSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps extends BaseComponentProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  backgroundColor?: string;
}

const AVATAR_SIZES: Record<AvatarSize, number> = {
  tiny: 24,
  small: 32,
  medium: 40,
  large: 48,
  xlarge: 56,
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  shape = 'circle',
  backgroundColor = COLORS.primary,
  style,
  testID,
}) => {
  const [imageError, setImageError] = useState(false);

  const containerSize = AVATAR_SIZES[size];
  const fontSize = containerSize * 0.4;
  const initials = name
    ? name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    {
      width: containerSize,
      height: containerSize,
      borderRadius: shape === 'circle' ? containerSize / 2 : BORDER_RADIUS.md,
      backgroundColor: !source || imageError ? backgroundColor : undefined,
    },
    style,
  ];

  const textStyle: StyleProp<TextStyle> = {
    fontSize,
  };

  const renderContent = () => {
    if (source && !imageError) {
      return (
        <Image
          source={source}
          style={[
            styles.image,
            {
              borderRadius: shape === 'circle' ? containerSize / 2 : BORDER_RADIUS.md,
            },
          ]}
          onError={() => setImageError(true)}
        />
      );
    }

    if (name) {
      return (
        <Typography
          variant="body2"
          color={COLORS.text.inverse}
          textStyle={textStyle}
        >
          {initials}
        </Typography>
      );
    }

    return null;
  };

  return (
    <View style={containerStyle} testID={testID}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
}); 