import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions, StatusBar,
  Image, FlatList, Modal, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  ArrowLeft, Cpu, Camera, ShieldCheck, 
  Activity, RefreshCw, CheckCircle2, XCircle,
  AlertTriangle, Info, Clock, User, ChevronDown
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// Mock API BASE
const API_URL = 'http://localhost:5000/api';

export default function IoTSensorValidationScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [validationState, setValidationState] = useState<'idle' | 'starting' | 'waiting' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pollInterval = useRef<any>(null);

  useEffect(() => {
    fetchLogs();
    fetchAvailableUsers();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    if (isLive) loop.start();
    return () => loop.stop();
  }, [isLive]);

  const fetchLogs = async () => {
    // Integration point for logs
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/wajah/available-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const res = await response.json();
      if (res.status === 'success') {
        setAvailableUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startValidation = async () => {
    if (!selectedUser) {
      Alert.alert('Peringatan', 'Pilih mahasiswa terlebih dahulu');
      return;
    }

    setValidationState('starting');
    try {
      const response = await fetch(`${API_URL}/wajah/start-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: selectedUser.id, device_id: 'ESP32-Cam-01' })
      });
      
      const res = await response.json();
      if (res.status === 'success') {
        setValidationState('waiting');
        startPolling();
      } else {
        setValidationState('error');
        Alert.alert('Gagal', res.message);
      }
    } catch (err) {
      setValidationState('error');
      console.error(err);
    }
  };

  const startPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/wajah/status/${selectedUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const res = await response.json();
        if (res.status === 'completed') {
          setValidationState('completed');
          setProgress(4);
          clearInterval(pollInterval.current);
        } else if (res.status === 'processing') {
          setProgress(res.progress);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  const closeModal = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    setIsModalVisible(false);
    setValidationState('idle');
    setProgress(0);
    setSelectedUser(null);
  };

  const LogItem = ({ item }: any) => (
    <BlurView intensity={15} tint="dark" style={styles.logCard}>
      {/* ... previous log item UI ... */}
    </BlurView>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Validasi Sensor IoT</Text>
          <TouchableOpacity 
            onPress={() => setIsLive(!isLive)} 
            style={[styles.liveBtn, { borderColor: isLive ? '#10B981' : 'rgba(255,255,255,0.2)' }]}
          >
            <Animated.View style={[styles.liveDot, { opacity: pulseAnim, backgroundColor: isLive ? '#10B981' : '#6B7280' }]} />
            <Text style={[styles.liveText, { color: isLive ? '#10B981' : '#6B7280' }]}>LIVE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.deviceGrid}>
            <BlurView intensity={20} tint="dark" style={styles.deviceCard}>
              <Cpu size={24} color={Colors.ai.primary} />
              <View style={styles.deviceDetails}>
                <Text style={styles.deviceTitle}>ESP32-Cam-01</Text>
                <View style={styles.statusRow}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={styles.statusOnline}>Online</Text>
                </View>
              </View>
            </BlurView>
          </View>

          <BlurView intensity={30} tint="dark" style={styles.warningBanner}>
            <LinearGradient
              colors={['rgba(59,130,246,0.1)', 'rgba(59,130,246,0.05)']}
              style={styles.warningGradient}
            >
              <Info size={24} color={Colors.ai.primary} />
              <View style={styles.warningText}>
                <Text style={styles.warningTitle}>Validasi Wajah Via ESP32</Text>
                <Text style={styles.warningDesc}>Gunakan ESP32-CAM untuk mengambil data wajah mahasiswa baru untuk autentikasi sistem.</Text>
              </View>
            </LinearGradient>
            <TouchableOpacity style={styles.validateLink} onPress={() => setIsModalVisible(true)}>
              <Text style={styles.validateLinkText}>Mulai Validasi Sensor</Text>
              <ShieldCheck size={16} color={Colors.ai.primary} />
            </TouchableOpacity>
          </BlurView>

          <Text style={styles.sectionTitle}>Log Deteksi Sistem</Text>
          <View style={styles.emptyLogs}>
            <Activity size={48} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyText}>Menunggu data dari IoT device...</Text>
          </View>

        </ScrollView>
      </LinearGradient>

      {/* IoT Validation Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} tint="dark" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ESP32-CAM Validation</Text>
              <TouchableOpacity onPress={closeModal}>
                <XCircle color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            {validationState === 'idle' ? (
              <View style={styles.modalBody}>
                <Text style={styles.label}>Pilih Mahasiswa:</Text>
                <ScrollView style={styles.userList}>
                  {availableUsers.map(user => (
                    <TouchableOpacity 
                      key={user.id} 
                      style={[styles.userItem, selectedUser?.id === user.id && styles.userItemSelected]}
                      onPress={() => setSelectedUser(user)}
                    >
                      <User size={18} color={selectedUser?.id === user.id ? "#fff" : "rgba(255,255,255,0.4)"} />
                      <Text style={[styles.userName, selectedUser?.id === user.id && {color: '#fff'}]}>{user.name}</Text>
                      {selectedUser?.id === user.id && <CheckCircle2 size={18} color="#fff" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.startBtn} onPress={startValidation}>
                  <LinearGradient colors={[Colors.ai.primary, Colors.ai.accentGlow]} style={styles.btnG}>
                    <Cpu size={20} color="#fff" />
                    <Text style={styles.btnText}>Aktifkan ESP32-CAM</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.statusBody}>
                <View style={styles.progressCircle}>
                   {validationState === 'completed' ? (
                     <CheckCircle2 size={80} color="#10B981" />
                   ) : (
                     <ActivityIndicator size="large" color={Colors.ai.primary} />
                   )}
                </View>
                <Text style={styles.statusTitle}>
                  {validationState === 'waiting' && `MENGAMBIL FOTO (${progress}/4)`}
                  {validationState === 'completed' && 'VALIDASI BERHASIL'}
                  {validationState === 'starting' && 'MEMULAI SESI...'}
                </Text>
                <Text style={styles.statusSub}>
                  {validationState === 'waiting' && 'Harap posisi wajah mahasiswa tepat di depan lensa ESP32-CAM.'}
                  {validationState === 'completed' && `Data wajah ${selectedUser?.name} telah masuk ke database.`}
                </Text>
                
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(progress/4)*100}%` }]} />
                </View>

                {validationState === 'completed' && (
                  <TouchableOpacity style={styles.doneBtn} onPress={closeModal}>
                    <Text style={styles.doneBtnText}>Selesai</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  liveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  deviceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  deviceCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    gap: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusOnline: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
  },
  statusWarning: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '500',
  },
  warningBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    marginBottom: 32,
  },
  warningGradient: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningDesc: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
  },
  validateLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(59,130,246,0.1)',
  },
  validateLinkText: {
    color: Colors.ai.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyLogs: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    marginTop: 12,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 12,
  },
  userList: {
    flex: 1,
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
    gap: 12,
  },
  userItemSelected: {
    backgroundColor: Colors.ai.primary,
  },
  userName: {
    flex: 1,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  startBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  btnG: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statusSub: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.ai.primary,
  },
  doneBtn: {
    marginTop: 40,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    backgroundColor: '#10B981',
  },
  doneBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: 12,
  },
});
