import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { BarChart3, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface AttendanceData {
  subject: string;
  attendance: number; // percentage
  total: number; // total classes
  attended: number; // classes attended
}

interface AttendanceChartProps {
  data: AttendanceData[];
  title?: string;
  showLegend?: boolean;
  containerStyle?: any;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ 
  data, 
  title,
  showLegend = true,
  containerStyle 
}) => {
  const maxValue = 100;
  const chartWidth = width - 60;

  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#22C55E'; // Green
    if (percentage >= 60) return '#EAB308'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <View style={containerStyle}>
      {title && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <BarChart3 color={Colors.ai.primary} size={20} />
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
      )}

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barColor = getColor(item.attendance);
          const barWidth = (item.attendance / maxValue) * (chartWidth - 100);

          return (
            <View key={index} style={styles.chartRow}>
              <View style={styles.labelCol}>
                <Text style={styles.label} numberOfLines={2}>{item.subject}</Text>
                <Text style={styles.meta}>{item.attended}/{item.total} kelas</Text>
              </View>

              <View style={styles.barSection}>
                <LinearGradient
                  colors={[barColor, `${barColor}80`]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.bar, { width: Math.max(barWidth, 5) }]}
                >
                  {item.attendance >= 30 && (
                    <Text style={styles.barText}>{item.attendance}%</Text>
                  )}
                </LinearGradient>

                {item.attendance < 30 && (
                  <Text style={styles.percentageText}>{item.attendance}%</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {showLegend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.legendText}>Baik (≥80%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
            <Text style={styles.legendText}>Cukup (60-79%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Kurang (60% ke bawah)</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  labelCol: {
    width: 90,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 14,
  },
  meta: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  barSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  barText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  percentageText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 24,
  },
  legend: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
