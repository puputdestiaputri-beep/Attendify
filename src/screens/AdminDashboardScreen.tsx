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
  AlertTriangle, MapPin
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/Config';
import AnimatedBackground from '../components/ui/AnimatedBackground';
import { useTheme } from '../context/ThemeContext';
import io from 'socket.io-client';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Zap, TrendingUp, PieChart as PieChartIcon } from 'lucide-react-native';

const { width } = Dimensions.get('window');


export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { tokens, isLightTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [liveAttendances, setLiveAttendances] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Use centralized API_URL from Config.ts


  // Pulse animation for IoT Status
  useEffect(() => {
    fetchUnreadCount();
    fetchAnalytics();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchAnalytics();
    }, 30000); // Check every 30s
    
    // Socket.io for live attendance
    const socket = io(API_URL);
    socket.on('new_attendance', (data: any) => {
      setLiveAttendances(prev => [data, ...prev].slice(0, 5)); // Keep last 5
      fetchAnalytics(); // Refresh charts on new attendance
    });
    socket.on('update_location', (data: any) => {
      setLiveAttendances(prev => prev.map(item => item.user_id === data.user_id ? { ...item, location_name: data.location_name } : item));
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`);
      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
    }
  };

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

  const AdminCard = ({ title, subtitle, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      style={[styles.cardWrapper, { backgroundColor: isLightTheme ? 'rgba(30, 79, 168, 0.03)' : 'rgba(255,255,255,0.05)', borderColor: tokens.borderColor }]}
    >
      <View style={styles.menuCard}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={24} color={color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: tokens.textColor }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: tokens.subTextColor }]}>{subtitle}</Text>
        </View>
        <ChevronRight size={20} color={tokens.subTextColor} />
      </View>
    </TouchableOpacity>
  );

  const StatItem = ({ label, value, icon: Icon, color }: any) => (
    <BlurView intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.statCard, { borderColor: tokens.borderColor }]}>
      <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: tokens.subTextColor }]}>{label}</Text>
      <Text style={[styles.statValue, { color: tokens.textColor }]}>{value}</Text>
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
            <View style={styles.topRow}>
              <View style={styles.greetingBox}>
                <Text style={[styles.welcomeText, { color: tokens.subTextColor }]}>Hello, Admin Panel</Text>
                <Text style={[styles.nameText, { color: tokens.textColor }]}>Admin Attendify</Text>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity 
                  style={[styles.iconButton, { backgroundColor: tokens.iconButtonBg, borderColor: tokens.borderColor }]}
                  onPress={() => navigation.navigate('Notification')}
                >
                  <Bell size={22} color={isLightTheme ? '#374151' : '#fff'} />
                  {unreadCount > 0 && (
                    <View style={styles.badge} pointerEvents="none">
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* IoT Status Banner */}
          <BlurView intensity={30} tint={isLightTheme ? 'light' : 'dark'} style={[styles.statusBanner, { borderColor: tokens.borderColor }]}>
            <View style={styles.statusHeader}>
              <View style={styles.liveIndicator}>
                <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
                <Text style={styles.liveText}>SYSTEM ONLINE</Text>
              </View>
              <Text style={[styles.uptimeText, { color: tokens.subTextColor }]}>Uptime: 14d 2h 45m</Text>
            </View>
            <View style={styles.deviceRow}>
              <View style={styles.deviceItem}>
                <Cpu size={20} color={Colors.ai.primary} />
                <Text style={[styles.deviceLabel, { color: tokens.textColor }]}>ESP32 Server</Text>
                <Text style={[styles.deviceStatus, { color: tokens.subTextColor }]}>Active</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: tokens.borderColor }]} />
              <View style={styles.deviceItem}>
                <Camera size={20} color={Colors.ai.primary} />
                <Text style={[styles.deviceLabel, { color: tokens.textColor }]}>Face Sensor</Text>
                <Text style={[styles.deviceStatus, { color: tokens.subTextColor }]}>Calibrating</Text>
              </View>
            </View>
          </BlurView>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <StatItem 
              label="Total Siswa" 
              value={analyticsData?.totalStudents?.toString() || "..."} 
              icon={Users} 
              color="#60A5FA" 
            />
            <StatItem 
              label="Hadir Hari Ini" 
              value={analyticsData?.attendedCount?.toString() || "..."} 
              icon={UserCheck} 
              color="#34D399" 
            />
            <StatItem 
              label="Persentase" 
              value={(analyticsData?.attendancePercentage?.toString() || "0") + "%"} 
              icon={BarChart3} 
              color="#FBBF24" 
            />
          </View>

          {/* Analytics Charts */}
          {analyticsData && (
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={20} color={tokens.textColor} />
                <Text style={[styles.sectionTitle, { color: tokens.textColor, marginHorizontal: 10, marginBottom: 0 }]}>Attendance Trend</Text>
              </View>
              <BlurView intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.chartContainer, { borderColor: tokens.borderColor }]}>
                <LineChart
                  data={{
                    labels: analyticsData.trend.labels,
                    datasets: [{ data: analyticsData.trend.data }]
                  }}
                  width={width - 60}
                  height={180}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
                    labelColor: (opacity = 1) => isLightTheme ? `rgba(0, 0, 0, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#60A5FA" }
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </BlurView>

              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <PieChartIcon size={20} color={tokens.textColor} />
                <Text style={[styles.sectionTitle, { color: tokens.textColor, marginHorizontal: 10, marginBottom: 0 }]}>Class Breakdown</Text>
              </View>
              <BlurView intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.chartContainer, { borderColor: tokens.borderColor }]}>
                <PieChart
                  data={analyticsData.classBreakdown}
                  width={width - 60}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]}
                  absolute
                />
              </BlurView>

              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                <Zap size={20} color={tokens.textColor} />
                <Text style={[styles.sectionTitle, { color: tokens.textColor, marginHorizontal: 10, marginBottom: 0 }]}>Smart Insights</Text>
              </View>
              {analyticsData.insights.map((insight: string, idx: number) => (
                <View key={idx} style={[styles.insightCard, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
                  <View style={[styles.insightDot, { backgroundColor: idx === 0 ? '#60A5FA' : idx === 1 ? '#34D399' : '#FBBF24' }]} />
                  <Text style={[styles.insightText, { color: tokens.textColor }]}>{insight}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Live Attendance Stream */}
          {liveAttendances.length > 0 && (
            <View style={{ marginBottom: 24, paddingHorizontal: 20 }}>
              <Text style={[styles.sectionTitle, { color: tokens.textColor, marginHorizontal: 0, marginBottom: 12 }]}>Live Attendance</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {liveAttendances.map((item, idx) => (
                  <View key={idx} style={[styles.liveCard, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
                    <Image source={{ uri: `${API_URL}/uploads/${item.photo}` }} style={styles.livePhoto} />
                    <View style={styles.liveInfo}>
                      <Text style={[styles.liveName, { color: tokens.textColor }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[styles.liveClass, { color: tokens.subTextColor }]}>{item.kelas}</Text>
                      {item.location_name && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                          <MapPin size={10} color="#38BDF8" />
                          <Text style={{ fontSize: 9, color: tokens.subTextColor, flex: 1 }} numberOfLines={1}>{item.location_name}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Management Menu */}
          <Text style={[styles.sectionTitle, { color: tokens.textColor }]}>System Management</Text>
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

      <LogoutModal 
        visible={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={confirmLogout}
        tokens={tokens}
        isLightTheme={isLightTheme}
      />
    </View>
  );
}

// Separate component for clarity if needed, or keep inline
const LogoutModal = ({ visible, onClose, onConfirm, tokens, isLightTheme }: any) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <BlurView intensity={50} tint={isLightTheme ? 'light' : 'dark'} style={[styles.modalContent, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
        <View style={styles.modalIconBox}>
          <LogOut size={32} color="#F87171" />
        </View>
        <Text style={[styles.modalTitle, { color: tokens.textColor }]}>Confirm Logout</Text>
        <Text style={[styles.modalSubtitle, { color: tokens.subTextColor }]}>Are you sure you want to exit the admin panel?</Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.cancelBtn, { backgroundColor: tokens.iconButtonBg }]} 
            onPress={onClose}
          >
            <Text style={[styles.cancelBtnText, { color: tokens.textColor }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.confirmBtn} 
            onPress={onConfirm}
          >
            <Text style={styles.confirmBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greetingBox: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nameText: {
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: '600',
  },
  deviceStatus: {
    fontSize: 11,
  },
  divider: {
    width: 1,
    height: 40,
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalSubtitle: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartContainer: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 10,
    overflow: 'hidden',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  liveCard: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
  },
  livePhoto: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  liveInfo: {
    padding: 10,
  },
  liveName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  liveClass: {
    fontSize: 11,
  },
});
