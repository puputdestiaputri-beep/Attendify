import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {
  // Shared values for animations
  const cloudLeftX = useSharedValue(0);
  const cloudRightX = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const logoFloat = useSharedValue(0);
  const gradientPosition = useSharedValue(0);

  useEffect(() => {
    // 1. Start Gradient Animation (Infinite loop)
    // We animate the gradient position by translating a larger gradient view
    gradientPosition.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      true
    );

    // Sequence of animations
    setTimeout(() => {
      // 2. Cloud Split (Awan membuka layar)
      cloudLeftX.value = withTiming(-width, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      });
      cloudRightX.value = withTiming(width, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      });

      // 3. Logo Reveal (Setelah awan mulai terbuka)
      setTimeout(() => {
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });

        // 4. Logo Floating (Loop naik turun)
        logoFloat.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(10, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );

        // 5. Navigate to Login after delay
        setTimeout(() => {
          // Note: AppNavigator stack names the screen 'Login'
          navigation.replace('Login');
        }, 2000);
      }, 500); // Logo appears mid-split
    }, 800); // Wait briefly before splitting clouds
  }, []);

  const cloudLeftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudLeftX.value }],
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width / 2 + 2, // Slight overlap to prevent seam
    zIndex: 2,
  }));

  const cloudRightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudRightX.value }],
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width / 2 + 2,
    zIndex: 2,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoFloat.value },
    ],
    zIndex: 1,
  }));

  const gradientStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradientPosition.value * 50 },
        { translateY: gradientPosition.value * 50 }
      ]
    };
  });

  return (
    <View style={styles.container}>
      {/* 1. Animated Gradient Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View style={[
          { 
            width: width * 1.5, 
            height: height * 1.5, 
            position: 'absolute', 
            top: -height * 0.25, 
            left: -width * 0.25 
          }, 
          gradientStyle
        ]}>
          <LinearGradient
            colors={['#0B1E5F', '#1E4FA8', '#2D6CDF', '#6846C1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </View>

      {/* 4. Glow & Logo */}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.glow} />
        <Image
          source={require('../assets/images/logo attendify.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 2 & 3. Cloud Split Animation */}
      {/* Cloud Left */}
      <Animated.View style={cloudLeftStyle}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${width/2} ${height}`} preserveAspectRatio="none">
          <Path
            d={`M0 0 L${width/2} 0 Q${width/2 - 20} ${height*0.2} ${width/2 - 10} ${height*0.4} T${width/2 - 30} ${height*0.7} Q${width/2 - 10} ${height*0.9} ${width/2} ${height} L0 ${height} Z`}
            fill="white"
            opacity="0.95"
          />
        </Svg>
      </Animated.View>

      {/* Cloud Right */}
      <Animated.View style={cloudRightStyle}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${width/2} ${height}`} preserveAspectRatio="none">
          <Path
            d={`M${width/2} 0 L0 0 Q20 ${height*0.2} 10 ${height*0.4} T30 ${height*0.7} Q10 ${height*0.9} 0 ${height} L${width/2} ${height} Z`}
            fill="white"
            opacity="0.95"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1E5F', // Fallback color
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    backgroundColor: '#6846C1',
    borderRadius: 90,
    opacity: 0.6,
    shadowColor: '#6846C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 20,
  },
});
