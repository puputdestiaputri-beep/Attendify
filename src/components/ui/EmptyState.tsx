import React from 'react';
import {
  View, StyleSheet, Text, ViewStyle
} from 'react-native';
import { AlertCircle, Users, Calendar, FileText, Search, Inbox } from 'lucide-react-native';
import { DesignSystem } from '@/constants/DesignSystem';
import AnimatedButton from './AnimatedButton';

export type EmptyStateType = 'no-data' | 'no-results' | 'no-students' | 'no-attendance' | 'no-notifications';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  message,
  actionLabel,
  onAction,
  style,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'no-students':
        return <Users size={64} color={DesignSystem.colors.primary} />;
      case 'no-attendance':
        return <Calendar size={64} color={DesignSystem.colors.primary} />;
      case 'no-notifications':
        return <Inbox size={64} color={DesignSystem.colors.primary} />;
      case 'no-results':
        return <Search size={64} color={DesignSystem.colors.primary} />;
      case 'no-data':
      default:
        return <AlertCircle size={64} color={DesignSystem.colors.primary} />;
    }
  };

  const getDefaultText = () => {
    switch (type) {
      case 'no-students':
        return {
          title: 'Tidak Ada Siswa',
          message: 'Belum ada data siswa. Tambahkan siswa baru untuk memulai.',
        };
      case 'no-attendance':
        return {
          title: 'Tidak Ada Data Kehadiran',
          message: 'Kehadiran belum dicatat. Mulai sesi absensi baru untuk melihat data.',
        };
      case 'no-notifications':
        return {
          title: 'Tidak Ada Notifikasi',
          message: 'Semua terbaca! Anda tidak memiliki notifikasi baru.',
        };
      case 'no-results':
        return {
          title: 'Tidak Ada Hasil',
          message: 'Coba ubah filter atau pencarian Anda untuk menemukan hasil.',
        };
      case 'no-data':
      default:
        return {
          title: 'Tidak Ada Data',
          message: 'Data tidak tersedia saat ini.',
        };
    }
  };

  const defaultText = getDefaultText();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {getIcon()}
      </View>
      <Text style={styles.title}>{title || defaultText.title}</Text>
      <Text style={styles.message}>{message || defaultText.message}</Text>
      {actionLabel && onAction && (
        <View style={styles.buttonContainer}>
          <AnimatedButton
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            style={styles.button}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  title: {
    fontSize: DesignSystem.typography.h2,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: DesignSystem.typography.body,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 16,
    minWidth: 200,
  },
  button: {
    alignSelf: 'center',
  },
});

export default EmptyState;
