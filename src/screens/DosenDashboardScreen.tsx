import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Dimensions, StatusBar, Modal, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { API_URL } from '../../constants/Config';
import {
  CheckCircle2, XCircle, Clock,
  Users, RefreshCw, Radio,
  AlertTriangle, ShieldCheck, Zap, MapPin
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '../../constants/DesignSystem';
import DashboardCard from '../components/ui/DashboardCard';
import StudentCard from '../components/ui/StudentCard';
import ReportIssueModal from '../components/ReportIssueModal';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';
import io from 'socket.io-client';


const { width } = Dimensions.get('window');

// Pulse animation for live indicator
const usePulseAnim = (isLive: boolean) => {
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    if (isLive) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulseAnim.value = 1;
    }
  }, [isLive]);
  return pulseAnim;
};

// Mock Data
const STUDENTS = [
  { id: 1, name: 'Budi Santoso', npm: '20240001', status: 'Hadir', waktu: '08:01' },
  { id: 2, name: 'Aisyah Mutiara', npm: '20240002', status: 'Hadir', waktu: '08:03' },
  { id: 3, name: 'Rizwan Hakim', npm: '20240003', status: 'Tidak Hadir', waktu: '-' },
  { id: 4, name: 'Siti Aminah', npm: '20240004', status: 'Hadir', waktu: '08:07' },
  { id: 5, name: 'Deni Kusuma', npm: '20240005', status: 'Telat', waktu: '08:22' },
  { id: 6, name: 'Rara Pratiwi', npm: '20240006', status: 'Hadir', waktu: '07:59' },
  { id: 7, name: 'Ahmad Fauzi', npm: '20240007', status: 'Tidak Hadir', waktu: '-' },
];

type FilterType = 'Semua' | 'Hadir' | 'Telat' | 'Tidak Hadir';

