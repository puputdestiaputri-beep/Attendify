import React from 'react';
import {
  View, StyleSheet, ViewStyle, Text, TouchableOpacity
} from 'react-native';
import Animated, {
  FadeInUp, SlideInRight, useSharedValue,
  useAnimatedStyle, withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/constants/DesignSystem';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  gradient?: [string, string, string?];
  style?: ViewStyle;
  delay?: number;
  onPress?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  gradient,
  style,
  delay = 0,
  onPress,
}) => {
  const { tokens, isLightTheme } = useTheme();
  const scaleValue = useSharedValue(1);

  const animatedScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handlePressIn = () => {
    scaleValue.value = withSpring(1.02, {
      damping: 10,
      mass: 1,
    });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, {
      damping: 10,
      mass: 1,
    });
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={[animatedScaleStyle]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <BlurView intensity={DesignSystem.blur} tint={isLightTheme ? 'light' : 'dark'} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={(gradient || (isLightTheme ? ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.9)'] : [DesignSystem.colors.glass, DesignSystem.colors.surfaceVariant])) as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </BlurView>

        <View style={styles.content}>
          <View style={styles.header}>
            {Icon && (
              <View style={[styles.iconContainer, { borderColor: iconColor || tokens.borderColor, backgroundColor: isLightTheme ? 'rgba(30, 79, 168, 0.05)' : 'rgba(255,255,255,0.05)' }]}>
                <Icon size={24} color={iconColor || (isLightTheme ? '#1E4FA8' : DesignSystem.colors.primary)} />
              </View>
            )}
            <Text style={[styles.title, { color: tokens.subTextColor }]} numberOfLines={1}>{title}</Text>
          </View>

          <View style={styles.valueSection}>
            <Text style={[styles.value, { color: tokens.textColor }]}>{value}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: tokens.subTextColor }]}>{subtitle}</Text>}
          </View>
        </View>

        {/* Border */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderWidth: 1,
              borderColor: tokens.borderColor,
              borderRadius: DesignSystem.radius.lg,
            },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignSystem.radius.lg,
    padding: 16,
    overflow: 'hidden',
    ...DesignSystem.shadows.card,
  },
  content: {
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 79, 168, 0.1)',
  },
  title: {
    flex: 1,
    fontSize: DesignSystem.typography.caption,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  valueSection: {
    marginTop: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: DesignSystem.typography.caption,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
});

export default DashboardCard;
