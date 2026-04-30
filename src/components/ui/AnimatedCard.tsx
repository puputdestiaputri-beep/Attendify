import React from 'react';
import {
  View, StyleSheet, ViewStyle, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown, useSharedValue,
  useAnimatedStyle, withSpring
} from 'react-native-reanimated';
import { DesignSystem } from '../../../constants/DesignSystem';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'glass' | 'gradient' | 'surface';
  gradient?: [string, string, string?];
  delay?: number;
  enableScale?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  onPress,
  variant = 'glass',
  gradient,
  delay = 0,
  enableScale = true,
}) => {
  const scaleValue = useSharedValue(1);
  
  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    if (enableScale) {
      scaleValue.value = withSpring(1.02, {
        damping: 10,
        mass: 1,
        overshootClamping: false,
      });
    }
  };

  const handlePressOut = () => {
    if (enableScale) {
      scaleValue.value = withSpring(1, {
        damping: 10,
        mass: 1,
        overshootClamping: false,
      });
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'gradient':
        return undefined;
      case 'surface':
        return DesignSystem.colors.surface;
      case 'glass':
      default:
        return DesignSystem.colors.glass;
    }
  };

const getGradientColors = (): readonly [string, string] | readonly [string, string, string] => {
    if (gradient) return gradient as unknown as readonly [string, string, string];
    if (variant === 'gradient') {
      return DesignSystem.gradients.primary;
    }
    return [DesignSystem.colors.glass, DesignSystem.colors.surfaceVariant];
  };

  const content = (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[animatedScaleStyle]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <View
        style={[
          styles.card,
          variant === 'gradient' ? styles.gradientCard : styles.glassCard,
          style,
        ]}
      >
        {variant === 'glass' && (
          <BlurView intensity={DesignSystem.blur} style={StyleSheet.absoluteFill}>
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: DesignSystem.colors.glass,
                  borderColor: DesignSystem.colors.glassBorder,
                  borderWidth: 1,
                },
              ]}
            />
          </BlurView>
        )}
        {variant === 'gradient' && (
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {variant === 'surface' && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: getBackgroundColor() },
            ]}
          />
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </Animated.View>
  );

  if (onPress) {
    return content;
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    ...DesignSystem.shadows.card,
  },
  gradientCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  glassCard: {
    borderWidth: 1,
    borderColor: DesignSystem.colors.glassBorder,
  },
  content: {
    zIndex: 1,
  },
});

export default AnimatedCard;
