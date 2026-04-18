import React, { useState } from 'react';

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Camera, Calendar, Clock, MapPin, Bell, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AttendanceChart } from '../components/AttendanceChart';
import ReportIssueModal from '../components/ReportIssueModal';


const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [showReportModal, setShowReportModal] = useState(false);


  const userName = user?.fullName || 'Mahasiswa';
  const userProdi = user?.prodi || '-';

  // Mock data - replace with real data from backend
  const attendanceData = [
    { subject: 'Pemrograman Web', attendance: 85, total: 12, attended: 10 },
    { subject: 'Kecerdasan Buatan', attendance: 92, total: 12, attended: 11 },
    { subject: 'Mobile Programming', attendance: 78, total: 12, attended: 9 },
  ];

  const handleScan = () => {
    navigation.navigate('Scan');
  };

  const handleJadwal = () => {
    navigation.navigate('Jadwal');
  };

  const handleNotification = () => {
    navigation.navigate('Notification');
  };

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd] :
        ['#f0f4f8', '#e0e7ff', '#f0f4f8']
      }
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={[styles.greeting, { color: isDarkMode ? '#fff' : '#1f2937' }]}>
              Halo, {userName} 👋
            </Text>
            <Text style={[styles.subGreeting, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.8)' }]}>
              Mahasiswa {userProdi}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.notifBtn, { marginRight: 10 }]} 
              onPress={() => setShowReportModal(true)}
            >
              <AlertTriangle color="#FBBF24" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifBtn} onPress={handleNotification}>
              <Bell color="#fff" size={24} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

        </View>

        {/* Status */}
        <BlurView intensity={20} tint="dark" style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Status Hari Ini</Text>
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusBadgeText}>Belum Absen</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statusDetails}>
            <View style={styles.detailItem}>
              <CheckCircle2 color="#4ADE80" size={16} />
              <Text style={styles.detailText}>Tepat Waktu</Text>
            </View>
            <Text style={styles.detailValue}>0%</Text>
          </View>
        </BlurView>

        {/* Banner */}
        <View style={styles.scheduleBanner}>
          <LinearGradient
            colors={['rgba(59,130,246,0.5)', 'rgba(147,51,234,0.5)']}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerHeader}>
              <Text style={styles.bannerTitle}>Mata Kuliah Sekarang</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>ONGOING</Text>
              </View>
            </View>

            <Text style={styles.courseName}>Kecerdasan Buatan</Text>

            <View style={styles.courseDetails}>
              <View style={styles.courseDetailItem}>
                <Clock color="rgba(255,255,255,0.7)" size={14} />
                <Text style={styles.courseDetailText}>13:00 - 15:30</Text>
              </View>

              <View style={styles.courseDetailItem}>
                <MapPin color="rgba(255,255,255,0.7)" size={14} />
                <Text style={styles.courseDetailText}>Ruang 402</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Attendance Chart */}
        <BlurView intensity={20} tint="dark" style={styles.chartCard}>
          <AttendanceChart
            data={attendanceData}
            title="Grafik Absensi Semua Mata Kuliah"
            showLegend={true}
          />
        </BlurView>

        {/* Menu */}
        <Text style={styles.sectionTitle}>Menu Utama</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleScan}>
            <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.actionGradient}>
              <View style={styles.iconCircle}>
                <Camera color="#fff" size={28} />
              </View>
              <Text style={styles.actionBtnText}>Scan Wajah</Text>
              <Text style={styles.actionBtnSub}>Absensi Cepat</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleJadwal}>
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
              <View style={styles.iconCircle}>
                <Calendar color="#fff" size={28} />
              </View>
              <Text style={styles.actionBtnText}>Lihat Jadwal</Text>
              <Text style={styles.actionBtnSub}>Agenda Kuliah</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Tips Hari Ini</Text>
          <Text style={styles.tipContent}>
            Jangan lupa scan wajah minimal 15 menit sebelum kuliah dimulai.
          </Text>
        </View>

      </ScrollView>


      <ReportIssueModal 
        visible={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </LinearGradient>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },


  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },

  subGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  notifBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },

  statusCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },

  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  statusLabel: { color: '#fff' },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadgeText: { color: '#FDE047' },

  pulseDot: {
    width: 6,
    height: 6,
    backgroundColor: '#FDE047',
    marginRight: 6,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 10,
  },

  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  detailText: { color: '#ccc' },
  detailValue: { color: '#fff' },

  scheduleBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },

  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  bannerGradient: { padding: 20 },

  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bannerTitle: { color: '#fff' },

  liveBadge: {
    backgroundColor: '#EF4444',
    padding: 4,
    borderRadius: 6,
  },

  liveText: { color: '#fff', fontSize: 10 },

  courseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  courseDetails: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  courseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  courseDetailText: { color: '#ddd' },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  actionBtn: {
    width: (width - 56) / 2,
    borderRadius: 20,
    overflow: 'hidden',
  },

  actionGradient: {
    padding: 20,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionBtnText: { color: '#fff', marginTop: 10 },
  actionBtnSub: { color: '#ccc', fontSize: 12 },

  tipCard: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },

  tipTitle: { color: '#fff', fontWeight: 'bold' },
  tipContent: { color: '#ccc', marginTop: 5 },
});