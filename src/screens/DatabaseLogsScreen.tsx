import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, ActivityIndicator,
  RefreshControl, Dimensions, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Database, ChevronLeft, Calendar, 
  Clock, MapPin, User, Shield, 
  AlertCircle, RefreshCw, Trash2,
  Camera, CheckCircle, XCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LogEntry {
  id_log: number;
  waktu_deteksi: string;
  confidence: number;
  foto_capture: string;
  user_name: string | null;
  user_role: string | null;
  nama_kamera: string | null;
  camera_location: string | null;
}

export default function DatabaseLogsScreen() {
  const navigation = useNavigation<any>();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'attendance'>('logs');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setLogs(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
      // setError('Network error. Make sure the backend is running.');
      
      // Mock data for development if backend is not reachable
      setLogs([
        {
          id_log: 1,
          waktu_deteksi: new Date().toISOString(),
          confidence: 0.98,
          foto_capture: '',
          user_name: 'Admin User',
          user_role: 'admin',
          nama_kamera: 'Cam-01',
          camera_location: 'Main Entrance'
        },
        {
          id_log: 2,
          waktu_deteksi: new Date(Date.now() - 3600000).toISOString(),
          confidence: 0.85,
          foto_capture: '',
          user_name: 'Dosen Test',
          user_role: 'dosen',
          nama_kamera: 'Cam-02',
          camera_location: 'R. Kuliah 101'
        }
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/admin/attendance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setAttendance(result.data);
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else {
      fetchAttendance();
    }
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'logs') fetchLogs();
    else fetchAttendance();
  }, [activeTab]);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const LogItem = ({ item }: { item: LogEntry }) => {
    const dt = formatDateTime(item.waktu_deteksi);
    const confidencePercent = Math.round(item.confidence * 100);
    const confidenceColor = item.confidence > 0.8 ? '#34D399' : (item.confidence > 0.5 ? '#FBBF24' : '#F87171');

    return (
      <View style={styles.logCardWrapper}>
        <BlurView intensity={20} tint="dark" style={styles.logCard}>
          <View style={styles.logHeader}>
            <View style={styles.cameraTag}>
              <Camera size={14} color={Colors.ai.primary} />
              <Text style={styles.cameraTagName}>{item.nama_kamera || 'Unknown Cam'}</Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: `${confidenceColor}20` }]}>
              <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                {confidencePercent}% Match
              </Text>
            </View>
          </View>

          <View style={styles.logBody}>
            <View style={styles.userInfo}>
              <View style={styles.avatarMini}>
                <User size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.userName}>{item.user_name || 'Unidentified'}</Text>
                <Text style={styles.userRole}>{item.user_role ? item.user_role.toUpperCase() : 'UNKNOWN'}</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Calendar size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.detailText}>{dt.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <Clock size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.detailText}>{dt.time}</Text>
              </View>
              <View style={[styles.detailItem, { width: '100%', marginTop: 8 }]}>
                <MapPin size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.camera_location || 'No location set'}
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Database size={20} color={Colors.ai.primary} />
            <Text style={styles.headerTitle}>Database Logs</Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onRefresh}
          >
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'logs' && styles.tabActive]}
            onPress={() => setActiveTab('logs')}
          >
            <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>System Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'attendance' && styles.tabActive]}
            onPress={() => setActiveTab('attendance')}
          >
            <Text style={[styles.tabText, activeTab === 'attendance' && styles.tabTextActive]}>Absensi Dosen</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.ai.primary} />
            <Text style={styles.loadingText}>Loading activity logs...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <AlertCircle size={48} color="#F87171" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchLogs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={activeTab === 'logs' ? logs : attendance}
            renderItem={({ item }) => {
              if (activeTab === 'logs') {
                return <LogItem item={item as LogEntry} />;
              } else {
                const dt = formatDateTime(item.tanggal);
                return (
                  <View style={styles.logCardWrapper}>
                    <BlurView intensity={20} tint="dark" style={styles.logCard}>
                      <View style={styles.logHeader}>
                        <View style={styles.cameraTag}>
                          <User size={14} color={Colors.ai.primary} />
                          <Text style={styles.cameraTagName}>{item.name}</Text>
                        </View>
                        <View style={[styles.confidenceBadge, { backgroundColor: item.status === 'hadir' ? '#34D39920' : '#FBBF2420' }]}>
                          <Text style={[styles.confidenceText, { color: item.status === 'hadir' ? '#34D399' : '#FBBF24' }]}>
                            {item.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                          <Calendar size={14} color="rgba(255,255,255,0.4)" />
                          <Text style={styles.detailText}>{dt.date}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Clock size={14} color="rgba(255,255,255,0.4)" />
                          <Text style={styles.detailText}>{item.waktu_datang || '-'}</Text>
                        </View>
                        <View style={[styles.detailItem, { width: '100%', marginTop: 8 }]}>
                          <Text style={styles.detailText}>{item.subject} - {item.class_name}</Text>
                        </View>
                      </View>
                    </BlurView>
                  </View>
                );
              }
            }}
            keyExtractor={(item: any) => (item.id_log || item.id_absensi || Math.random()).toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.ai.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Database size={64} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>Tidak ada data</Text>
              </View>
            }
          />
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logCardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logCard: {
    padding: 20,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cameraTagName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logBody: {
    gap: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.ai.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userRole: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#F87171',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.ai.primary,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabActive: {
    backgroundColor: Colors.ai.primary,
  },
  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  }
});
