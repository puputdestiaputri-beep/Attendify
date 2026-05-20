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
  Wifi, WifiOff, Clock3, Bell, FileText
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/Colors';
import { useSocket } from '../context/SocketContext';
import ReportIssueModal from '../components/ReportIssueModal';

export default function DosenDashboardScreen() {
  const navigation = useNavigation<any>();
  const { tokens, isLightTheme } = useTheme();
  
  // States
  const { socket } = useSocket();
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
    if (!socket) return;
    
    const handleNewAttendance = (data: any) => {
      setStudents(prev => prev.map(s => 
        (s.name === data.name || s.id === data.user_id) ? { ...s, status: 'HADIR' } : s
      ));
    };

    socket.on('new_attendance', handleNewAttendance);
    
    return () => { 
      socket.off('new_attendance', handleNewAttendance); 
    };
  }, [socket]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${API_URL}/jadwal?dosen_id=${dosenId}`);
      const data = await response.json();
      if (data?.data && Array.isArray(data.data)) {
        setSchedules(data.data);
        if (data.data.length > 0) setNamaDosen(data.data[0].dosen_name || "Bapak/Ibu Dosen");
      } else {
        setSchedules([]);
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
      if (data?.students && Array.isArray(data.students)) {
        const formatted = data.students.map((student: any, index: number) => ({
          id: student.id || student.user_id || index, 
          name: student.nama || "Unknown", 
          status: 'BELUM HADIR',
          nomor_ortu: student.nomor_ortu || "6285775607738",
          prodi: student.prodi || "Teknik Informatika"
        }));
        setStudents(formatted);
      } else {
        setStudents([]);
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

  const finishSession = async () => {
    // Calculate attendance summary
    const presentCount = students.filter(s => s.status === 'HADIR').length;
    const absentCount = students.filter(s => s.status !== 'HADIR').length;
    const totalCount = presentCount + absentCount;
    const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
    
    const activeSchedule = schedules.find(s => s.id === activeSessionId);

    const cleanup = () => {
      setActiveSessionId(null);
      setStudents([]);
      setSessionDuration(0);
    };

    const sendToAdminWA = () => {
      const linkPdf = `${API_URL}/reports/pdf?jadwal_id=${activeSchedule?.id}`;
      const pesan = `Assalamu'alaikum Admin,
Berikut adalah laporan absensi untuk sesi kelas yang baru saja diselesaikan:

◈ *Mata Kuliah:* ${activeSchedule?.subject || '-'}
◈ *Dosen:* ${namaDosen}
◈ *Kelas:* ${activeSchedule?.class_name || '-'}
◈ *Waktu:* ${activeSchedule?.jam_mulai} - ${activeSchedule?.jam_selesai}
◈ *Kehadiran:* ${presentCount} dari ${totalCount} Mahasiswa (${percentage.toFixed(0)}%)

Mohon bantuannya untuk meninjau data ini dan meneruskannya kepada Kaprodi serta pihak terkait.
Link Laporan PDF: ${linkPdf}

