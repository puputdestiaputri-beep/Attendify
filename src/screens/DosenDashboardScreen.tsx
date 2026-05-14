import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Platform, Linking
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
import ReportIssueModal from '../components/ReportIssueModal';
import { AlertTriangle, Wifi, WifiOff, Clock3, Bell } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import io from 'socket.io-client';

const API_URL = 'http://127.0.0.1:5000/api'; 

export default function DosenDashboardScreen() {
  const navigation = useNavigation<any>();
  const { tokens, isLightTheme } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterType>('Semua');
  const [studentsList, setStudentsList] = useState<any[]>(STUDENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const { tokens } = useTheme();

  const [showReportModal, setShowReportModal] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [lastScan, setLastScan] = useState('Belum ada scan');
  const [isScanning, setIsScanning] = useState(false);
  const [iotOnline, setIotOnline] = useState(false);
  const [lastPing, setLastPing] = useState('');
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // ==========================================
  // DATA LOGIN DOSEN
  // ==========================================
  // Nanti dosenId ini diambil dari Context / Async Storage pas Login beneran
  const dosenId = 3;
  const [namaDosen, setNamaDosen] = useState("Memuat Nama..."); 

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

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
    fetchSchedules();
    checkIotStatus();
    fetchRecentScans();
    fetchRecentLogs();

    const interval = setInterval(() => {
      fetchSchedules();
      checkIotStatus();
      fetchRecentScans();
      fetchRecentLogs();
      if (activeSessionId) setSessionDuration(prev => prev + 5);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSessionId]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_URL}/jadwal?dosen_id=${dosenId}`);
      const data = await response.json();
      if (data?.data) {
        setSchedules(data.data);
        
        // PERBAIKAN: Mengambil nama dosen dari API (jika ada)
        // Cek struktur JSON backend-mu, misal: data.dosen_name atau data.data[0].dosen_name
        if (data.dosen_name) {
          setNamaDosen(data.dosen_name);
        } else if (data.data.length > 0 && data.data[0].dosen_name) {
          setNamaDosen(data.data[0].dosen_name);
        } else {
          setNamaDosen("Bapak/Ibu Dosen"); // Default kalau backend belum ngirim namanya
        }
      }
    } catch (error) { console.log('FETCH JADWAL ERROR'); }
  };

  const checkIotStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/test`);
      const data = await response.json();
      if (data?.success) {
        setIotOnline(true);
        setLastPing(new Date().toLocaleTimeString());
      }
    } catch (error) { setIotOnline(false); }
  };

  const fetchRecentScans = async () => {
    try {
      const response = await fetch(`${API_URL}/iot/logs`);
      const data = await response.json();
      if (data?.data) setRecentScans(data.data);
    } catch (error) {}
  };

  const fetchRecentLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/logs/recent`);
      const data = await response.json();
      if (data?.data) setRecentLogs(data.data);
    } catch (error) {}
  };

  const startSession = async (item: any) => {
    setActiveSessionId(item.id);
    setSessionDuration(0);
    try {
      const response = await fetch(`${API_URL}/kelas/${item.kelas_id}/mahasiswa`);
      const data = await response.json();
      if (data?.students) {
        const formatted = data.students.map((student: any, index: number) => ({
          id: student.id || student.user_id || index, 
          name: student.nama, 
          status: 'BELUM HADIR',
          nomor_ortu: student.nomor_ortu || "6285775607738", // Tetap pakai nomor tes kamu
          prodi: student.prodi || "Teknik Informatika"
        }));
        setStudents(formatted);
      }
    } catch (error) {}
  };

  const fetchRealtimeScan = async () => {
    try {
      setIsScanning(true);
      const response = await fetch(`${API_URL}/iot/recognize`, { method: 'POST' });
      const data = await response.json();

      if (data?.name) {
        setLastScan(`${data.name} berhasil discan`);
        setNotifications(prev => [{ id: Date.now(), text: `${data.name} hadir` }, ...prev]);
        setStudents((prev: any) =>
          prev.map((student: any) => student.name === data.name ? { ...student, status: 'HADIR' } : student)
        );
      } else {
        showAlert("Info", "Tidak ada wajah terdeteksi.");
      }
    } catch (error) {
      setLastScan('Scan gagal');
      showAlert("Error", "Koneksi ke ESP32 terputus.");
    } finally {
      setIsScanning(false);
    }
  };

  const allowManualScan = async (studentId: any) => {
    setStudents((prev: any) =>
      prev.map((student: any) => 
        String(student.id) === String(studentId) ? { ...student, status: 'HADIR' } : student
      )
    );
    try {
      await fetch(`${API_URL}/manual-scan/allow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: studentId }),
      });
    } catch (error) { console.log('Gagal update ke backend'); }
  };

  const sendIndividualReport = (student: any) => {
    const activeSchedule = schedules.find(s => s.id === activeSessionId);
    if (!activeSchedule) {
      showAlert("Error", "Data jadwal tidak ditemukan.");
      return;
    }

    const namaKelas = activeSchedule.class_name || "-";
    const jamMatkul = `${activeSchedule.jam_mulai} - ${activeSchedule.jam_selesai}`;
    const statusHadir = student.status === 'HADIR' ? '✅ HADIR' : '❌ TIDAK HADIR';
    
    // PERBAIKAN: Link PDF sekarang mengirimkan ID Jadwal ke Backend
    const linkPdf = `${API_URL}/reports/pdf?jadwal_id=${activeSessionId}`;

    const pesan = `*LAPORAN KEHADIRAN MAHASISWA - ATTENDIFY*\n\nYth. Orang Tua/Wali dari *${student.name}*,\n\nMenginformasikan bahwa putra/putri Bapak/Ibu pada mata kuliah berikut:\n\n📌 *Mata Kuliah:* ${activeSchedule.subject}\n👤 *Dosen:* ${namaDosen}\n🎓 *Prodi/Kelas:* ${student.prodi} / ${namaKelas}\n⏰ *Jam:* ${jamMatkul}\n📊 *Status:* ${statusHadir}\n\nLaporan lengkap kelas ini dapat dilihat pada PDF berikut:\n${linkPdf}\n\nTerima kasih.`;

    const urlWa = `https://wa.me/${student.nomor_ortu}?text=${encodeURIComponent(pesan)}`;

    if (Platform.OS === 'web') {
      window.open(urlWa, '_blank');
    } else {
      Linking.openURL(urlWa).catch(() => {
        showAlert("Error", "Gagal membuka WhatsApp.");
      });
    }
  };

  const finishSession = () => {
    showAlert('Info', 'Sesi kelas telah diselesaikan.');
    setActiveSessionId(null);
    setStudents([]);
    setRecentScans([]);
    setNotifications([]);
    setSessionDuration(0);
    setLastScan('Belum ada scan');
  };

  const hadirCount = students.filter((student: any) => student.status === 'HADIR').length;
  const belumCount = students.filter((student: any) => student.status !== 'HADIR').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AnimatedBackground style={styles.background}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={styles.topHeader}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerSub}>Selamat datang kembali,</Text>
                <Text style={styles.headerTitle}>{namaDosen}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                <TouchableOpacity onPress={() => showAlert('Notifikasi', 'Tidak ada notifikasi baru')}>
                  <Bell size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.reportBtn} onPress={() => setShowReportModal(true)}>
                  <AlertTriangle size={18} color="#FBBF24" />
                  <Text style={styles.reportText}>Lapor</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* IOT STATUS */}
          <View style={styles.iotCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {iotOnline ? <Wifi size={20} color="#4ADE80" /> : <WifiOff size={20} color="#EF4444" />}
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>ESP32 Device</Text>
            </View>
            <Text style={{ color: iotOnline ? '#4ADE80' : '#EF4444', marginTop: 10, fontWeight: 'bold' }}>
              {iotOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </Text>
            <Text style={{ color: '#CBD5E1', marginTop: 6 }}>Last ping: {lastPing || '-'}</Text>
          </View>

          {/* JADWAL */}
          <View style={styles.scheduleContainer}>
            <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
            {schedules.length === 0 ? (
              <View style={{ backgroundColor: '#1E293B', padding: 24, borderRadius: 24 }}>
                <Text style={{ color: '#CBD5E1', textAlign: 'center', fontSize: 16 }}>Tidak ada jadwal</Text>
              </View>
            ) : (
              schedules.map((item: any) => (
                <View key={String(item.id)} style={styles.scheduleCard}>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <Text style={styles.meta}>Kelas: {item.class_name} | Ruang: {item.ruang}</Text>
                  <Text style={styles.time}>{item.jam_mulai} - {item.jam_selesai}</Text>

                  {activeSessionId === item.id ? (
                    <>
                      <View style={styles.activeBtn}><Text style={styles.activeBtnText}>Sesi Aktif</Text></View>
                      
                      <View style={styles.timerCard}>
                        <Clock3 size={18} color="#FACC15" />
                        <Text style={{ color: 'white', marginLeft: 10, fontWeight: 'bold' }}>
                          Durasi sesi: {sessionDuration} dtk
                        </Text>
                      </View>

                      <View style={{ marginTop: 24 }}>
                        <Text style={styles.scanTitle}>Sensor Scan Aktif</Text>
                        <View style={styles.scanBox}><Text style={{ color: 'white' }}>Last Scan: {lastScan}</Text></View>

                        <TouchableOpacity style={[styles.scanBtn, { opacity: isScanning ? 0.7 : 1 }]} onPress={fetchRealtimeScan} disabled={isScanning}>
                          <Text style={styles.scanBtnText}>{isScanning ? 'Mencari Wajah...' : 'Trigger Scan'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.finishBtn} onPress={finishSession}>
                          <Text style={styles.finishBtnText}>Selesaikan Sesi</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                        <TouchableOpacity style={{ flex: 1, backgroundColor: '#DC2626', padding: 14, borderRadius: 14, alignItems: 'center' }} 
                          onPress={() => { 
                            // PERBAIKAN: Mengirim jadwal_id ke backend saat export PDF
                            if(Platform.OS === 'web') window.open(`${API_URL}/reports/pdf?jadwal_id=${activeSessionId}`); 
                          }}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>Export PDF</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={{ flex: 1, backgroundColor: '#16A34A', padding: 14, borderRadius: 14, alignItems: 'center' }} 
                          onPress={() => { 
                            // PERBAIKAN: Mengirim jadwal_id ke backend saat export Excel
                            if(Platform.OS === 'web') window.open(`${API_URL}/reports/excel?jadwal_id=${activeSessionId}`); 
                          }}>
                          <Text style={{ color: 'white', fontWeight: 'bold' }}>Export Excel</Text>
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
                      <View style={styles.statsRow}>
                        <View style={styles.statsCard}><Text style={styles.statsNumber}>{hadirCount}</Text><Text style={styles.statsLabel}>Hadir</Text></View>
                        <View style={styles.statsCard}><Text style={styles.statsNumber}>{belumCount}</Text><Text style={styles.statsLabel}>Belum</Text></View>
                      </View>

                      <View style={{ marginTop: 24 }}>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Daftar Mahasiswa</Text>
                        {students.map((student: any) => (
                          <View key={student.id} style={styles.studentCard}>
                            <View style={{ flex: 1, paddingRight: 10 }}>
                              <Text style={styles.studentName}>{student.name}</Text>
                              <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>ID: {student.id}</Text>
                              <View style={{ backgroundColor: student.status === 'HADIR' ? '#16A34A' : '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 10 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 11 }}>{student.status}</Text>
                              </View>
                            </View>
                            
                            <View style={{ flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                              <TouchableOpacity 
                                style={{ backgroundColor: '#25D366', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                                onPress={() => sendIndividualReport(student)}
                              >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>WA Ortu</Text>
                              </TouchableOpacity>

                              <TouchableOpacity 
                                style={{ backgroundColor: student.status === 'HADIR' ? '#4B5563' : '#2563EB', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }} 
                                onPress={() => allowManualScan(student.id)} 
                                disabled={student.status === 'HADIR'}
                              >
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>{student.status === 'HADIR' ? 'Selesai' : 'Manual'}</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.startBtn} onPress={() => startSession(item)}>
                      <Text style={styles.startBtnText}>Mulai Sesi</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
        <ReportIssueModal visible={showReportModal} onClose={() => setShowReportModal(false)} />
      </AnimatedBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, background: { flex: 1 }, scroll: { paddingBottom: 80 },
  topHeader: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 4 }, headerSub: { color: '#CBD5E1', fontSize: 16 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#FBBF24', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  reportText: { color: '#FBBF24', fontWeight: 'bold' },
  iotCard: { backgroundColor: '#0F172A', marginHorizontal: 20, marginBottom: 24, padding: 22, borderRadius: 22 },
  scheduleContainer: { paddingHorizontal: 20 }, sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  scheduleCard: { backgroundColor: '#1E293B', padding: 28, borderRadius: 28, marginBottom: 26 },
  subject: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 12 }, meta: { color: '#CBD5E1', marginBottom: 6, fontSize: 15 },
  time: { color: '#60A5FA', fontWeight: 'bold', marginTop: 12, fontSize: 16 },
  startBtn: { backgroundColor: '#3B82F6', marginTop: 22, padding: 16, borderRadius: 16, alignItems: 'center' }, startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  activeBtn: { backgroundColor: '#16A34A', marginTop: 22, padding: 16, borderRadius: 16, alignItems: 'center' }, activeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  timerCard: { marginTop: 20, backgroundColor: '#0F172A', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
  scanTitle: { color: '#4ADE80', fontWeight: 'bold', marginBottom: 14, fontSize: 16 }, scanBox: { backgroundColor: '#1E3A8A', padding: 16, borderRadius: 16, marginBottom: 16 },
  scanBtn: { backgroundColor: '#2563EB', padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 16 }, scanBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  finishBtn: { backgroundColor: '#EF4444', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 24 }, finishBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 24 }, statsCard: { flex: 1, backgroundColor: '#334155', padding: 24, borderRadius: 20, alignItems: 'center' },
  statsNumber: { color: 'white', fontSize: 32, fontWeight: 'bold' }, statsLabel: { color: '#CBD5E1', marginTop: 8, fontSize: 15 },
  studentCard: { backgroundColor: '#334155', padding: 20, borderRadius: 20, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentName: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});