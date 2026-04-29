import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Alert, Dimensions, StatusBar, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CheckCircle2, XCircle, Clock,
  Users, TrendingUp, Activity, LogOut, RefreshCw,
  BookOpen, Radio, Bell, Search, Filter, ChevronRight,
  AlertTriangle
} from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '@/constants/Config';
import ReportIssueModal from '../components/ReportIssueModal';

const { width } = Dimensions.get('window');


// ─── Mock Data ──────────────────────────────────────────────────────────────
const STUDENTS = [
  { id: 1, name: 'Budi Santoso', npm: '20240001', status: 'Hadir', waktu: '08:01' },
  { id: 2, name: 'Aisyah Mutiara', npm: '20240002', status: 'Hadir', waktu: '08:03' },
  { id: 3, name: 'Rizwan Hakim', npm: '20240003', status: 'Tidak Hadir', waktu: '-' },
  { id: 4, name: 'Siti Aminah', npm: '20240004', status: 'Hadir', waktu: '08:07' },
  { id: 5, name: 'Deni Kusuma', npm: '20240005', status: 'Telat', waktu: '08:22' },
  { id: 6, name: 'Rara Pratiwi', npm: '20240006', status: 'Hadir', waktu: '07:59' },
  { id: 7, name: 'Ahmad Fauzi', npm: '20240007', status: 'Tidak Hadir', waktu: '-' },
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
  const [studentsList, setStudentsList] = useState(STUDENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);


  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('14:45');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for live indicator
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    if (isLive) loop.start();
    return () => loop.stop();
  }, [isLive]);

  const total = studentsList.length;
  const hadir = studentsList.filter(s => s.status === 'Hadir').length;
  const telat = studentsList.filter(s => s.status === 'Telat').length;
  const alpha = studentsList.filter(s => s.status === 'Tidak Hadir').length;
  const pct = Math.round((hadir / total) * 100);

  const filtered = activeFilter === 'Semua'
    ? studentsList
    : studentsList.filter(s => s.status === activeFilter);

  const handleRefresh = () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    setLastUpdated(`${h}:${m}`);

    setSuccessTitle('Data Diperbarui');
    setSuccessMessage('Data kehadiran terbaru berhasil dimuat dari sistem.');
    setShowSuccessModal(true);
  };

  const handleManualCheckIn = (id: number) => {
    setSelectedStudentId(id);
    setShowAttendanceModal(true);
  };

  const updateStudentStatus = async (status: 'Hadir' | 'Telat') => {
    if (selectedStudentId === null) return;

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/absensi/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          user_id: selectedStudentId, 
          jadwal_id: 1, // Demo value
          status: status.toLowerCase()
        })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        const time = `${h}:${m}`;

        setStudentsList(prev => prev.map(s =>
          s.id === selectedStudentId ? { ...s, status, waktu: time } : s
        ));

        setShowAttendanceModal(false);
        setSelectedStudentId(null);

        setSuccessTitle('Berhasil');
        setSuccessMessage(`Mahasiswa berhasil ditandai ${status.toLowerCase()} secara manual.`);
        setShowSuccessModal(true);
      }
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui status.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleFinishClass = () => {
    if (isSubmitted) {
      setSuccessTitle('Informasi');
      setSuccessMessage('Absensi untuk sesi ini sudah dikirim sebelumnya.');
      setShowSuccessModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmFinishClass = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      // For demo, we use jadwal_id: 1. In a multi-class system, this would be dynamic.
      const response = await fetch(`${API_URL}/absensi/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jadwal_id: 1 })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        setIsSubmitted(true);
        setIsLive(false);
        setSuccessTitle('Absen Telah Tersubmit!');
        setSuccessMessage('Data kehadiran mahasiswa yang tidak hadir telah ditandai ALFA dan disimpan ke database.');
        setShowSuccessModal(true);
      }
    } catch (err) {
      Alert.alert('Gagal', 'Gagal mengirim data absensi ke server.');
    } finally {
      setIsLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    if (status === 'Hadir') return { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.3)', text: '#4ADE80' };
    if (status === 'Telat') return { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#FBBF24' };
    return { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.3)', text: '#F87171' };
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Hadir') return <CheckCircle2 size={14} color="#4ADE80" />;
    if (status === 'Telat') return <Clock size={14} color="#FBBF24" />;
    return <XCircle size={14} color="#F87171" />;
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
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>Dashboard Dosen</Text>
                <Text style={styles.headerSub}>Selamat datang kembali, Pak!</Text>
              </View>
              <TouchableOpacity 
                style={styles.reportBtn}
                onPress={() => setShowReportModal(true)}
              >
                <AlertTriangle size={20} color="#FBBF24" />
                <Text style={styles.reportBtnText}>Lapor</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* ── Active Class Banner ── */}
          <BlurView intensity={30} tint="dark" style={styles.courseBanner}>
            <View style={styles.courseHeader}>
              <View style={styles.statusRow}>
                <Animated.View style={[styles.liveDot, {
                  opacity: isSubmitted ? 0.4 : pulseAnim,
                  backgroundColor: isSubmitted ? 'rgba(255,255,255,0.4)' : '#10B981'
                }]} />
                <Text style={[styles.liveLabel, isSubmitted && { color: 'rgba(255,255,255,0.4)' }]}>
                  {isSubmitted ? 'SESI BERAKHIR' : 'SESI AKTIF'}
                </Text>
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

            <TouchableOpacity
              style={[styles.finishBtn, isSubmitted && { opacity: 0.6 }]}
              onPress={handleFinishClass}
              disabled={isSubmitted}
            >
              <LinearGradient
                colors={isSubmitted ? ['#64748b', '#475569'] : ['#10B981', '#059669']}
                style={styles.finishGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <CheckCircle2 color="#fff" size={18} />
                <Text style={styles.finishBtnText}>
                  {isSubmitted ? 'Absensi Berhasil Terkirim' : 'Selesaikan & Submit Absensi'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>

          {/* ── Statistics Grid ── */}
          <View style={styles.statRow}>
            {[
              { label: 'Hadir', value: hadir, color: '#4ADE80', icon: CheckCircle2 },
              { label: 'Telat', value: telat, color: '#FBBF24', icon: Clock },
              { label: 'Alpha', value: alpha, color: '#F87171', icon: XCircle },
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

                  {item.status === 'Tidak Hadir' && (
                    <TouchableOpacity
                      style={styles.manualActionBtn}
                      onPress={() => handleManualCheckIn(item.id)}
                    >
                      <CheckCircle2 size={20} color={Colors.ai.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

        </ScrollView>

        <ReportIssueModal visible={showReportModal} onClose={() => setShowReportModal(false)} />

        {/* Attendance Choice Modal */}
        <Modal
          visible={showAttendanceModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAttendanceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={50} tint="dark" style={styles.modalContent}>
              <View style={[styles.successIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                <Clock size={40} color="#38BDF8" />
              </View>
              <Text style={styles.modalTitle}>Status Kehadiran</Text>
              <Text style={styles.modalMessage}>Pilih status kehadiran manual untuk mahasiswa ini.</Text>

              <View style={styles.choiceGroup}>
                <TouchableOpacity
                  style={[styles.choiceBtn, { borderLeftColor: '#4ADE80' }]}
                  onPress={() => updateStudentStatus('Hadir')}
                >
                  <CheckCircle2 color="#4ADE80" size={20} />
                  <Text style={styles.choiceText}>Hadir Tepat Waktu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.choiceBtn, { borderLeftColor: '#FBBF24' }]}
                  onPress={() => updateStudentStatus('Telat')}
                >
                  <Clock color="#FBBF24" size={20} />
                  <Text style={styles.choiceText}>Terlambat (Telat)</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelBtnFull}
                onPress={() => setShowAttendanceModal(false)}
              >
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>

        {/* Confirmation Submit Modal */}
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={50} tint="dark" style={styles.modalContent}>
              <View style={[styles.successIconBox, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
                <Radio size={40} color="#FBBF24" />
              </View>
              <Text style={styles.modalTitle}>Selesaikan Kelas?</Text>
              <Text style={styles.modalMessage}>Apakah Anda yakin ingin menyudahi sesi absensi dan mengirim semua data ke database pusat?</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtnSmall}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.cancelBtnTextSmall}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.finishClassBtnSmall}
                  onPress={confirmFinishClass}
                >
                  <Text style={styles.finishClassBtnText}>Kirim Data</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </Modal>


        {/* Success Submit Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={50} tint="dark" style={styles.modalContent}>
              <View style={styles.successIconBox}>
                <CheckCircle2 size={40} color="#10B981" />
              </View>
              <Text style={styles.modalTitle}>{successTitle || 'Berhasil!'}</Text>
              <Text style={styles.modalMessage}>{successMessage}</Text>

              <TouchableOpacity
                style={styles.finishClassBtn}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.finishClassBtnText}>Lanjutkan</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>

        <ReportIssueModal visible={showReportModal} onClose={() => setShowReportModal(false)} />
      </LinearGradient>
    </View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  scroll: { paddingBottom: 40 },
  topHeader: {
    paddingTop: 40,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  reportBtnText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: 'bold',
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
  manualActionBtn: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalContent: {
    width: '85%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16,185,129,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  finishClassBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    marginTop: 8,
  },
  finishClassBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtnSmall: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cancelBtnTextSmall: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  finishClassBtnSmall: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  choiceGroup: {
    width: '100%',
    gap: 12,
    marginVertical: 10,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    gap: 12,
    marginBottom: 12,
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtnFull: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
    fontWeight: '600',
  },
});