Terima kasih.`;

      // Gunakan nomor WhatsApp Admin (contoh: 6281234567890, sesuaikan dengan nomor asli)
      const adminNumber = '6282124247810'; 
      const urlWa = `https://wa.me/${adminNumber}?text=${encodeURIComponent(pesan)}`;
      if (Platform.OS === 'web') window.open(urlWa, '_blank');
      else Linking.openURL(urlWa);
    };

    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      // Kirim laporan harian ke admin secara otomatis
      await fetch(`${API_URL}/reports/daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: activeSchedule?.kelas_id || '1',
          report_date: new Date().toISOString().split('T')[0],
          total_present: presentCount,
          total_late: 0,
          total_absent: absentCount,
          attendance_percentage: percentage,
          notes: "Laporan otomatis dikirim saat sesi kelas diselesaikan."
        })
      });

      if (Platform.OS === 'web') {
        const confirmSend = window.confirm("Sesi diselesaikan dan data absen berhasil dikirim ke Admin. Apakah Anda ingin mengirim pesan WhatsApp ke Admin untuk diteruskan ke Kaprodi?");
        if (confirmSend) {
          sendToAdminWA();
        }
        cleanup();
      } else {
        Alert.alert(
          "Sukses",
          "Sesi diselesaikan dan data absen berhasil dikirim ke sistem Admin. Apakah Anda ingin mengirimkan laporan via WhatsApp ke Admin?",
          [
            { text: "Tidak", style: "cancel", onPress: cleanup },
            { text: "Kirim WA", onPress: () => { sendToAdminWA(); cleanup(); } }
          ]
        );
      }
    } catch (error) {
      console.log('Error auto-sending report', error);
      showAlert("Info", "Sesi diselesaikan, namun gagal mengirim laporan otomatis.");
      cleanup();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isLightTheme ? "dark-content" : "light-content"} />
      <AnimatedBackground style={styles.background}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          {/* HEADER */}
          <View style={styles.topHeader}>
            <View style={[styles.headerRow, { flexWrap: 'wrap', gap: 10 }]}>
              <View style={{ flex: 1, minWidth: 150 }}>
                <Text style={[styles.headerSub, { color: tokens.subTextColor }]}>Selamat datang,</Text>
                <Text style={[styles.headerTitle, { color: tokens.textColor }]} numberOfLines={1} adjustsFontSizeToFit>{namaDosen}</Text>
              </View>
              
              <View style={styles.actionHeader}>
                <TouchableOpacity 
                  style={[styles.notifBtn, { backgroundColor: tokens.iconButtonBg, borderColor: tokens.borderColor }]} 
                  onPress={() => navigation.navigate('Notification')}
                >
                   <Bell size={20} color={tokens.textColor} />
                   <View style={styles.notifBadge} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.reportBtn, { borderColor: isLightTheme ? '#1E4FA8' : '#FBBF24' }]} onPress={() => navigation.navigate('DosenDailyReport')}>
                  <FileText size={18} color={isLightTheme ? '#1E4FA8' : '#FBBF24'} />
                  <Text style={[styles.reportText, { color: isLightTheme ? '#1E4FA8' : '#FBBF24' }]}>Harian</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.reportBtn, { borderColor: isLightTheme ? '#EF4444' : '#FCA5A5', marginLeft: 5 }]} onPress={() => setShowReportModal(true)}>
                  <AlertTriangle size={18} color={isLightTheme ? '#EF4444' : '#FCA5A5'} />
                  <Text style={[styles.reportText, { color: isLightTheme ? '#EF4444' : '#FCA5A5' }]}>Lapor</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* IOT STATUS */}
          <BlurView intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.iotCard, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {iotOnline ? <Wifi size={20} color="#4ADE80" /> : <WifiOff size={20} color="#EF4444" />}
              <Text style={{ color: tokens.textColor, fontWeight: 'bold' }}>ESP32 Status</Text>
            </View>
            <Text style={{ color: iotOnline ? '#4ADE80' : '#EF4444', marginTop: 5, fontSize: 12 }}>
              {iotOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
            </Text>
          </BlurView>

          {/* JADWAL LIST */}
          <View style={styles.scheduleContainer}>
            <Text style={[styles.sectionTitle, { color: tokens.textColor }]}>Jadwal Hari Ini</Text>
            {schedules.map((item: any) => (
              <BlurView key={item.id} intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.scheduleCard, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
                <Text style={[styles.subject, { color: tokens.textColor }]}>{item.subject || 'Mata Kuliah'}</Text>
                <Text style={[styles.meta, { color: tokens.subTextColor }]}>{item.class_name || '-'} | Ruang: {item.ruang || '-'}</Text>
                <Text style={[styles.time, { color: isLightTheme ? '#1E4FA8' : '#60A5FA' }]}>{(item.jam_mulai || '00:00')} - {(item.jam_selesai || '00:00')}</Text>

                {activeSessionId === item.id ? (
                  <View style={{ marginTop: 15 }}>
                    <View style={[styles.timerCard, { backgroundColor: tokens.inputBg }]}>
                      <Clock3 size={18} color={isLightTheme ? '#1E4FA8' : '#FACC15'} />
                      <Text style={{ color: tokens.textColor, marginLeft: 10 }}>Durasi: {sessionDuration}s</Text>
                    </View>

                    <TouchableOpacity style={[styles.scanBtn, { backgroundColor: isLightTheme ? '#1E4FA8' : '#2563EB' }]} onPress={fetchRealtimeScan} disabled={isScanning}>
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
                      <Text style={{ color: tokens.textColor, fontWeight: 'bold', marginBottom: 10 }}>Daftar Mahasiswa:</Text>
                      {students.map((s) => (
                        <View key={s.id} style={[styles.studentCard, { backgroundColor: tokens.inputBg, borderColor: tokens.borderColor }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: tokens.textColor, fontWeight: 'bold' }}>{s.name}</Text>
                            <Text style={{ color: s.status === 'HADIR' ? '#4ADE80' : '#EF4444', fontSize: 12 }}>{s.status}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 5 }}>
                            <TouchableOpacity onPress={() => sendIndividualReport(s)} style={styles.smallBtnWa}>
                              <Text style={styles.smallBtnText}>WA</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => allowManualScan(s.id)} 
                              style={[styles.smallBtnManual, { opacity: s.status === 'HADIR' ? 0.5 : 1, backgroundColor: isLightTheme ? '#1E4FA8' : '#3B82F6' }]} 
                              disabled={s.status === 'HADIR'}>
                              <Text style={styles.smallBtnText}>Manual</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={[styles.startBtn, { backgroundColor: isLightTheme ? '#1E4FA8' : '#3B82F6' }]} onPress={() => startSession(item)}>
                    <Text style={styles.startBtnText}>Mulai Sesi</Text>
                  </TouchableOpacity>
                )}
              </BlurView>
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
  headerTitle: { fontSize: 24, fontWeight: 'bold' }, 
  headerSub: { fontSize: 14 },
  notifBtn: { padding: 8, borderRadius: 10, position: 'relative', borderWidth: 1 },
  notifBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#EF4444', borderRadius: 4, borderWidth: 1, borderColor: '#1E293B' },
  reportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, padding: 8, borderRadius: 10 },
  reportText: { fontSize: 12, fontWeight: 'bold' },
  iotCard: { marginHorizontal: 20, padding: 15, borderRadius: 15, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#3B82F6', borderWidth: 1 },
  scheduleContainer: { paddingHorizontal: 20 }, 
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  scheduleCard: { padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, overflow: 'hidden' },
  subject: { fontSize: 18, fontWeight: 'bold' }, 
  meta: { fontSize: 14 },
  time: { marginTop: 5, fontWeight: 'bold' },
  startBtn: { marginTop: 15, padding: 12, borderRadius: 12, alignItems: 'center' },
  startBtnText: { color: 'white', fontWeight: 'bold' },
  timerCard: { padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scanBtn: { padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  scanBtnText: { color: 'white', fontWeight: 'bold' },
  exportBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  finishBtn: { backgroundColor: '#EF4444', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  studentCard: { padding: 12, borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  smallBtnWa: { backgroundColor: '#25D366', padding: 8, borderRadius: 8 },
  smallBtnManual: { padding: 8, borderRadius: 8 },
  smallBtnText: { color: 'white', fontSize: 11, fontWeight: 'bold' }
});