export default function DosenDashboardScreen() {
  const navigation = useNavigation<any>();
  const { tokens, isLightTheme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>('Semua');
  const [studentsList, setStudentsList] = useState<any[]>(STUDENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('14:45');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [manualScanEnabled, setManualScanEnabled] = useState(false);
  const [manualScanTimer, setManualScanTimer] = useState(300); // 5 minutes
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = usePulseAnim(isLive);


  // Manual scan timer
  useEffect(() => {
    if (manualScanEnabled && manualScanTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setManualScanTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setManualScanEnabled(false);
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!manualScanEnabled) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [manualScanEnabled, manualScanTimer]);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on('new_attendance', (data: any) => {
      setStudentsList(prev => {
        // format time from data.time
        const date = new Date(data.time);
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        
        // Find existing student or prepend
        const existingIdx = prev.findIndex(s => s.id === data.user_id || s.name === data.name);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], status: 'Hadir', waktu: `${h}:${m}`, photo: data.photo };
          return updated;
        } else {
          return [{ id: data.user_id, name: data.name, npm: '-', status: 'Hadir', waktu: `${h}:${m}`, photo: data.photo }, ...prev];
        }
      });
    });
    
    socket.on('update_location', (data: any) => {
      setStudentsList(prev => prev.map(student => 
        student.id === data.user_id ? { ...student, location_name: data.location_name } : student
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);



  const total = studentsList.length;
  const hadir = studentsList.filter(s => s.status === 'Hadir').length;
  const telat = studentsList.filter(s => s.status === 'Telat').length;
  const alpha = studentsList.filter(s => s.status === 'Tidak Hadir').length;

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
          jadwal_id: 1,
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

const toggleManualScan = async () => {
    if (manualScanEnabled) {
      setManualScanEnabled(false);
      setManualScanTimer(300);
      setSuccessTitle('Manual Scan Dimatikan');
      setSuccessMessage('Fitur scan manual wajah telah dinonaktifkan.');
      setShowSuccessModal(true);
      return;
    }

    setManualScanEnabled(true);
    setSuccessTitle('Manual Scan Aktif');
    setSuccessMessage('Mahasiswa sekarang dapat scan wajah secara manual (5 menit). Demo mode.');
    setShowSuccessModal(true);
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
    <AnimatedBackground style={styles.background}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* Top Header */}
          <View style={styles.topHeader}>
            <View style={styles.headerRow}>
              <View style={styles.greetingBox}>
                <Text style={[styles.headerSub, { color: tokens.subTextColor }]}>Selamat datang kembali, Pak!</Text>
                <Text style={[styles.headerTitle, { color: tokens.textColor }]}>Dosen Attendify</Text>
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
          <BlurView intensity={30} tint={isLightTheme ? 'light' : 'dark'} style={[styles.courseBanner, { borderColor: tokens.borderColor }]}>
            <View style={styles.courseHeader}>
              <View style={styles.statusRow}>
                <Animated.View
                  style={useAnimatedStyle(() => ({
                    ...styles.liveDot,
                    opacity: isSubmitted ? 0.4 : pulseAnim.value,
                    backgroundColor: isSubmitted ? 'rgba(255,255,255,0.4)' : '#10B981',
                  }))}
                />
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

          {/* Statistics Grid */}
          <View style={styles.statRow}>
            {[
            <BlurView intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.statCard, { borderColor: tokens.borderColor }]}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <CheckCircle2 size={24} color="#10B981" />
              </View>
              <Text style={[styles.statValue, { color: tokens.textColor }]}>58</Text>
              <Text style={[styles.statLabel, { color: tokens.subTextColor }]}>Hadir</Text>
            </BlurView>,
            <BlurView intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.statCard, { borderColor: tokens.borderColor }]}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <XCircle size={24} color="#EF4444" />
              </View>
              <Text style={[styles.statValue, { color: tokens.textColor }]}>7</Text>
              <Text style={[styles.statLabel, { color: tokens.subTextColor }]}>Absen</Text>
            </BlurView>
            ]}
          </View>

          {/* Student List */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: tokens.textColor }]}>Daftar Mahasiswa</Text>
            <TouchableOpacity onPress={() => setIsLoading(true)}>
              <RefreshCw size={20} color={isLightTheme ? '#1E4FA8' : '#3B82F6'} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            {['Semua', 'Hadir', 'Telat', 'Tidak Hadir'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter as FilterType)}
                style={[
                  styles.filterBtn,
                  { backgroundColor: isLightTheme ? 'rgba(30, 79, 168, 0.05)' : 'rgba(255,255,255,0.05)', borderColor: tokens.borderColor },
                  activeFilter === filter && styles.filterBtnActive
                ]}
              >
                <Text style={[
                  styles.filterText,
                  { color: tokens.subTextColor },
                  activeFilter === filter && styles.filterTextActive
                ]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.listContainer}>
            {studentsList.map((student, index) => {
              const statusColors = {
                'Hadir': '#10B981',
                'Telat': '#FBBF24',
                'Tidak Hadir': '#EF4444'
              };
              const color = statusColors[student.status as keyof typeof statusColors];

              return (
                <View key={student.id} style={[styles.studentItem, { backgroundColor: isLightTheme ? 'rgba(30, 79, 168, 0.03)' : 'rgba(255,255,255,0.05)', borderColor: tokens.borderColor }]}>
                  <View style={styles.avatarWrap}>
                    {student.photo ? (
                      <Image source={{ uri: `${API_URL}/uploads/${student.photo}` }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
                        <Text style={[styles.avatarText, { color }]}>{student.name.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={[styles.studentName, { color: tokens.textColor }]}>{student.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                      <Text style={[styles.studentNpm, { color: tokens.subTextColor, marginTop: 0 }]}>{student.npm}</Text>
                      {student.location_name && (
                        <>
                          <Text style={{ color: tokens.subTextColor, fontSize: 10 }}>•</Text>
                          <MapPin size={10} color="#38BDF8" />
                          <Text style={{ fontSize: 10, color: tokens.subTextColor, flexShrink: 1 }} numberOfLines={1}>{student.location_name}</Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={styles.statusWrap}>
                    <View style={[styles.statusBadge, { borderColor: `${color}30`, backgroundColor: `${color}10` }]}>
                      <Text style={[styles.statusText, { color }]}>{student.status.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.timeText, { color: tokens.subTextColor }]}>{student.waktu}</Text>
                  </View>
                  {student.status === 'Tidak Hadir' && (
                    <TouchableOpacity 
                      style={[styles.manualActionBtn, { backgroundColor: isLightTheme ? 'rgba(30, 79, 168, 0.05)' : 'rgba(255,255,255,0.05)', borderColor: tokens.borderColor }]}
                      onPress={() => handleManualCheckIn(student.id)}
                    >
                      <CheckCircle2 size={16} color={isLightTheme ? '#1E4FA8' : '#3B82F6'} />
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
            <BlurView intensity={50} tint={isLightTheme ? 'light' : 'dark'} style={[styles.modalContent, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
              <View style={[styles.successIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                <Clock size={40} color="#38BDF8" />
              </View>
              <Text style={[styles.modalTitle, { color: tokens.textColor }]}>Status Kehadiran</Text>
              <Text style={[styles.modalMessage, { color: tokens.subTextColor }]}>Pilih status kehadiran manual untuk mahasiswa ini.</Text>

              <View style={styles.choiceGroup}>
                <TouchableOpacity
                  style={[styles.choiceBtn, { borderLeftColor: '#4ADE80', backgroundColor: tokens.inputBg }]}
                  onPress={() => updateStudentStatus('Hadir')}
                >
                  <CheckCircle2 color="#4ADE80" size={20} />
                  <Text style={[styles.choiceText, { color: tokens.textColor }]}>Hadir Tepat Waktu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.choiceBtn, { borderLeftColor: '#FBBF24', backgroundColor: tokens.inputBg }]}
                  onPress={() => updateStudentStatus('Telat')}
                >
                  <Clock color="#FBBF24" size={20} />
                  <Text style={[styles.choiceText, { color: tokens.textColor }]}>Terlambat (Telat)</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cancelBtnFull}
                onPress={() => setShowAttendanceModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: tokens.subTextColor }]}>Batal</Text>
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
            <BlurView intensity={50} tint={isLightTheme ? 'light' : 'dark'} style={[styles.modalContent, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
              <View style={[styles.successIconBox, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
                <Radio size={40} color="#FBBF24" />
              </View>
              <Text style={[styles.modalTitle, { color: tokens.textColor }]}>Selesaikan Kelas?</Text>
              <Text style={[styles.modalMessage, { color: tokens.subTextColor }]}>Apakah Anda yakin ingin menyudahi sesi absensi dan mengirim semua data ke database pusat?</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelBtnSmall, { backgroundColor: tokens.iconButtonBg }]}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={[styles.cancelBtnTextSmall, { color: tokens.textColor }]}>Batal</Text>
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
            <BlurView intensity={50} tint={isLightTheme ? 'light' : 'dark'} style={[styles.modalContent, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
              <View style={styles.successIconBox}>
                <CheckCircle2 size={40} color="#10B981" />
              </View>
              <Text style={[styles.modalTitle, { color: tokens.textColor }]}>{successTitle || 'Berhasil!'}</Text>
              <Text style={[styles.modalMessage, { color: tokens.subTextColor }]}>{successMessage}</Text>

              <TouchableOpacity
                style={styles.finishClassBtn}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.finishClassBtnText}>Lanjutkan</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>
      </AnimatedBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  scroll: { paddingBottom: 40 },
  topHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greetingBox: {
    flex: 1,
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
  },
  headerSub: {
    fontSize: 14,
    marginTop: 2,
  },
  manualScanCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  manualScanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  manualScanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  manualScanDesc: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  manualScanToggle: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  manualScanToggleActive: {
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  manualScanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  manualScanToggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  manualScanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  manualScanFooterText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  courseBanner: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
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
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
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
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
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
  },
  filterBar: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  filterBtnActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
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
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
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
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentNpm: {
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
  },
  manualActionBtn: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtnSmall: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
  finishClassBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  choiceGroup: {
    width: '100%',
    gap: 12,
    marginVertical: 10,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    gap: 12,
    marginBottom: 12,
  },
  choiceText: {
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
    fontSize: 15,
    fontWeight: '600',
  },
  finishClassBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    marginTop: 8,
  },
});
