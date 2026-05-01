import React from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, ViewStyle
} from 'react-native';
import Animated, {
  FadeInRight, useSharedValue,
  useAnimatedStyle, withSpring
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/constants/DesignSystem';
import { LucideIcon, ChevronRight } from 'lucide-react-native';

interface StudentCardProps {
  id: string | number;
  name: string;
  identifier: string; // NIM or username
  status?: 'hadir' | 'telat' | 'tidak-hadir' | 'absent';
  waktu?: string;
  avatar?: string;
  icon?: LucideIcon;
  iconColor?: string;
  gradient?: [string, string, string?];
  style?: ViewStyle;
  delay?: number;
  onPress?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  name,
  identifier,
  status = 'hadir',
  waktu,
  avatar,
  gradient,
  style,
  delay = 0,
  onPress,
  actionLabel,
  onAction,
}) => {
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

  const getStatusColor = () => {
    switch (status) {
      case 'hadir':
        return DesignSystem.colors.success;
      case 'telat':
        return DesignSystem.colors.warning;
      case 'tidak-hadir':
      case 'absent':
        return DesignSystem.colors.error;
      default:
        return DesignSystem.colors.primary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'hadir':
        return '✓ Hadir';
      case 'telat':
        return '⏱ Telat';
      case 'tidak-hadir':
      case 'absent':
        return '✕ Tidak Hadir';
      default:
        return 'Pending';
    }
  };

  const getAvatarLetter = () => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(delay).springify()}
      style={[animatedScaleStyle]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <BlurView intensity={DesignSystem.blur} style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={(gradient || [DesignSystem.colors.glass, DesignSystem.colors.surfaceVariant]) as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </BlurView>

        <View style={styles.content}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.identifier} numberOfLines={1}>{identifier}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { borderColor: getStatusColor() }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={styles.statusText}>{getStatusLabel()}</Text>
              </View>
              {waktu && <Text style={styles.waktuText}>{waktu}</Text>}
            </View>
          </View>

          {/* Action Button */}
          {actionLabel && onAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAction}
              activeOpacity={0.7}
            >
              <ChevronRight size={20} color={DesignSystem.colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Border */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderWidth: 1,
              borderColor: DesignSystem.colors.glassBorder,
              borderRadius: DesignSystem.radius.md,
            },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignSystem.radius.md,
    padding: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    ...DesignSystem.shadows.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    zIndex: 1,
    gap: 12,
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: DesignSystem.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  infoSection: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  identifier: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  waktuText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
  },
});

export default StudentCard;
