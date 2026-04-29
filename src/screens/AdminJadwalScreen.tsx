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
    <View style={{ flex: 1, backgroundColor: '#0a0e27' }}>
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
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
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
            </LinearGradient>
          </AnimatedInfoCard>

          {/* REKAP ABSENSI */}
          <AnimatedInfoCard delay={100}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
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
            </LinearGradient>
          </AnimatedInfoCard>

          {/* DAFTAR ABSENSI */}
          <AnimatedInfoCard delay={200}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
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
            </LinearGradient>
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
                      <LinearGradient
                        colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
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
    </View>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
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