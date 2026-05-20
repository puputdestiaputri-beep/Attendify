import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BlurView } from 'expo-blur';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'solid' | 'glass';
  padding?: number;
}

export default function AppCard({ children, style, variant = 'glass', padding = 16 }: AppCardProps) {
  const { tokens, isLightTheme } = useTheme();

  const baseStyle: ViewStyle = {
    padding,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.borderColor,
    overflow: 'hidden',
  };

  if (variant === 'glass') {
    return (
      <BlurView intensity={isLightTheme ? 40 : 20} tint={isLightTheme ? 'light' : 'dark'} style={[baseStyle, style]}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[baseStyle, { backgroundColor: tokens.cardBg }, style]}>
      {children}
    </View>
  );
}
