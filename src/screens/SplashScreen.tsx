import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

// ── Floating Particles ──────────────────────────────────────
const Particles = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {[...Array(20)].map((_, i) => {
        const translateY = useSharedValue(Math.random() * height);
        const opacity = useSharedValue(Math.random() * 0.5 + 0.1);

        useEffect(() => {
          translateY.value = withRepeat(
            withTiming(translateY.value - 150 - Math.random() * 100, {
              duration: 4000 + Math.random() * 4000,
              easing: Easing.linear,
            }),
            -1,
            true
          );
          opacity.value = withRepeat(
            withTiming(Math.random() * 0.8 + 0.2, {
              duration: 2000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true
          );
        }, []);

        const style = useAnimatedStyle(() => ({
          transform: [{ translateY: translateY.value }],
          opacity: opacity.value,
          position: 'absolute',
          left: Math.random() * width,
          width: Math.random() * 4 + 2,
          height: Math.random() * 4 + 2,
          backgroundColor: '#E2E8F0',
          borderRadius: 4,
          shadowColor: '#fff',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
        }));

        return <Animated.View key={i} style={style} />;
      })}
    </View>
  );
};

// ── Cute View-based Robot ───────────────────────────────────
const Robot = ({ armRotation }: { armRotation: any }) => {
  const armStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -15 },
      { rotate: `${armRotation.value}deg` },
      { translateY: 15 },
    ],
  }));

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Antenna */}
      <View style={{ width: 4, height: 12, backgroundColor: '#94A3B8' }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#EF4444',
            position: 'absolute',
            top: -6,
            left: -3,
            shadowColor: '#EF4444',
            shadowOpacity: 1,
            shadowRadius: 8,
          }}
        />
      </View>
      {/* Head */}
      <View
        style={{
          width: 60,
          height: 45,
          backgroundColor: '#F8FAFC',
          borderRadius: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2,
          shadowColor: '#3B82F6',
          shadowOpacity: 0.3,
          shadowRadius: 10,
        }}
      >
        {/* Eyes */}
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#3B82F6', marginRight: 8 }} />
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#3B82F6' }} />
      </View>
      {/* Body & Arms */}
      <View style={{ flexDirection: 'row', marginTop: -4, zIndex: 1 }}>
        {/* Left Arm (Waving) */}
        <Animated.View
          style={[
            {
              width: 16,
              height: 40,
              backgroundColor: '#CBD5E1',
              borderRadius: 8,
              marginRight: 2,
              marginTop: 10,
            },
            armStyle,
          ]}
        />
        {/* Main Body */}
        <View style={{ width: 70, height: 55, backgroundColor: '#E2E8F0', borderRadius: 16 }}>
          {/* Core light */}
          <View
            style={{
              width: 20,
              height: 8,
              backgroundColor: '#10B981',
              borderRadius: 4,
              alignSelf: 'center',
              marginTop: 15,
              shadowColor: '#10B981',
              shadowOpacity: 1,
              shadowRadius: 5,
            }}
          />
        </View>
        {/* Right Arm */}
        <View
          style={{
            width: 16,
            height: 40,
            backgroundColor: '#CBD5E1',
            borderRadius: 8,
            marginLeft: 2,
            marginTop: 10,
          }}
        />
      </View>
    </View>
  );
};

