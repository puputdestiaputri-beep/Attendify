import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, ActivityIndicator,
  RefreshControl, Dimensions, Alert, ScrollView, Modal, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  FileText, ChevronLeft, Calendar, 
  Search, Download, FileSpreadsheet,
  Users, BookOpen, Filter, CheckCircle2,
  Clock, XCircle, Grid, RefreshCw, Edit2, Send
} from 'lucide-react-native';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Platform } from 'react-native';

let RNHTMLtoPDF: any = null;
if (Platform.OS !== 'web') {
  RNHTMLtoPDF = require('react-native-html-to-pdf');
}

import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface Kelas {
  id_kelas: number;
  nama_kelas: string;
  prodi: string;
}

interface AttendanceEntry {
  id_absensi: number;
  user_id: number;
  jadwal_id: number;
  name: string;
  nim: string;
  nama_mk: string;
  nama_kelas: string;
  tanggal: string;
  waktu_datang: string | null;
  status: string;
}

export default function ManageAttendanceScreen() {
  const navigation = useNavigation<any>();
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceEntry | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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

  const handleExportExcel = async () => {
    if (attendance.length === 0) {
      Alert.alert('Kosong', 'Tidak ada data absensi untuk diekspor.');
      return;
    }
    try {
      setIsExporting(true);
      
      const dataToExport = attendance.map(item => ({
        'Nama Mahasiswa': item.name,
        'NIM': item.nim,
        'Mata Kuliah': item.nama_mk,
        'Kelas': item.nama_kelas,
        'Tanggal': item.tanggal,
        'Waktu Datang': item.waktu_datang || '-',
        'Status': item.status.toUpperCase()
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Absensi");
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: "xlsx" });
      // @ts-ignore
      const fileUri = FileSystem.documentDirectory + "absensi.xlsx";
      
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        // @ts-ignore
        encoding: FileSystem.EncodingType.Base64
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Bagikan Excel Absensi'
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengekspor file Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Info', 'Fitur export PDF tidak tersedia di versi web. Harap gunakan aplikasi Android/iOS.');
      return;
    }
    if (attendance.length === 0) {
      Alert.alert('Kosong', 'Tidak ada data absensi untuk diekspor.');
      return;
    }
    try {
      setIsExporting(true);
      
      let htmlRows = attendance.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.nim}</td>
          <td>${item.nama_mk}</td>
          <td>${item.nama_kelas}</td>
          <td>${item.tanggal}</td>
          <td>${item.waktu_datang || '-'}</td>
          <td>${item.status.toUpperCase()}</td>
        </tr>
      `).join('');

      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              h1 { text-align: center; color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; color: #333; }
            </style>
          </head>
          <body>
            <h1>Laporan Absensi</h1>
            <table>
              <tr>
                <th>Nama</th>
                <th>NIM</th>
                <th>Mata Kuliah</th>
                <th>Kelas</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Status</th>
              </tr>
              ${htmlRows}
            </table>
          </body>
        </html>
      `;

      let options = {
        html: htmlContent,
        fileName: 'absensi',
        directory: 'Documents',
      };

      let file = await RNHTMLtoPDF.convert(options);
      
      if (file.filePath) {
        await Sharing.shareAsync(file.filePath, {
          mimeType: 'application/pdf',
          dialogTitle: 'Bagikan PDF Absensi'
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengekspor file PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendWhatsApp = async (roleTarget: 'dosen' | 'kaprodi' | 'dekan') => {
    let phoneNumber = '';
    if (roleTarget === 'dosen') phoneNumber = '6282124247810';
    else if (roleTarget === 'kaprodi') phoneNumber = '6285775607738';
    else if (roleTarget === 'dekan') phoneNumber = '6285810598235';

    const message = `Assalamu’alaikum,
Berikut kami kirimkan laporan absensi mahasiswa hari ini.

Mohon untuk ditinjau.

Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp tidak terpasang atau URL tidak didukung.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal membuka WhatsApp.');
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'hadir': return { color: '#34D399', icon: CheckCircle2 };
      case 'terlambat': return { color: '#FBBF24', icon: Clock };
      case 'izin': return { color: '#60A5FA', icon: CheckCircle2 };
      case 'sakit': return { color: '#A78BFA', icon: CheckCircle2 };
      default: return { color: '#F87171', icon: XCircle };
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedRecord) return;
    setIsUpdating(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/absensi/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: selectedRecord.user_id,
          jadwal_id: selectedRecord.jadwal_id,
          status: newStatus
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setIsEditModalVisible(false);
        fetchData();
      } else {
        Alert.alert('Error', result.message || 'Gagal update status');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Terjadi kesalahan jaringan');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderAttendanceItem = ({ item }: { item: AttendanceEntry }) => {
    const status = getStatusStyle(item.status);
    return (
      <TouchableOpacity 
        style={styles.recordWrapper}
        onPress={() => {
          setSelectedRecord(item);
          setIsEditModalVisible(true);
        }}
      >
        <BlurView intensity={20} tint="dark" style={styles.recordCard}>
          <View style={styles.recordMain}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentDetails}>{item.nama_kelas} • {item.nama_mk}</Text>
            </View>
            <View style={styles.statusCol}>
              <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
                <status.icon size={12} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.timeText}>{item.waktu_datang || '-'}</Text>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
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
        <View style={styles.exportSection}>
          <Text style={styles.exportSectionTitle}>Export & Share Reports</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExportExcel} disabled={isExporting}>
              {isExporting ? <ActivityIndicator size="small" color="#34D399" /> : <FileSpreadsheet size={18} color="#34D399" />}
              <Text style={styles.exportBtnText}>Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportBtn, { borderColor: 'rgba(248,113,113,0.3)' }]} onPress={handleExportPDF} disabled={isExporting}>
              {isExporting ? <ActivityIndicator size="small" color="#F87171" /> : <FileText size={18} color="#F87171" />}
              <Text style={styles.exportBtnText}>PDF</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.exportSectionSubtitle}>Bagikan Laporan via WhatsApp</Text>
          <View style={styles.waButtonsContainer}>
            <TouchableOpacity style={styles.waBtn} onPress={() => handleSendWhatsApp('dosen')}>
              <Send size={14} color="#25D366" />
              <Text style={styles.waBtnText}>Kirim ke Dosen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waBtn} onPress={() => handleSendWhatsApp('kaprodi')}>
              <Send size={14} color="#25D366" />
              <Text style={styles.waBtnText}>Kirim ke Kaprodi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.waBtn} onPress={() => handleSendWhatsApp('dekan')}>
              <Send size={14} color="#25D366" />
              <Text style={styles.waBtnText}>Kirim ke Dekan</Text>
            </TouchableOpacity>
          </View>
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

        {/* Edit Status Modal */}
        <Modal visible={isEditModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <BlurView intensity={40} tint="dark" style={styles.modalContent}>
              <Text style={styles.modalTitle}>Ubah Status Absensi</Text>
              <Text style={styles.modalSubtitle}>
                {selectedRecord?.name} - {selectedRecord?.nama_mk}
              </Text>
              
              <View style={styles.statusOptions}>
                {['hadir', 'terlambat', 'izin', 'sakit', 'alfa'].map(st => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusOptionBtn,
                      selectedRecord?.status === st && { borderColor: getStatusStyle(st).color, backgroundColor: `${getStatusStyle(st).color}20` }
                    ]}
                    onPress={() => handleUpdateStatus(st)}
                    disabled={isUpdating}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      selectedRecord?.status === st && { color: getStatusStyle(st).color, fontWeight: 'bold' }
                    ]}>
                      {st.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.cancelModalBtn}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelModalBtnText}>Batal</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </Modal>

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
  exportSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  exportSectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  exportSectionSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  exportBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  waButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(37,211,102,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.3)',
  },
  waBtnText: {
    color: '#25D366',
    fontWeight: '600',
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  statusOptions: {
    gap: 12,
    marginBottom: 24,
  },
  statusOptionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  statusOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelModalBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  cancelModalBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
