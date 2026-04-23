<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Animated,
  Dimensions,
  TextInput,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Users,
  GraduationCap,
  ChevronRight,
  CheckCircle,
  Clock,
  FileX,
  AlertCircle,
  Sparkles,
  Search,
  Send,
  X,
  Calendar,
  MapPin,
  BookOpen,
  TrendingUp,
  Filter,
  ChevronDown,
  Download,
  MessageCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// @ts-ignore
// import autoTable from 'jspdf-autotable';

const { width, height } = Dimensions.get('window');

type StatusType = 'Hadir' | 'Telat' | 'Izin' | 'Alfa';

const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
const dayLabels: Record<string, string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
};

// ============================================================
// DESIGN SYSTEM - Modern Light Theme
// ============================================================
const THEME = {
  primary: '#669bbc',
  primaryLight: '#8fb8d4',
  primaryDark: '#4a7a9e',
  secondary: '#0E3b95',
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceElevated: '#ffffff',
  text: '#333333',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  shadow: 'rgba(0, 0, 0, 0.06)',
  shadowStrong: 'rgba(0, 0, 0, 0.12)',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const statusColor: Record<string, string> = {
  Hadir: THEME.success,
  Telat: THEME.warning,
  Izin: THEME.info,
  Alfa: THEME.error,
  hadir: THEME.success,
  terlambat: THEME.warning,
  izin: THEME.info,
  alfa: THEME.error,
};

const statusLabel: Record<string, string> = {
  hadir: 'Hadir',
  terlambat: 'Telat',
  izin: 'Izin',
  alfa: 'Alfa',
};

// ============================================================
// ANIMATED COMPONENTS
// ============================================================

const FadeInView = ({ children, delay = 0, style }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

const ScalePress = ({ children, onPress, style, disabled = false }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const SkeletonShimmer = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonLine, { width: '60%', height: 20, marginBottom: 12 }]} />
      <View style={[styles.skeletonLine, { width: '40%', height: 14, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '80%', height: 14 }]} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
            backgroundColor: 'rgba(255,255,255,0.4)',
          },
        ]}
      />
    </View>
  );
};

// ============================================================
// TOAST COMPONENT
// ============================================================

