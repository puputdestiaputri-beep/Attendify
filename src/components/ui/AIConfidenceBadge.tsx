import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BrainCircuit } from 'lucide-react-native';

interface AIConfidenceBadgeProps {
  confidence: number; // 0 to 100
}

export default function AIConfidenceBadge({ confidence }: AIConfidenceBadgeProps) {
  let color = '#EF4444'; // default red
  if (confidence >= 95) color = '#10B981'; // Green (VERIFIED)
  else if (confidence >= 80) color = '#F59E0B'; // Orange (REVIEW_REQUIRED)

  return (
    <View style={[styles.container, { borderColor: color, backgroundColor: `${color}15` }]}>
      <BrainCircuit size={14} color={color} />
      <Text style={[styles.text, { color }]}>{confidence.toFixed(1)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    alignSelf: 'flex-start'
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
  }
});
