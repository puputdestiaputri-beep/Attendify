import React, { useEffect } from 'react';
import {
  View, StyleSheet, Text, Animated, ViewStyle
} from 'react-native';
import { DesignSystem } from '../../constants/DesignSystem';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'profile' | 'dashboard';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
}) => {
  switch (variant) {
    case 'list':
      return (
        <View style={styles.listContainer}>
          {[...Array(4)].map((_, i) => (
            <View key={i} style={styles.listItem}>
              <Skeleton width={40} height={40} borderRadius={20} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={12} />
              </View>
            </View>
          ))}
        </View>
      );

    case 'profile':
      return (
        <View style={styles.profileContainer}>
          <Skeleton width={80} height={80} borderRadius={40} style={styles.avatar} />
          <Skeleton width="60%" height={18} style={styles.nameLoader} />
          <Skeleton width="40%" height={14} style={styles.roleLoader} />
          <View style={styles.statsRow}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} width="28%" height={60} style={{ marginRight: 8 }} />
            ))}
          </View>
        </View>
      );

    case 'dashboard':
      return (
        <View style={styles.dashboardContainer}>
          <View style={styles.cardRow}>
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} width="48%" height={100} style={{ marginRight: i === 0 ? 8 : 0 }} />
            ))}
          </View>
          <Skeleton width="100%" height={200} style={styles.chartLoader} />
          <Skeleton width="100%" height={150} style={styles.tableLoader} />
        </View>
      );

    case 'card':
    default:
      return (
        <View style={styles.cardContainer}>
          <Skeleton width="100%" height={150} borderRadius={12} />
          <Skeleton width="80%" height={16} style={styles.titleLoader} />
          <Skeleton width="90%" height={12} style={styles.descLoader} />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: DesignSystem.colors.glass,
    borderColor: DesignSystem.colors.glassBorder,
    borderWidth: 1,
  },
  listContainer: {
    gap: 12,
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  nameLoader: {
    marginBottom: 8,
  },
  roleLoader: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 16,
    width: '100%',
  },
  cardContainer: {
    padding: 16,
    gap: 12,
  },
  titleLoader: {
    marginVertical: 8,
  },
  descLoader: {
    marginVertical: 4,
  },
  chartLoader: {
    marginVertical: 16,
    borderRadius: 12,
  },
  tableLoader: {
    marginVertical: 16,
    borderRadius: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
});

export default SkeletonLoader;
