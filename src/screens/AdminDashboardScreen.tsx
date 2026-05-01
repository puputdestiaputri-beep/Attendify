import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Alert, Dimensions, StatusBar, Modal, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  Users, UserCheck, ShieldCheck, Activity,
  Cpu, LayoutDashboard, Settings, LogOut,
  ChevronRight, Bell, Search, RefreshCw,
  UserPlus, BookOpen, Database, BarChart3,
  MonitorSmartphone, Camera, FileText, Calendar,
  AlertTriangle
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';
import AnimatedBackground from '../components/ui/AnimatedBackground';

const { width } = Dimensions.get('window');


export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Use centralized API_URL from Config.ts


  // Pulse animation for IoT Status
  useEffect(() => {
    fetchUnreadCount();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/notifikasi`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        const count = result.data.filter((n: any) => !n.read).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  };


  const [showLogoutModal, setShowLogoutModal] = useState(false);

const handleLogout = () => {
  setShowLogoutModal(true);
};

const confirmLogout = () => {
  setShowLogoutModal(false);
  logout();
};

  const AdminCard = ({ title, icon: Icon, color, onPress, subtitle }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cardWrapper}
    >
      <BlurView intensity={20} tint="dark" style={styles.menuCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
      </BlurView>
    </TouchableOpacity>
  );

  const StatItem = ({ label, value, icon: Icon, color }: any) => (
    <BlurView intensity={20} tint="dark" style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </BlurView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
    <AnimatedBackground style={styles.background}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Hello, Admin Panel</Text>
              <Text style={styles.nameText}>{user?.fullName || 'System Master'}</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Notification')}
              >
                <Bell size={22} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.badge} pointerEvents="none">
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}

              </TouchableOpacity>
            </View>


          </View>

          {/* IoT Status Banner */}
          <BlurView intensity={30} tint="dark" style={styles.statusBanner}>
            <View style={styles.statusHeader}>
              <View style={styles.liveIndicator}>
                <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                <Text style={styles.liveText}>SYSTEM ONLINE</Text>
              </View>
              <Text style={styles.uptimeText}>Uptime: 14d 2h 45m</Text>
            </View>
            <View style={styles.deviceRow}>
              <View style={styles.deviceItem}>
                <Cpu size={20} color={Colors.ai.primary} />
                <Text style={styles.deviceLabel}>ESP32 Server</Text>
                <Text style={styles.deviceStatus}>Active</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.deviceItem}>
                <Camera size={20} color={Colors.ai.primary} />
                <Text style={styles.deviceLabel}>Face Sensor</Text>
                <Text style={styles.deviceStatus}>Calibrating</Text>
              </View>
            </View>
          </BlurView>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <StatItem 
              label="Total Siswa" 
              value="1,240" 
              icon={Users} 
              color="#60A5FA" 
            />
            <StatItem 
              label="Total Dosen" 
              value="86" 
              icon={UserCheck} 
              color="#34D399" 
            />
            <StatItem 
              label="Kehadiran" 
              value="94%" 
              icon={BarChart3} 
              color="#FBBF24" 
            />
          </View>

          {/* Management Menu */}
          <Text style={styles.sectionTitle}>System Management</Text>
          <View style={styles.menuContainer}>
            <AdminCard 
              title="Data Siswa" 
              subtitle="Manage student profiles & classes"
              icon={Users} 
              color="#60A5FA"
              onPress={() => navigation.navigate('ManageStudents')}
            />
            <AdminCard 
              title="Data Dosen" 
              subtitle="Manage lecture assignments"
              icon={ShieldCheck} 
              color="#A78BFA"
              onPress={() => navigation.navigate('ManageLecturers')}
            />
            <AdminCard 
              title="IoT Face Sensor" 
              subtitle="Validation & camera monitoring"
              icon={Cpu} 
              color="#34D399"
              onPress={() => navigation.navigate('IoTSensor')}
            />
            <AdminCard 
              title="Database Logs" 
              subtitle="System activity & audit trails"
              icon={Database} 
              color="#F472B6"
              onPress={() => navigation.navigate('DatabaseLogs')}
            />
            <AdminCard 
              title="Laporan Masalah" 
              subtitle="Kelola laporan dari dosen & mahasiswa"
              icon={AlertTriangle} 
              color="#F59E0B"
              onPress={() => navigation.navigate('AdminReports')}
            />
          </View>

        </ScrollView>
      </AnimatedBackground>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={50} tint="dark" style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <LogOut size={32} color="#F87171" />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to exit the admin panel?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={confirmLogout}
              >
                <Text style={styles.confirmBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  nameText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    position: 'relative',
    zIndex: 10,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(248,113,113,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.25)',
  },
  statusBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34D399',
  },
  liveText: {
    color: '#34D399',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  uptimeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  deviceItem: {
    alignItems: 'center',
    gap: 4,
  },
  deviceLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceStatus: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(248,113,113,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
