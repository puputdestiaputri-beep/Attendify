import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, ActivityIndicator,
  RefreshControl, Dimensions, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText, ChevronLeft, Calendar, 
  Search, Download, FileSpreadsheet,
  Users, BookOpen, Filter, CheckCircle2,
  Clock, XCircle, Grid, RefreshCw
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const API_URL = 'http://localhost:5000/api';

interface Kelas {
  id_kelas: number;
  nama_kelas: string;
  prodi: string;
}

interface AttendanceEntry {
  id_absensi: number;
  name: string;
  nim: string;
  subject: string;
  class_name: string;
  tanggal: string;
  time: string | null;
  status: string;
}

export default function ManageAttendanceScreen() {
  const navigation = useNavigation<any>();
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      
      // Fetch Classes
      const classRes = await fetch(`${API_URL}/kelas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classResult = await classRes.json();
      if (classResult.status === 'success') {
        setClasses(classResult.data);
      }

      // Fetch Attendance
      const url = selectedClassId 
        ? `${API_URL}/absensi?class_id=${selectedClassId}`
        : `${API_URL}/absensi`;
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        setAttendance(result.data);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClassId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [selectedClassId]);

  const handleExport = async (type: 'excel' | 'pdf') => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      let url = `${API_URL}/reports/${type}?token=${token}`;
      if (selectedClassId) url += `&class_id=${selectedClassId}`;
      
      Alert.alert(
        'Download Laporan',
        `Menyiapkan file ${type.toUpperCase()} untuk ${selectedClassId ? 'kelas terpilih' : 'semua kelas'}...`,
        [{ text: 'OK' }]
      );
      
      console.log(`Downloading ${type} from ${url}`);
      // In a real browser/emulator, we'd open the URL
    } catch (err) {
      Alert.alert('Error', `Gagal mengekspor ${type}`);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'hadir': return { color: '#34D399', icon: CheckCircle2 };
      case 'terlambat': return { color: '#FBBF24', icon: Clock };
      default: return { color: '#F87171', icon: XCircle };
    }
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceEntry }) => {
    const status = getStatusStyle(item.status);
    return (
      <View style={styles.recordWrapper}>
        <BlurView intensity={20} tint="dark" style={styles.recordCard}>
          <View style={styles.recordMain}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentDetails}>{item.class_name} • {item.subject}</Text>
            </View>
            <View style={styles.statusCol}>
              <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                <status.icon size={12} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.timeText}>{item.time || '-'}</Text>
            </View>
          </View>
        </BlurView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Laporan Per Kelas</Text>
          <TouchableOpacity style={styles.actionButton} onPress={onRefresh}>
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Class Selector Bar */}
        <View style={styles.selectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
            <TouchableOpacity 
              style={[styles.classChip, selectedClassId === null && styles.classChipActive]}
              onPress={() => setSelectedClassId(null)}
            >
              <Grid size={16} color={selectedClassId === null ? '#fff' : 'rgba(255,255,255,0.5)'} />
              <Text style={[styles.classChipText, selectedClassId === null && styles.classChipTextActive]}>Semua</Text>
            </TouchableOpacity>
            {classes.map((c) => (
              <TouchableOpacity 
                key={c.id_kelas}
                style={[styles.classChip, selectedClassId === c.id_kelas && styles.classChipActive]}
                onPress={() => setSelectedClassId(c.id_kelas)}
              >
                <BookOpen size={16} color={selectedClassId === c.id_kelas ? '#fff' : 'rgba(255,255,255,0.5)'} />
                <Text style={[styles.classChipText, selectedClassId === c.id_kelas && styles.classChipTextActive]}>{c.nama_kelas}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Export Bar */}
        <View style={styles.exportBar}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('excel')}>
            <FileSpreadsheet size={18} color="#34D399" />
            <Text style={styles.exportBtnText}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, { borderColor: 'rgba(248,113,113,0.3)' }]} onPress={() => handleExport('pdf')}>
            <FileText size={18} color="#F87171" />
            <Text style={styles.exportBtnText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.ai.primary} />
          </View>
        ) : (
          <FlatList
            data={attendance}
            renderItem={renderAttendanceItem}
            keyExtractor={(item) => item.id_absensi.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Users size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>Tidak ada data absensi untuk filter ini.</Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.ai.primary} />
            }
          />
        )}
      </LinearGradient>
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
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  selectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  classScroll: {
    flexDirection: 'row',
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  classChipActive: {
    backgroundColor: Colors.ai.primary,
    borderColor: Colors.ai.primary,
  },
  classChipText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 14,
  },
  classChipTextActive: {
    color: '#fff',
  },
  exportBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  exportBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  recordWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  recordCard: {
    padding: 16,
  },
  recordMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  studentDetails: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  statusCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    marginTop: 16,
    fontSize: 14,
  },
});
