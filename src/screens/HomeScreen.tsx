import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Camera, Calendar, Clock, MapPin, Bell, User, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [userName] = useState('Aldi');

  const handleScan = () => {
    navigation.navigate('Scan');
  };

  const handleJadwal = () => {
    navigation.navigate('Jadwal');
  };

  const handleNotification = () => {
    Alert.alert('Notifikasi', 'Anda tidak memiliki notifikasi baru.');
  };

  return (
    <LinearGradient
      colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greeting}>Halo, {userName} 👋</Text>
            <Text style={styles.subtitle}>Mahasiswa Fasilkom</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={handleNotification}>
            <Bell color="#fff" size={24} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Quick Attendance Status */}
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

        {/* Current Schedule Banner */}
        <View style={styles.scheduleBanner}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.5)', 'rgba(147, 51, 234, 0.5)']}
            style={styles.bannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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

        {/* Action Buttons */}
        <Text style={styles.sectionTitle}>Menu Utama</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={handleScan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366F1', '#4F46E5']}
              style={styles.actionGradient}
            >
              <View style={styles.iconCircle}>
                <Camera color="#fff" size={28} />
              </View>
              <Text style={styles.actionBtnText}>Scan Wajah</Text>
              <Text style={styles.actionBtnSub}>Absensi Cepat</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={handleJadwal}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.actionGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Calendar color="#fff" size={28} />
              </View>
              <Text style={styles.actionBtnText}>Lihat Jadwal</Text>
              <Text style={styles.actionBtnSub}>Agenda Kuliah</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tip of the day */}
        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Tips Hari Ini</Text>
          <Text style={styles.tipContent}>Jangan lupa untuk melakukan scan wajah minimal 15 menit sebelum perkuliahan dimulai agar tidak dianggap terlambat.</Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  notifBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  statusCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 240, 138, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(254, 240, 138, 0.4)',
  },
  statusBadgeText: {
    color: '#FDE047',
    fontWeight: 'bold',
    fontSize: 13,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FDE047',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scheduleBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 10,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  bannerGradient: {
    padding: 24,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  liveBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  courseDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  courseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    width: (width - 56) / 2,
    borderRadius: 24,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    height: 160,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionBtnSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: -8,
  },
  tipCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tipTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  tipContent: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    lineHeight: 20,
  }
});
