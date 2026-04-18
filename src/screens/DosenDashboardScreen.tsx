import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Alert, Dimensions, StatusBar, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  CheckCircle2, XCircle, Clock,
  Users, TrendingUp, Activity, LogOut, RefreshCw,
  BookOpen, Radio, Bell, Search, Filter, ChevronRight
} from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// ─── Mock Data ──────────────────────────────────────────────────────────────
const STUDENTS = [
  { id: 1, name: 'Budi Santoso',   npm: '20240001', status: 'Hadir',       waktu: '08:01' },
  { id: 2, name: 'Aisyah Mutiara', npm: '20240002', status: 'Hadir',       waktu: '08:03' },
  { id: 3, name: 'Rizwan Hakim',   npm: '20240003', status: 'Tidak Hadir', waktu: '-'     },
  { id: 4, name: 'Siti Aminah',    npm: '20240004', status: 'Hadir',       waktu: '08:07' },
  { id: 5, name: 'Deni Kusuma',    npm: '20240005', status: 'Telat',       waktu: '08:22' },
  { id: 6, name: 'Rara Pratiwi',   npm: '20240006', status: 'Hadir',       waktu: '07:59' },
  { id: 7, name: 'Ahmad Fauzi',    npm: '20240007', status: 'Tidak Hadir', waktu: '-'     },
];

const WEEKLY_STATS = [
  { day: 'Sen', percent: 92 },
  { day: 'Sel', percent: 78 },
  { day: 'Rab', percent: 85 },
  { day: 'Kam', percent: 100 },
  { day: 'Jum', percent: 60 },
];

type FilterType = 'Semua' | 'Hadir' | 'Telat' | 'Tidak Hadir';

