import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Platform, Linking, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { API_URL } from '../../constants/Config';
import {
  CheckCircle2, XCircle, Clock,
  Users, RefreshCw, Radio,
  AlertTriangle, ShieldCheck, Zap, MapPin,
  Wifi, WifiOff, Clock3, Bell
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import io from 'socket.io-client';
import ReportIssueModal from '../components/ReportIssueModal';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function DosenDashboardScreen() {
  const navigation = useNavigation<any>();
  const { tokens, isLightTheme } = useTheme();
  
  // States
  const [showReportModal, setShowReportModal] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [iotOnline, setIotOnline] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [namaDosen, setNamaDosen] = useState("Memuat Nama...");

  const dosenId = 3; 

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  // Polling Status IoT & Timer
  useEffect(() => {
    fetchSchedules();
    checkIotStatus();

    const interval = setInterval(() => {
      checkIotStatus();
      if (activeSessionId) {
        setSessionDuration(prev => prev + 5);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSessionId]);

  // Socket.io Realtime
  useEffect(() => {
    const socket = io(API_URL);
    socket.on('new_attendance', (data: any) => {
      setStudents(prev => prev.map(s => 
        (s.name === data.name || s.id === data.user_id) ? { ...s, status: 'HADIR' } : s
      ));
    });
    return () => { socket.disconnect(); };
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_URL}/jadwal?dosen_id=${dosenId}`);
      const data = await response.json();
      if (data?.data) {
        setSchedules(data.data);
        if (data.data.length > 0) setNamaDosen(data.data[0].dosen_name || "Bapak/Ibu Dosen");
      }
    } catch (error) { console.log('FETCH JADWAL ERROR'); }
  };

  const checkIotStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/test`);
      const data = await response.json();
      setIotOnline(!!data?.success);
    } catch (error) { setIotOnline(false); }
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
          nomor_ortu: student.nomor_ortu || "6285775607738",
          prodi: student.prodi || "Teknik Informatika"
        }));
        setStudents(formatted);
      }
    } catch (error) { console.log("START SESSION ERROR"); }
  };

  const fetchRealtimeScan = async () => {
    try {
      setIsScanning(true);
      const response = await fetch(`${API_URL}/iot/recognize`, { method: 'POST' });
      const data = await response.json();
      if (data?.name) {
        setStudents(prev => prev.map(s => s.name === data.name ? { ...s, status: 'HADIR' } : s));
      } else {
        showAlert("Info", "Tidak ada wajah terdeteksi.");
      }
    } catch (error) {
      showAlert("Error", "Koneksi ke ESP32 terputus.");
    } finally { setIsScanning(false); }
  };

  const allowManualScan = async (studentId: any) => {
    setStudents(prev => prev.map(s => String(s.id) === String(studentId) ? { ...s, status: 'HADIR' } : s));
    try {
      await fetch(`${API_URL}/manual-scan/allow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: studentId }),
      });
    } catch (error) { console.log('Manual scan backend error'); }
  };

  const sendIndividualReport = (student: any) => {
    const activeSchedule = schedules.find(s => s.id === activeSessionId);
    if (!activeSchedule) return showAlert("Error", "Jadwal tidak ditemukan.");

    const linkPdf = `${API_URL}/reports/pdf?jadwal_id=${activeSessionId}`;
    const pesan = 
`*LAPORAN KEHADIRAN MAHASISWA - ATTENDIFY*

Yth. Orang Tua/Wali dari *${student.name}*,

Menginformasikan bahwa putra/putri Bapak/Ibu pada mata kuliah berikut:

◈ *Mata Kuliah:* ${activeSchedule.subject}
◈ *Dosen:* ${namaDosen}
◈ *Prodi/Kelas:* ${student.prodi} / ${activeSchedule.class_name}
◈ *Jam:* ${activeSchedule.jam_mulai} - ${activeSchedule.jam_selesai}
◈ *Status:* *${student.status}*

Laporan lengkap kelas ini dapat dilihat pada PDF berikut:
${linkPdf}

Terima kasih.`;

    const urlWa = `https://wa.me/${student.nomor_ortu}?text=${encodeURIComponent(pesan)}`;
    if (Platform.OS === 'web') window.open(urlWa, '_blank');
    else Linking.openURL(urlWa);
  };

  const finishSession = () => {
    setActiveSessionId(null);
    setStudents([]);
    setSessionDuration(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <AnimatedBackground style={styles.background}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* HEADER */}
          <View style={styles.topHeader}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerSub}>Selamat datang,</Text>
                <Text style={styles.headerTitle}>{namaDosen}</Text>
              </View>
              
              <View style={styles.actionHeader}>
                {/* LONCENG NOTIFIKASI BERPINDAH KE SCREEN NOTIFIKASI */}
                <TouchableOpacity 
                  style={styles.notifBtn} 
                  onPress={() => navigation.navigate('Notification')} // <--- Jika error ganti ke 'Notifikasi' sesuai nama di App.tsx/RootNavigator
                >
                   <Bell size={20} color="white" />
                   <View style={styles.notifBadge} />
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
              <Text style={{ color: 'white', fontWeight: 'bold' }}>ESP32 Status</Text>
            </View>
            <Text style={{ color: iotOnline ? '#4ADE80' : '#EF4444', marginTop: 5, fontSize: 12 }}>
              {iotOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </Text>
          </View>

          {/* JADWAL LIST */}
          <View style={styles.scheduleContainer}>
            <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
            {schedules.map((item: any) => (
              <View key={item.id} style={styles.scheduleCard}>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.meta}>{item.class_name} | Ruang: {item.ruang}</Text>
                <Text style={styles.time}>{item.jam_mulai} - {item.jam_selesai}</Text>

                {activeSessionId === item.id ? (
                  <View style={{ marginTop: 15 }}>
                    <View style={styles.timerCard}>
                      <Clock3 size={18} color="#FACC15" />
                      <Text style={{ color: 'white', marginLeft: 10 }}>Durasi: {sessionDuration}s</Text>
                    </View>

                    <TouchableOpacity style={styles.scanBtn} onPress={fetchRealtimeScan} disabled={isScanning}>
                      <Text style={styles.scanBtnText}>{isScanning ? 'Scanning...' : 'Trigger IoT Scan'}</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                      <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#DC2626' }]} 
                        onPress={() => Linking.openURL(`${API_URL}/reports/pdf?jadwal_id=${activeSessionId}`)}>
                        <Text style={styles.btnText}>PDF</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.exportBtn, { backgroundColor: '#16A34A' }]}
                        onPress={() => Linking.openURL(`${API_URL}/reports/excel?jadwal_id=${activeSessionId}`)}>
                        <Text style={styles.btnText}>Excel</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.finishBtn} onPress={finishSession}>
                      <Text style={styles.btnText}>Selesaikan Sesi</Text>
                    </TouchableOpacity>

                    <View style={{ marginTop: 20 }}>
                      <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 10 }}>Daftar Mahasiswa:</Text>
                      {students.map((s) => (
                        <View key={s.id} style={styles.studentCard}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{s.name}</Text>
                            <Text style={{ color: s.status === 'HADIR' ? '#4ADE80' : '#EF4444', fontSize: 12 }}>{s.status}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 5 }}>
                            <TouchableOpacity onPress={() => sendIndividualReport(s)} style={styles.smallBtnWa}>
                              <Text style={styles.smallBtnText}>WA</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => allowManualScan(s.id)} 
                              style={[styles.smallBtnManual, { opacity: s.status === 'HADIR' ? 0.5 : 1 }]} 
                              disabled={s.status === 'HADIR'}>
                              <Text style={styles.smallBtnText}>Manual</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.startBtn} onPress={() => startSession(item)}>
                    <Text style={styles.startBtnText}>Mulai Sesi</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
        <ReportIssueModal visible={showReportModal} onClose={() => setShowReportModal(false)} />
      </AnimatedBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, 
  background: { flex: 1 }, 
  scroll: { paddingBottom: 50 },
  topHeader: { paddingTop: 50, paddingHorizontal: 20, marginBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' }, 
  headerSub: { color: '#CBD5E1' },
  notifBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, position: 'relative' },
  notifBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4, borderWidth: 1, borderColor: '#1E293B' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#FBBF24', padding: 8, borderRadius: 10 },
  reportText: { color: '#FBBF24', fontSize: 12, fontWeight: 'bold' },
  iotCard: { backgroundColor: '#1E293B', marginHorizontal: 20, padding: 15, borderRadius: 15, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  scheduleContainer: { paddingHorizontal: 20 }, 
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 15 },
  scheduleCard: { backgroundColor: '#334155', padding: 20, borderRadius: 20, marginBottom: 15 },
  subject: { fontSize: 18, fontWeight: 'bold', color: 'white' }, 
  meta: { color: '#94A3B8', fontSize: 14 },
  time: { color: '#60A5FA', marginTop: 5, fontWeight: 'bold' },
  startBtn: { backgroundColor: '#3B82F6', marginTop: 15, padding: 12, borderRadius: 12, alignItems: 'center' },
  startBtnText: { color: 'white', fontWeight: 'bold' },
  timerCard: { backgroundColor: '#0F172A', padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scanBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  scanBtnText: { color: 'white', fontWeight: 'bold' },
  exportBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  finishBtn: { backgroundColor: '#EF4444', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  studentCard: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  smallBtnWa: { backgroundColor: '#25D366', padding: 8, borderRadius: 8 },
  smallBtnManual: { backgroundColor: '#3B82F6', padding: 8, borderRadius: 8 },
  smallBtnText: { color: 'white', fontSize: 11, fontWeight: 'bold' }
});