const Toast = ({ visible, message, type = 'success', onHide }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -30, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const bgColor = type === 'success' ? THEME.success : type === 'error' ? THEME.error : THEME.info;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { opacity, transform: [{ translateY }], backgroundColor: bgColor },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

// ============================================================
// HELPER COMPONENTS
// ============================================================

const AnimatedInfoCard = ({ children, delay = 0 }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

const AnimatedStatCard = ({ index, color, number, label, icon }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { opacity, transform: [{ scale }], borderLeftColor: color },
      ]}
    >
      {icon}
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const ColoredIcon = ({ icon: Icon, size, color }: any) => {
  return <Icon size={size} color={color} />;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminJadwalScreen() {
  const navigation = useNavigation<any>();

  // ── State ────────────────────────────────────────────────
  const [selectedDay, setSelectedDay] = useState('senin');
  const [jadwalPerHari, setJadwalPerHari] = useState<Record<string, any[]>>({});
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);
  const [absensiData, setAbsensiData] = useState<any[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState(true);
  const [loadingAbsensi, setLoadingAbsensi] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nama' | 'tanggal'>('nama');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [detailAnim] = useState(new Animated.Value(0));
  const [headerScaleAnim] = useState(new Animated.Value(1));
  const [headerOpacityAnim] = useState(new Animated.Value(1));
  const [selectedKelasId, setSelectedKelasId] = useState<any>(null);

  // ── Fetch Jadwal ─────────────────────────────────────────
  const fetchJadwal = useCallback(async () => {
    setLoadingJadwal(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/jadwal`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        const grouped: Record<string, any[]> = {};
        for (const j of json.data) {
          const hari = (j.hari || 'senin').toLowerCase();
          if (!grouped[hari]) grouped[hari] = [];
          grouped[hari].push(j);
        }
        setJadwalPerHari(grouped);
      }
    } catch (error) {
      console.error('Error fetching jadwal:', error);
      showToast('Gagal memuat jadwal', 'error');
    } finally {
      setLoadingJadwal(false);
    }
  }, []);

  // ── Fetch Absensi ────────────────────────────────────────
  const fetchAbsensi = useCallback(async (jadwalId: number, kelasId: number) => {
    setLoadingAbsensi(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/absensi?jadwal_id=${jadwalId}&class_id=${kelasId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.status === 'success' && json.data) {
        setAbsensiData(json.data);
      } else {
        setAbsensiData([]);
      }
    } catch (error) {
      console.error('Error fetching absensi:', error);
      showToast('Gagal memuat data absensi', 'error');
      setAbsensiData([]);
    } finally {
      setLoadingAbsensi(false);
    }
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  // ── Toast Helper ─────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => setToast({ ...toast, visible: false });

  // ── Select Jadwal ────────────────────────────────────────
  const handleSelectJadwal = (jadwal: any) => {
    setSelectedJadwal(jadwal);
    fetchAbsensi(jadwal.id, jadwal.kelas_id);
    Animated.timing(detailAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    Animated.timing(detailAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedJadwal(null);
      setAbsensiData([]);
      setSearchQuery('');
      setFilterStatus('all');
    });
  };

  // ── Filter & Sort ────────────────────────────────────────
  const filteredAbsensi = absensiData
    .filter((item: any) => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'nama') return (a.name || '').localeCompare(b.name || '');
      return new Date(b.tanggal || 0).getTime() - new Date(a.tanggal || 0).getTime();
    });

  // ── Rekap ────────────────────────────────────────────────
  const rekap = {
    hadir: absensiData.filter((d: any) => d.status === 'hadir').length,
    telat: absensiData.filter((d: any) => d.status === 'terlambat').length,
    izin: absensiData.filter((d: any) => d.status === 'izin').length,
    alfa: absensiData.filter((d: any) => d.status === 'alfa').length,
  };
  const totalMahasiswa = selectedJadwal?.total_students || 0;
  const persentaseKehadiran = totalMahasiswa > 0
    ? Math.round(((rekap.hadir + rekap.telat) / totalMahasiswa) * 100)
    : 0;

  // ── Export PDF ───────────────────────────────────────────
  const downloadPDF = async () => {
    Alert.alert('Info', 'Fitur ekspor PDF dinonaktifkan sementara untuk perbaikan.');
    /*
    setLoadingPDF(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      // ... rest of code
    } catch (err: any) {
      console.error('PDF Error:', err);
    } finally {
      setLoadingPDF(false);
    }
    */
  };

  // ── Export Excel ─────────────────────────────────────────
  const downloadExcel = async () => {
    Alert.alert('Info', 'Fitur ekspor Excel dinonaktifkan sementara untuk perbaikan.');
    /*
    setLoadingExcel(true);
    try {
      const workbook = XLSX.utils.book_new();
      // ... rest of code
    } catch (err: any) {
      console.error('Excel Error:', err);
    } finally {
      setLoadingExcel(false);
    }
    */
  };

  // ── Download Report (wrapper) ────────────────────────────
  const downloadReport = async (type: 'pdf' | 'excel') => {
    if (type === 'pdf') {
      await downloadPDF();
    } else {
      await downloadExcel();
    }
  };

  return (
    <AnimatedBackground style={{ flex: 1 }}>
      {selectedJadwal ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* HEADER */}
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.backButtonGradient}
                >
                  {/* @ts-ignore */}
                  <ArrowLeft color="#60a5fa" size={24} />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.title}>{selectedJadwal?.class_name || 'Detail Jadwal'}</Text>
              {/* @ts-ignore */}
              <Sparkles color="#60a5fa" size={20} />
            </View>
          </View>

          {/* INFO JADWAL */}
          <AnimatedInfoCard delay={0}>
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBg}
                >
                  {/* @ts-ignore */}
                  <GraduationCap size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.section}>Informasi Jadwal Kuliah</Text>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>👨‍🏫 Dosen</Text>
                  <Text style={styles.infoValue}>{selectedJadwal?.dosen_name || '-'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📚 Mata Kuliah</Text>
                  <Text style={styles.infoValue}>{selectedJadwal?.subject || '-'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🏫 Ruangan</Text>
                  <Text style={styles.infoValue}>{selectedJadwal?.ruang || '-'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🕐 Jam Kuliah</Text>
                  <Text style={styles.infoValue}>{`${selectedJadwal?.jam_mulai || '-'} - ${selectedJadwal?.jam_selesai || '-'}`}</Text>
                </View>
              </View>
            </BlurView>
          </AnimatedInfoCard>

          {/* REKAP ABSENSI */}
          <AnimatedInfoCard delay={100}>
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#6366f1', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBg}
                >
                  {/* @ts-ignore */}
                  <Users size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.section}>Rekap Absensi Mahasiswa</Text>
              </View>
              <View style={styles.statGrid}>
                <AnimatedStatCard
                  index={0}
                  color="#22c55e"
                  number={rekap.hadir}
                  label="Hadir"
                  icon={<ColoredIcon icon={CheckCircle} size={24} color="#22c55e" />}
                />
                <AnimatedStatCard
                  index={1}
                  color="#eab308"
                  number={rekap.telat}
                  label="Telat"
                  icon={<ColoredIcon icon={Clock} size={24} color="#eab308" />}
                />
                <AnimatedStatCard
                  index={2}
                  color="#2563eb"
                  number={rekap.izin}
                  label="Izin"
                  icon={<ColoredIcon icon={FileX} size={24} color="#2563eb" />}
                />
                <AnimatedStatCard
                  index={3}
                  color="#ef4444"
                  number={rekap.alfa}
                  label="Alfa"
                  icon={<ColoredIcon icon={AlertCircle} size={24} color="#ef4444" />}
                />
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Total Kehadiran</Text>
                  <Text style={styles.progressPercentage}>{persentaseKehadiran}%</Text>
                </View>
                <LinearGradient
                  colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBarContainer}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressBarFill,
                      { width: `${persentaseKehadiran}%` },
                    ]}
                  />
                </LinearGradient>
              </View>
            </BlurView>
          </AnimatedInfoCard>

          {/* DAFTAR ABSENSI */}
          <AnimatedInfoCard delay={200}>
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.sectionHeader}>
                <LinearGradient
                  colors={['#ec4899', '#db2777']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBg}
                >
                  {/* @ts-ignore */}
                  <FileText size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.section}>Daftar Absensi ({filteredAbsensi.length})</Text>
              </View>

              {loadingAbsensi ? (
                <ActivityIndicator size="large" color="#60a5fa" style={{ marginVertical: 20 }} />
              ) : (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableCol1, styles.tableHeaderText]}>Nama</Text>
                    <Text style={[styles.tableCol2, styles.tableHeaderText]}>Status</Text>
                    <Text style={[styles.tableCol3, styles.tableHeaderText]}>Tanggal</Text>
                  </View>
                  {filteredAbsensi.map((d, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.tableCol1, styles.tableText]}>{d.name || '-'}</Text>
                      <View style={[styles.tableCol2, styles.statusBadge]}>
                        <LinearGradient
                          colors={[statusColor[d.status] + '30', statusColor[d.status] + '10']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.statusBadgeGradient}
                        >
                          <Text style={[styles.tableText, { color: statusColor[d.status], fontWeight: '600' }]}>
                            {statusLabel[d.status] || d.status}
                          </Text>
                        </LinearGradient>
                      </View>
                      <Text style={[styles.tableCol3, styles.tableText, { fontSize: 12 }]}>
                        {d.tanggal ? new Date(d.tanggal).toLocaleDateString('id-ID') : '-'}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </BlurView>
          </AnimatedInfoCard>

          {/* EXPORT BUTTONS */}
          <AnimatedInfoCard delay={300}>
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.exportBtn,
                  styles.excelBtn,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
                onPress={() => downloadReport('excel')}
                disabled={loadingExcel}
              >
                {loadingExcel ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    {/* @ts-ignore */}
                    <FileSpreadsheet size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Excel</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.exportBtn,
                  styles.pdfBtn,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
                onPress={() => downloadReport('pdf')}
                disabled={loadingPDF}
              >
                {loadingPDF ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    {/* @ts-ignore */}
                    <FileText size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>PDF</Text>
                  </>
                )}
              </Pressable>
            </View>
          </AnimatedInfoCard>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* HEADER */}
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.backButtonGradient}
                >
                  {/* @ts-ignore */}
                  <ArrowLeft color="#60a5fa" size={24} />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.title}>Jadwal Kelas</Text>
              {/* @ts-ignore */}
              <Sparkles color="#60a5fa" size={20} />
            </View>
          </View>

          {/* JADWAL LIST */}
          <View style={styles.klasListContainer}>
            {loadingJadwal ? (
              <ActivityIndicator size="large" color="#60a5fa" style={{ marginVertical: 40 }} />
            ) : Object.keys(jadwalPerHari).length > 0 ? (
              Object.entries(jadwalPerHari).map(([day, jadwalList]) => (
                <View key={day} style={{ marginBottom: 24 }}>
                  <Text style={styles.dayLabel}>{dayLabels[day] || day}</Text>
                  {jadwalList.map((jadwal, idx) => (
                    <Pressable
                      key={jadwal.id}
                      style={({ pressed }) => [
                        styles.klasCard,
                        pressed && { transform: [{ scale: 0.97 }] },
                      ]}
                      onPress={() => handleSelectJadwal(jadwal)}
                    >
                      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                      <View style={styles.klasCardHeader}>
                        <View>
                          <Text style={styles.klasName}>{jadwal.class_name || '-'}</Text>
                          <Text style={styles.klasMatkul}>📖 {jadwal.subject || '-'}</Text>
                        </View>
                        {/* @ts-ignore */}
                        <ChevronRight color="#60a5fa" size={20} />
                      </View>
                      <View style={styles.klasInfoRow}>
                        <Text style={styles.klasInfo}>👨‍🏫 {jadwal.dosen_name || '-'}</Text>
                        <Text style={styles.klasInfo}>⏰ {jadwal.jam_mulai || '-'}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Tidak ada jadwal</Text>
            )}
          </View>
        </ScrollView>
      )}

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </AnimatedBackground>
=======
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  Calendar, Clock, MapPin, User, BookOpen,
  ChevronRight, ArrowLeft, RefreshCw, BarChart3,
  Users, CheckCircle2
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

export default function AdminJadwalScreen() {
  const navigation = useNavigation<any>();
  const [activeDay, setActiveDay] = useState('senin');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/jadwal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setSchedules(result.data);
      }
    } catch (err) {
      console.error('Fetch jadwal error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredSchedules = schedules.filter(s => s.hari.toLowerCase() === activeDay);

  const ScheduleCard = ({ item }: { item: any }) => {
    const attendanceRate = item.total_students > 0 
      ? Math.round((item.attended_count / item.total_students) * 100) 
      : 0;

    return (
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <BookOpen size={20} color={Colors.ai.primary} />
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.classText}>{item.class_name}</Text>
          </View>
          <View style={styles.timeBadge}>
            <Clock size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timeText}>{item.jam_mulai.substring(0, 5)}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <User size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.detailText} numberOfLines={1}>{item.dosen_name}</Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.detailText}>{item.ruang}</Text>
          </View>
        </View>

        <View style={styles.recapContainer}>
          <View style={styles.recapHeader}>
            <View style={styles.recapTitleRow}>
              <BarChart3 size={14} color={Colors.ai.secondary} />
              <Text style={styles.recapTitle}>Rekap Absensi Hari Ini</Text>
            </View>
            <Text style={styles.attendancePercent}>{attendanceRate}%</Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${attendanceRate}%` }]} />
          </View>

          <View style={styles.recapFooter}>
            <View style={styles.statBox}>
              <Users size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.statLabel}>Total: {item.total_students}</Text>
            </View>
            <View style={styles.statBox}>
              <CheckCircle2 size={12} color="#34D399" />
              <Text style={[styles.statLabel, { color: '#34D399' }]}>Hadir: {item.attended_count}</Text>
            </View>
          </View>
        </View>
      </BlurView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Jadwal Perkuliahan</Text>
            <Text style={styles.headerSubtitle}>Monitor class activities and attendance</Text>
          </View>
          <TouchableOpacity 
            onPress={fetchSchedules} 
            disabled={isLoading}
            style={styles.refreshButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setActiveDay(day)}
                style={[
                  styles.dayTab,
                  activeDay === day && styles.dayTabActive
                ]}
              >
                <Text style={[
                  styles.dayTabText,
                  activeDay === day && styles.dayTabTextActive
                ]}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                {activeDay === day && <View style={styles.activeDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading && schedules.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.ai.primary} />
            <Text style={styles.loadingText}>Loading schedules...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((item) => (
                <ScheduleCard key={item.id} item={item} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Calendar size={64} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>Tidak ada jadwal untuk hari {activeDay}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </View>
>>>>>>> 7bf8a6b (update)
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  // HEADER
  headerContainer: {
    paddingTop: 50,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    flex: 1,
    marginHorizontal: 12,
  },

  // CARD STYLING
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
=======
  container: { flex: 1 },
  background: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 79, 168, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectorContainer: {
    marginBottom: 20,
  },
  dayScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayTabActive: {
    backgroundColor: 'rgba(30, 79, 168, 0.3)',
    borderColor: Colors.ai.primary,
  },
  dayTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  dayTabTextActive: {
    color: '#fff',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ai.primary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 79, 168, 0.15)',
>>>>>>> 7bf8a6b (update)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
<<<<<<< HEAD
  section: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  // INFO GRID
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },

  // STAT GRID
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 18,
  },
  statCard: {
    width: '50%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 8,
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },

  // PROGRESS BAR
  progressBar: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },

  // TABLE STYLING
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  tableHeaderText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.05)',
    alignItems: 'center',
  },
  tableCol1: {
    flex: 2,
  },
  tableCol2: {
    flex: 1.2,
  },
  tableCol3: {
    flex: 0.8,
  },
  tableText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // BUTTON STYLING
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderWidth: 1,
  },
  excelBtn: {
    backgroundColor: '#16a34a',
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  pdfBtn: {
    backgroundColor: '#dc2626',
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // KELAS LIST
  klasListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  klasCard: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
  },
  klasCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  klasName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  klasMatkul: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  klasInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  klasInfo: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  dayLabel: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 40,
  },

  // TOAST STYLES
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    zIndex: 1000,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // SKELETON STYLES
  skeletonCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  skeletonLine: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    borderRadius: 8,
  },
});
=======
  titleInfo: {
    flex: 1,
  },
  subjectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  classText: {
    color: Colors.ai.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  recapContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  recapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recapTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  attendancePercent: {
    color: Colors.ai.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.ai.secondary,
    borderRadius: 3,
  },
  recapFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 16,
    fontSize: 15,
  }
});
>>>>>>> 7bf8a6b (update)
