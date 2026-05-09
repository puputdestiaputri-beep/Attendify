import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const GRADIENT_WIDTH = width * 2;

export default function AnimatedBackground({ children, style }: AnimatedBackgroundProps) {
  const translateX = useSharedValue(0);
  const { themeColors, isLightTheme } = require('../../context/ThemeContext').useTheme();

  useEffect(() => {
    if (isLightTheme) {
      translateX.value = 0;
      return;
    }
    translateX.value = withRepeat(
      withTiming(-width, {
        duration: 8000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [isLightTheme]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const colors: readonly [string, string, ...string[]] =
    themeColors && themeColors.length > 0
      ? (themeColors as [string, string, ...string[]])
      : ['#0B1E5F', '#1E4FA8', '#2D6CDF', '#6846C1', '#2D6CDF', '#1E4FA8', '#0B1E5F'];

  return (
    <View style={[styles.container, style, isLightTheme && { backgroundColor: colors[0] }]}>
      <Animated.View style={[styles.gradientContainer, animatedStyle]}>
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.gradient}
        />
      </Animated.View>
      {isLightTheme && (
        <View style={styles.lightOverlay} pointerEvents="none" />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#0B1E5F',
  },
  gradientContainer: {
    position: 'absolute',
    top: -height * 0.2,
    left: 0,
    width: GRADIENT_WIDTH,
    height: height * 1.4,
  },
  gradient: {
    flex: 1,
  },
  lightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  content: {
    flex: 1,
  },
});