export default function SplashScreen({ navigation }: any) {
  // ── Shared Values ─────────────────────────────────────────
  const screenOpacity = useSharedValue(1);
  const gradientPosition = useSharedValue(0);

  // Robot / Portal Animations
  const portalScale = useSharedValue(0);
  const robotTranslateY = useSharedValue(150);
  const robotOpacity = useSharedValue(0);
  const armRotate = useSharedValue(0);

  // Logo / Text Animations
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const glowScale = useSharedValue(0.8);
  const loaderOpacity = useSharedValue(0);

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playSplashSound = async () => {
    try {
      // const { sound: audioSound } = await Audio.Sound.createAsync(require('../assets/splash.mp3'));
      // setSound(audioSound);
      // await audioSound.setVolumeAsync(0.4);
      // await audioSound.playAsync();
    } catch (error) {
      // Ignore gracefully if sound is missing
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    // 1. Background slow movement
    gradientPosition.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      true
    );

    // 2. Start Cinematic Sequence
    setTimeout(() => {
      // Open Portal
      portalScale.value = withSpring(1, { damping: 12, stiffness: 80 });

      setTimeout(() => {
        // Robot rises up and fades in
        playSplashSound();
        robotOpacity.value = withTiming(1, { duration: 400 });
        robotTranslateY.value = withTiming(0, {
          duration: 900,
          easing: Easing.out(Easing.exp),
        });

        setTimeout(() => {
          // Robot waves right hand (swing up, wave, swing down)
          armRotate.value = withSequence(
            withTiming(140, { duration: 250, easing: Easing.out(Easing.ease) }),
            withTiming(100, { duration: 200, easing: Easing.inOut(Easing.ease) }),
            withTiming(140, { duration: 200, easing: Easing.inOut(Easing.ease) }),
            withTiming(100, { duration: 200, easing: Easing.inOut(Easing.ease) }),
            withTiming(140, { duration: 200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
          );

          setTimeout(() => {
            // Robot and portal fade out
            robotOpacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });
            portalScale.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) });

            setTimeout(() => {
              // Logo Appears
              glowScale.value = withRepeat(
                withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
              );
              logoOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
              logoScale.value = withSpring(1, { damping: 14, stiffness: 90 });

              // Text Appears
              textOpacity.value = withDelay(
                300,
                withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) })
              );
              textTranslateY.value = withDelay(
                300,
                withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) })
              );

              // Loader Appears
              loaderOpacity.value = withDelay(
                800,
                withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
              );

              // Final Transition to Login
              setTimeout(() => {
                screenOpacity.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) });
                setTimeout(() => {
                  navigation.replace('Login');
                }, 600);
              }, 2500);
            }, 600); // Wait for fade out
          }, 1500); // Wait for waving
        }, 900); // Wait for rise
      }, 400); // Wait for portal
    }, 200);
  }, []);

  // ── Animated Styles ───────────────────────────────────────
  const screenStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: screenOpacity.value,
  }));

  const gradientStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: gradientPosition.value * 30 },
      { translateY: gradientPosition.value * 30 },
    ],
  }));

  const portalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: portalScale.value }, { scaleY: 0.3 }],
    opacity: portalScale.value,
  }));

  const robotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: robotTranslateY.value }],
    opacity: robotOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
    alignItems: 'center',
    position: 'absolute',
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
    marginTop: 280, // push below larger logo
    alignItems: 'center',
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
    marginTop: 30,
  }));

  return (
    <Animated.View style={screenStyle}>
      <View style={styles.container}>
        {/* Background Gradient */}
        <View style={StyleSheet.absoluteFillObject}>
          <Animated.View
            style={[
              {
                width: width * 1.5,
                height: height * 1.5,
                position: 'absolute',
                top: -height * 0.25,
                left: -width * 0.25,
              },
              gradientStyle,
            ]}
          >
            <LinearGradient
              colors={['#0F172A', '#1E4FA8', '#2D6CDF', '#6846C1', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        </View>

        {/* Particles */}
        <Particles />

        {/* Robot Intro Scene (Centered but slightly lower) */}
        <View style={styles.sceneContainer}>
          <Animated.View style={[styles.portal, portalStyle]} />
          <Animated.View style={[styles.robotWrapper, robotStyle]}>
            <Robot armRotation={armRotate} />
          </Animated.View>
        </View>

        {/* Main Logo & Text Content */}
        <View style={styles.contentContainer} pointerEvents="none">
          <Animated.View style={logoStyle}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <Image
              source={require('../assets/images/logo_attendify.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View style={textStyle}>
            <Text style={styles.subtitle}> </Text>
          </Animated.View>

          <Animated.View style={[styles.loaderContainer, loaderStyle]}>
            <AnimatedLoader />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Custom Loading Dots ─────────────────────────────────────
const AnimatedLoader = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dot: any, delay: number) => {
      dot.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    };
    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, []);

  const createDotStyle = (dot: any) =>
    useAnimatedStyle(() => ({
      opacity: dot.value * 0.8 + 0.2,
      transform: [{ translateY: dot.value * -6 }],
    }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, createDotStyle(dot1)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot2)]} />
      <Animated.View style={[styles.dot, createDotStyle(dot3)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  sceneContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    top: '10%', // slightly below center
  },
  portal: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(96, 165, 250, 0.4)',
    shadowColor: '#60A5FA',
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
    top: '50%',
  },
  robotWrapper: {
    position: 'absolute',
    bottom: '48%', // Ensure it comes out right above the portal
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 260,
    height: 260,
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    backgroundColor: '#6846C1',
    borderRadius: 130,
    opacity: 0.5,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#cbd5e1',
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.9,
  },
  loaderContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
