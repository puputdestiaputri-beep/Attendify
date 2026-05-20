import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}

export default function AnalyticsCard({ title, value, subtitle, icon, trend, trendValue, color = '#3B82F6' }: AnalyticsCardProps) {
  const { tokens, isLightTheme } = useTheme();
  
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 40, friction: 7 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true })
    ]).start();
  }, [value]); // Re-animate when value changes significantly (optional)

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim, flex: 1 }}>
      <BlurView intensity={isLightTheme ? 40 : 20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.card, { borderColor: tokens.borderColor, backgroundColor: tokens.cardBg }]}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
            {icon}
          </View>
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)' }]}>
              <Text style={{ 
                fontSize: 10, 
                fontWeight: 'bold', 
                color: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#9CA3AF' 
              }}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.body}>
          <Text style={[styles.value, { color: tokens.textColor }]}>{value}</Text>
          <Text style={[styles.title, { color: tokens.subTextColor }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: tokens.subTextColor }]}>{subtitle}</Text>}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 140,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  body: {
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 10,
    opacity: 0.8,
  }
});
