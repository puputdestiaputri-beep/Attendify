import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, ActivityIndicator,
  RefreshControl, Dimensions, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ChevronLeft, AlertTriangle, User,
  Clock, CheckCircle, CheckCircle2, MessageSquare
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedBackground from '../components/ui/AnimatedBackground';

interface ReportEntry {
  id: number;
  user_id: number;
  role: string;
  message: string;
  status: string;
  created_at: string;
  user_name: string | null;
}

export default function AdminReportsScreen() {
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setReports(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Fetch reports error:', err);
      setError('Network error. Make sure the backend is running.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/admin/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        Alert.alert('Sukses', 'Laporan berhasil diselesaikan');
        fetchReports(); // Refresh data
      } else {
        Alert.alert('Error', result.message || 'Gagal mengubah status');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan jaringan');
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const ReportItem = ({ item }: { item: ReportEntry }) => {
    const dt = formatDateTime(item.created_at);
    const isResolved = item.status === 'resolved';

    return (
      <View style={styles.cardWrapper}>
        <BlurView intensity={20} tint="dark" style={[styles.card, isResolved && styles.cardResolved]}>
          <View style={styles.cardHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatarMini, { backgroundColor: isResolved ? '#10B981' : Colors.ai.primary }]}>
                <User size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.userName}>{item.user_name || 'Pengguna Tidak Dikenal'}</Text>
                <Text style={styles.userRole}>{item.role.toUpperCase()}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: isResolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={[styles.statusText, { color: isResolved ? '#10B981' : '#F59E0B' }]}>
                {isResolved ? 'Selesai' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.messageText}>{item.message}</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Clock size={14} color="rgba(255,255,255,0.4)" />
                <Text style={styles.detailText}>{dt.date} • {dt.time}</Text>
              </View>
            </View>
          </View>

          {!isResolved && (
            <TouchableOpacity 
              style={styles.resolveButton} 
              onPress={() => {
                Alert.alert(
                  'Konfirmasi',
                  'Tandai laporan ini sebagai selesai?',
                  [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Selesaikan', onPress: () => handleResolve(item.id) }
                  ]
                );
              }}
            >
              <CheckCircle2 size={18} color="#10B981" />
              <Text style={styles.resolveButtonText}>Tandai Selesai</Text>
            </TouchableOpacity>
          )}
        </BlurView>
      </View>
    );
  };

  return (
    <AnimatedBackground style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <AlertTriangle size={20} color="#F59E0B" />
          <Text style={styles.headerTitle}>Laporan Masalah</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.ai.primary} />
          <Text style={styles.loadingText}>Memuat laporan...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <AlertTriangle size={48} color="#F87171" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReports}>
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={ReportItem}
          keyExtractor={(item) => item.id.toString()}
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
              <MessageSquare size={64} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyText}>Tidak Ada Laporan</Text>
              <Text style={styles.emptySubtext}>Semua sistem berjalan lancar.</Text>
            </View>
          }
        />
      )}
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  card: {
    padding: 20,
  },
  cardResolved: {
    opacity: 0.7,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 16,
  },
  messageText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
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
    fontSize: 12,
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resolveButtonText: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
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
});
