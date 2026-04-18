import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  Bell,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  MessageSquare,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  icon?: any;
}

export default function NotificationScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Absensi Tercatat',
      message: 'Anda telah berhasil absen di kelas Kecerdasan Buatan pada pukul 13:05',
      time: '2 jam lalu',
      type: 'success',
      read: false,
    },
    {
      id: 2,
      title: 'Pengingat Kelas',
      message: 'Kelas Pemrograman Web dimulai dalam 15 menit. Lokasi: Lab Komputer 1',
      time: '30 menit lalu',
      type: 'info',
      read: false,
    },
    {
      id: 3,
      title: 'Perhatian: Absensi Rendah',
      message: 'Absensi Anda di mata kuliah Mobile Programming di bawah 75%. Segera hadir di kelas berikutnya.',
      time: '1 jam lalu',
      type: 'warning',
      read: true,
    },
    {
      id: 4,
      title: 'Tugas Baru',
      message: 'Tugas baru telah dibagikan untuk mata kuliah Kecerdasan Buatan. Deadline: 5 hari lagi.',
      time: '3 jam lalu',
      type: 'info',
      read: true,
    },
    {
      id: 5,
      title: 'Penjadwalan Ulang',
      message: 'Kelas Basis Data telah dijadwalkan ulang ke hari Rabu pukul 10:00.',
      time: 'Kemarin',
      type: 'info',
      read: true,
    },
  ]);

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          border: 'rgba(34, 197, 94, 0.3)',
          icon: '#22C55E',
        };
      case 'warning':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.3)',
          icon: '#EAB308',
        };
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.3)',
          icon: '#3B82F6',
        };
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: '#EF4444',
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          icon: '#FFFFFF',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <MessageSquare size={20} />;
    }
  };

  const handleDeleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <LinearGradient
      colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Notifikasi</Text>
            {unreadCount > 0 && (
              <Text style={styles.subtitle}>
                {unreadCount} notifikasi baru
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ScrollView Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          <>
            {notifications.map(item => (
              <BlurView
                key={item.id}
                intensity={20}
                tint="dark"
                style={styles.notificationCard}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleMarkAsRead(item.id)}
                  style={styles.notificationContent}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: getTypeColors(item.type).bg,
                        borderColor: getTypeColors(item.type).border,
                      },
                    ]}
                  >
                    <View style={{ color: getTypeColors(item.type).icon }}>
                      {getTypeIcon(item.type)}
                    </View>
                  </View>

                  <View style={styles.textContent}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.notifTitle,
                          !item.read && styles.titleBold,
                        ]}
                      >
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.message} numberOfLines={2}>
                      {item.message}
                    </Text>

                    <View style={styles.timeRow}>
                      <Clock size={12} color="rgba(255, 255, 255, 0.5)" />
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteNotification(item.id)}
                  >
                    <Trash2 size={16} color="rgba(255, 255, 255, 0.5)" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </BlurView>
            ))}

            {notifications.length > 5 && (
              <TouchableOpacity
                style={styles.clearAllBtn}
                onPress={() => setNotifications([])}
              >
                <LinearGradient
                  colors={[
                    'rgba(239, 68, 68, 0.2)',
                    'rgba(239, 68, 68, 0.1)',
                  ]}
                  style={styles.clearAllGradient}
                >
                  <Trash2 color="#EF4444" size={16} />
                  <Text style={styles.clearAllText}>Hapus Semua Notifikasi</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Bell color="rgba(255,255,255,0.3)" size={64} />
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
            <Text style={styles.emptySubtext}>
              Semua notifikasi Anda telah dibaca
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 120,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  notificationCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleBold: {
    fontWeight: '700',
  },
  notifTitle: {
    fontSize: 14,
    color: '#fff',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ai.primary,
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  clearAllBtn: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  clearAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});
