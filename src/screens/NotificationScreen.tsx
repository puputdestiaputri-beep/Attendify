import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';

const { width } = Dimensions.get('window');

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

export default function NotificationScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/notifikasi`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

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
        return <CheckCircle2 size={20} color={getTypeColors(type).icon} />;
      case 'warning':
        return <AlertCircle size={20} color={getTypeColors(type).icon} />;
      case 'error':
        return <AlertCircle size={20} color={getTypeColors(type).icon} />;
      default:
        return <MessageSquare size={20} color={getTypeColors(type).icon} />;
    }
  };

  const handleMarkAsRead = async (id?: number) => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      await fetch(`${API_URL}/notifikasi/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_notif: id })
      });
      fetchNotifications();
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' ' + 
           date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <LinearGradient
      colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
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
            <Text style={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Semua pesan sudah dibaca'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={() => handleMarkAsRead()}>
              <Text style={styles.readAllText}>Baca Semua</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ScrollView Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.ai.primary} />
          </View>
        ) : (
          notifications.length > 0 ? (
            notifications.map(item => (
              <BlurView
                key={item.id}
                intensity={20}
                tint="dark"
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
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
                    {getTypeIcon(item.type)}
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

                    <Text style={styles.message} numberOfLines={3}>
                      {item.message}
                    </Text>

                    <View style={styles.timeRow}>
                      <Clock size={12} color="rgba(255, 255, 255, 0.5)" />
                      <Text style={styles.time}>{formatTime(item.time)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </BlurView>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Bell color="rgba(255,255,255,0.2)" size={64} />
              <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
              <Text style={styles.emptySubtext}>
                Laporan dari mahasiswa atau dosen akan muncul di sini.
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerInfo: { flex: 1 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  readAllText: {
    color: Colors.ai.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  notificationCard: {
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  unreadCard: {
    borderColor: 'rgba(96, 165, 250, 0.3)',
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
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
  },
  textContent: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleBold: { fontWeight: '700' },
  notifTitle: {
    fontSize: 14,
    color: '#fff',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ai.primary,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    marginBottom: 8,
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
  centerContainer: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