export default function DosenDashboardScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterType>('Semua');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('14:45');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for live indicator
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    if (isLive) loop.start();
    return () => loop.stop();
  }, [isLive]);

  const total   = STUDENTS.length;
  const hadir   = STUDENTS.filter(s => s.status === 'Hadir').length;
  const telat   = STUDENTS.filter(s => s.status === 'Telat').length;
  const alpha   = STUDENTS.filter(s => s.status === 'Tidak Hadir').length;
  const pct     = Math.round((hadir / total) * 100);

  const filtered = activeFilter === 'Semua'
    ? STUDENTS
    : STUDENTS.filter(s => s.status === activeFilter);

  const handleRefresh = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setLastUpdated(`${h}:${m}`);
    Alert.alert('Berhasil', 'Data kehadiran telah diperbarui.');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    try {
      setIsLoggingOut(true);
      setShowLogoutModal(false);
      logout();
    } catch (error) {
      console.log('Logout error', error);
    }
  };

  const handleFinishClass = () => {
    Alert.alert(
      'Selesaikan Kelas',
      'Apakah Anda yakin ingin menyelesaikan kelas ini? Mahasiswa yang belum scan akan otomatis dianggap Alfa.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Selesaikan', 
          style: 'destructive', 
          onPress: () => Alert.alert('Sukses', 'Kelas telah diselesaikan. Data telah disimpan ke database.') 
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    if (status === 'Hadir')        return { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)', text: '#4ADE80' };
    if (status === 'Telat')        return { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#FBBF24' };
    return                                { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', text: '#F87171' };
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Hadir') return <CheckCircle2 size={14} color="#4ADE80" />;
    if (status === 'Telat') return <Clock        size={14} color="#FBBF24" />;
    return                         <XCircle      size={14} color="#F87171" />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scroll} 
          showsVerticalScrollIndicator={false}
        >
          
          {/* ── Top Header ── */}
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.headerTitle}>Dashboard Dosen</Text>
              <Text style={styles.headerSub}>Selamat datang kembali, Pak!</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutCircle}>
              <LogOut size={18} color="#F87171" />
              <Text style={styles.logoutCircleText}>Keluar</Text>
            </TouchableOpacity>
          </View>

          {/* ── Active Class Banner ── */}
          <BlurView intensity={30} tint="dark" style={styles.courseBanner}>
            <View style={styles.courseHeader}>
              <View style={styles.statusRow}>
                <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
                <Text style={styles.liveLabel}>SESI AKTIF</Text>
              </View>
              <Text style={styles.updatedText}>Update: {lastUpdated}</Text>
            </View>
            <Text style={styles.courseName}>Pemrograman Berorientasi Objek</Text>
            <View style={styles.courseMeta}>
              <View style={styles.metaItem}>
                <Clock color="rgba(255,255,255,0.6)" size={14} />
                <Text style={styles.metaText}>08:00 - 10:00</Text>
              </View>
              <View style={styles.metaItem}>
                <Users color="rgba(255,255,255,0.6)" size={14} />
                <Text style={styles.metaText}>42 Mahasiswa</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinishClass}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.finishGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <CheckCircle2 color="#fff" size={18} />
                <Text style={styles.finishBtnText}>Selesaikan & Submit Absensi</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>

          {/* ── Statistics Grid ── */}
          <View style={styles.statRow}>
            {[
              { label: 'Hadir',   value: hadir, color: '#4ADE80', icon: CheckCircle2 },
              { label: 'Telat',   value: telat, color: '#FBBF24', icon: Clock },
              { label: 'Alpha',   value: alpha, color: '#F87171', icon: XCircle },
            ].map((item, idx) => (
              <BlurView key={idx} intensity={20} tint="dark" style={styles.statCard}>
                <item.icon size={20} color={item.color} />
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </BlurView>
            ))}
          </View>

          {/* ── Attendance List Section ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daftar Kehadiran</Text>
            <TouchableOpacity onPress={handleRefresh}>
              <RefreshCw size={18} color={Colors.ai.primary} />
            </TouchableOpacity>
          </View>

          {/* Filter Bar */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            {(['Semua', 'Hadir', 'Telat', 'Tidak Hadir'] as FilterType[]).map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Student List Wrap */}
          <View style={styles.listContainer}>
            {filtered.map((item, idx) => {
              const sc = getStatusColor(item.status);
              return (
                <View key={item.id} style={styles.studentItem}>
                  <View style={styles.avatarWrap}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentNpm}>{item.npm}</Text>
                  </View>
                  <View style={styles.statusWrap}>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                      {getStatusIcon(item.status)}
                      <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                    </View>
                    <Text style={styles.timeText}>{item.waktu !== '-' ? item.waktu : ''}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* ── Logout Button ── */}
          <TouchableOpacity style={styles.logoutFullBtn} onPress={handleLogout} activeOpacity={0.85}>
            <LinearGradient
              colors={['#dc2626', '#b91c1c']}
              style={styles.logoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <LogOut size={20} color="#fff" />
              <Text style={styles.logoutFullText}>Logout dari Akun</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>

        {/* Logout Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <LogOut size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Konfirmasi Logout</Text>
              <Text style={styles.modalMessage}>Apakah Anda yakin ingin keluar dari akun ini?</Text>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalBtnCancel} 
                  onPress={() => setShowLogoutModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnCancelText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalBtnLogout} 
                  onPress={confirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalBtnLogoutText}>{isLoggingOut ? '...' : 'Logout'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  scroll: { paddingBottom: 40 },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  logoutCircle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(248,113,113,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
    flexDirection: 'row',
    gap: 6,
  },
  logoutCircleText: {
    fontSize: 13,
    color: '#F87171',
    fontWeight: '700',
  },
  logoutFullBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  logoutFullText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  courseBanner: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveLabel: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  updatedText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 28,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  finishBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  finishGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  finishBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterBar: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterBtnActive: {
    backgroundColor: Colors.ai.primary,
    borderColor: Colors.ai.primary,
  },
  filterText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarWrap: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  studentNpm: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 4,
  },
  statusWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalBtnLogout: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalBtnLogoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
