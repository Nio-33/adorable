import React from 'react';
import { LucideIcon } from 'lucide-react-native';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 24,
  color = '#000',
  strokeWidth = 2,
}) => {
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
};
