import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface RealtimeIndicatorProps {
  label?: string;
  color?: string;
}

export default function RealtimeIndicator({ label = 'LIVE', color = '#10B981' }: RealtimeIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { backgroundColor: color, opacity: pulseAnim }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
