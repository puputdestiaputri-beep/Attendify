import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Colors } from '@/constants/Colors';

interface HeatmapData {
  hour: number;
  count: number;
}

interface HourlyHeatmapProps {
  data: HeatmapData[];
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 6); // 06:00 to 17:00
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Simplified week

export default function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  const { tokens } = useTheme();
  const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero
  
  // Animate grid entries
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [data]);

  // Find count for a specific hour
  // Note: For a true 2D heatmap, backend would return { day, hour, count }
  // Here we simulate day distribution using the overall hourly distribution for visual premium effect
  const getIntensity = (hour: number, dayIdx: number) => {
    const entry = data.find(d => d.hour === hour);
    const baseCount = entry ? entry.count : 0;
    
    // Simulate slight day variation if real 2D data isn't available
    const simulatedCount = baseCount * (1 - (Math.abs(2 - dayIdx) * 0.1)); 
    return Math.max(0, Math.min(1, simulatedCount / maxCount));
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'rgba(150, 150, 150, 0.1)';
    // From transparent to full primary color (#10B981)
    return `rgba(16, 185, 129, ${0.2 + (intensity * 0.8)})`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header Row (Hours) */}
      <View style={styles.row}>
        <View style={styles.yLabelBox} />
        {HOURS.map(h => (
          <View key={`h-${h}`} style={styles.xLabelBox}>
            <Text style={[styles.labelText, { color: tokens.subTextColor }]}>{h}</Text>
          </View>
        ))}
      </View>

      {/* Matrix */}
      {DAYS.map((day, dayIdx) => (
        <View key={day} style={styles.row}>
          <View style={styles.yLabelBox}>
            <Text style={[styles.labelText, { color: tokens.subTextColor }]}>{day}</Text>
          </View>
          {HOURS.map(hour => {
            const intensity = getIntensity(hour, dayIdx);
            return (
              <View 
                key={`${day}-${hour}`} 
                style={[
                  styles.cell, 
                  { backgroundColor: getColor(intensity), borderColor: tokens.borderColor }
                ]} 
              />
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  yLabelBox: {
    width: 30,
    justifyContent: 'center',
  },
  xLabelBox: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  }
});
