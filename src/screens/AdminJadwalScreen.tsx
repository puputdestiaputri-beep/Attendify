import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList, Modal, Alert, ActivityIndicator, Dimensions, StatusBar, TouchableOpacity, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  Calendar, Clock, MapPin, User, BookOpen, ChevronRight, ArrowLeft, RefreshCw, BarChart3,
  Users, CheckCircle2, Layers, FileText, Mail, MessageCircle, Download, CalendarDays, AlertCircle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

export default function AdminJadwalScreen() {
  const navigation = useNavigation<any>();
  const [activeDay, setActiveDay] = useState('senin');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'class'>('day');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [classAbsensi, setClassAbsensi] = useState<any[]>([]);
  const [classJadwal, setClassJadwal] = useState<any[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classLoading, setClassLoading] = useState(false);
  
  // Modal 2 States
  const [selectedJadwal, setSelectedJadwal] = useState<any>(null);
  const [jadwalAbsensi, setJadwalAbsensi] = useState<any[]>([]);
  const [showJadwalDetailModal, setShowJadwalDetailModal] = useState(false);
  const [jadwalDetailLoading, setJadwalDetailLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/kelas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setClasses(result.data);
      }
    } catch (err) {
      console.error('Fetch kelas error:', err);
    }
  };

  const fetchClassDetails = async (classId: string) => {
    setClassLoading(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const absensiRes = await fetch(`${API_URL}/absensi?class_id=${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const absensiResult = await absensiRes.json();
      const filteredJadwal = schedules.filter(s => s.kelas_id === parseInt(classId));
      if (absensiResult.status === 'success') {
        setClassAbsensi(absensiResult.data);
        setClassJadwal(filteredJadwal);
        setSelectedClass(classes.find((c: any) => c.id_kelas === parseInt(classId)));
      }
    } catch (err) {
      console.error('Fetch class details error:', err);
    } finally {
      setClassLoading(false);
    }
  };

  const fetchJadwalAbsensi = async (jadwalId: string) => {
    setJadwalDetailLoading(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/absensi?jadwal_id=${jadwalId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setJadwalAbsensi(result.data);
      }
    } catch (err) {
      console.error('Fetch jadwal absensi error:', err);
    } finally {
      setJadwalDetailLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/jadwal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setSchedules(result.data);
      }
      fetchClasses();
    } catch (err) {
      console.error('Fetch jadwal error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredSchedules = schedules.filter(s => s.hari.toLowerCase() === activeDay);

  const ScheduleCard = ({ item }: { item: any }) => {
    const attendanceRate = item.total_students > 0 
      ? Math.round((item.attended_count / item.total_students) * 100) 
      : 0;

    return (
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <BookOpen size={20} color={Colors.ai.primary} />
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.classText}>{item.class_name}</Text>
          </View>
          <View style={styles.timeBadge}>
            <Clock size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timeText}>{item.jam_mulai.substring(0, 5)}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <User size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.detailText} numberOfLines={1}>{item.dosen_name}</Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.detailText}>{item.ruang}</Text>
          </View>
        </View>

        <View style={styles.recapContainer}>
          <View style={styles.recapHeader}>
            <View style={styles.recapTitleRow}>
              <BarChart3 size={14} color={Colors.ai.secondary} />
              <Text style={styles.recapTitle}>Rekap Absensi Hari Ini</Text>
            </View>
            <Text style={styles.attendancePercent}>{attendanceRate}%</Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${attendanceRate}%` }]} />
          </View>

          <View style={styles.recapFooter}>
            <View style={styles.statBox}>
              <Users size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.statLabel}>Total: {item.total_students}</Text>
            </View>
            <View style={styles.statBox}>
              <CheckCircle2 size={12} color="#34D399" />
              <Text style={[styles.statLabel, { color: '#34D399' }]}>Hadir: {item.attended_count}</Text>
            </View>
          </View>
        </View>
      </BlurView>
    );
  };

  const ClassCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.classCard}
      onPress={() => {
        fetchClassDetails(item.id_kelas.toString());
        setShowClassModal(true);
      }}
    >
      <View style={styles.classIconBox}>
        <Users size={24} color={Colors.ai.primary} />
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.classNameText}>{item.nama_kelas}</Text>
        <Text style={styles.classDescText}>{item.prodi} - {item.keterangan}</Text>
      </View>
      <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  );

  const downloadReport = async (type: 'excel' | 'pdf') => {
    const jadwalId = selectedJadwal?.id;
    if (!jadwalId) return;
    
    setIsDownloading(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      
      // Build URL dengan parameter
      const params = new URLSearchParams();
      params.append('jadwal_id', jadwalId.toString());
      
      const url = `${API_URL}/reports/${type}?${params.toString()}`;
      
      // Untuk mobile, coba fetch dulu untuk validate
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        Alert.alert('Error', `Gagal mengunduh laporan ${type.toUpperCase()}`);
        setIsDownloading(false);
        return;
      }
      
      // Jika successful, open URL dengan Linking (akan trigger download)
      const downloadUrl = `${API_URL}/reports/${type}?jadwal_id=${jadwalId}`;
      
      // Gunakan fetch untuk download dengan custom headers
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = () => {
        const dataUrl = reader.result as string;
        
        Alert.alert(
          'Laporan Siap',
          `Laporan ${type.toUpperCase()} untuk ${selectedJadwal.subject} siap diunduh`,
          [
            {
              text: 'Buka Di Browser',
              onPress: () => {
                Linking.openURL(downloadUrl).catch(err => {
                  Alert.alert('Error', 'Tidak bisa membuka URL');
                });
              }
            },
            {
              text: 'Batal',
              style: 'cancel'
            }
          ]
        );
      };
      
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Error', `Gagal mengunduh laporan: ${err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const sendEmailReport = () => {
    Alert.alert('Kirim Email', 'Mengirim report ke dekan, kaprodi, dan dosen...', [
      { text: 'Kirim', onPress: () => console.log('Email sent') },
      { text: 'Batal' }
    ]);
  };

  const scheduleWAReport = () => {
    Alert.alert('Jadwal WA', 'Mengaktifkan pengiriman report WA mingguan', [
      { text: 'Aktifkan', onPress: () => console.log('WA scheduled') },
      { text: 'Batal' }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Jadwal Perkuliahan</Text>
            <Text style={styles.headerSubtitle}>Monitor class activities and attendance</Text>
          </View>
          <TouchableOpacity 
            onPress={fetchSchedules} 
            disabled={isLoading}
            style={styles.refreshButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* TAB SWITCHER */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, viewMode === 'day' && styles.tabButtonActive]}
            onPress={() => setViewMode('day')}
          >
            <Layers size={16} color={viewMode === 'day' ? '#fff' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.tabText, viewMode === 'day' && styles.tabTextActive]}>Per Hari</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, viewMode === 'class' && styles.tabButtonActive]}
            onPress={() => setViewMode('class')}
          >
            <Users size={16} color={viewMode === 'class' ? '#fff' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.tabText, viewMode === 'class' && styles.tabTextActive]}>Per Kelas</Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'day' ? (
          <View style={styles.daySelectorContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setActiveDay(day)}
                  style={[
                    styles.dayTab,
                    activeDay === day && styles.dayTabActive
                  ]}
                >
                  <Text style={[
                    styles.dayTabText,
                    activeDay === day && styles.dayTabTextActive
                  ]}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </Text>
                  {activeDay === day && <View style={styles.activeDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {isLoading && schedules.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.ai.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : viewMode === 'day' ? (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((item) => (
                <ScheduleCard key={item.id} item={item} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Calendar size={64} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>Tidak ada jadwal untuk hari {activeDay}</Text>
              </View>
            )}
          </ScrollView>
        ) : classes.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.ai.primary} />
            <Text style={styles.loadingText}>Loading kelas...</Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id_kelas.toString()}
            renderItem={({ item }) => <ClassCard item={item} />}
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* CLASS DETAIL MODAL - Step 5 */}
        <Modal visible={showClassModal} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedClass?.nama_kelas || 'Loading...'}</Text>
              <TouchableOpacity onPress={() => setShowClassModal(false)} style={styles.closeButton}>
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {classLoading ? (
              <ActivityIndicator size="large" color={Colors.ai.primary} style={styles.loadingSpinner} />
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Jadwal Mata Kuliah</Text>
                  <FlatList
                    data={classJadwal}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={styles.jadwalItem}
                        onPress={() => {
                          setSelectedJadwal(item);
                          fetchJadwalAbsensi(item.id.toString());
                          setShowJadwalDetailModal(true);
                        }}
                      >
                        <View style={styles.jadwalLeft}>
                          <Text style={styles.jadwalMK}>{item.subject}</Text>
                          <Text style={styles.jadwalDosen}>{item.dosen_name}</Text>
                        </View>
                        <View style={styles.jadwalRight}>
                          <Text style={styles.jadwalHari}>{item.hari}</Text>
                          <Text style={styles.jadwalJam}>{item.jam_mulai} - {item.jam_selesai}</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    style={styles.jadwalList}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Report Absensi Terbaru</Text>
                  <FlatList
                    data={classAbsensi.slice(0, 10)}
                    keyExtractor={(item) => item.id_absensi.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.absensiRow}>
                        <Text style={styles.absensiName}>{item.name}</Text>
                        <Text style={[styles.absensiStatus, { 
                          color: item.status === 'hadir' ? '#10B981' : 
                          item.status === 'terlambat' ? '#F59E0B' : '#EF4444' 
                        }]}>
                          {item.status?.toUpperCase()}
                        </Text>
                        <Text style={styles.absensiDate}>{new Date(item.tanggal).toLocaleDateString('id-ID')}</Text>
                      </View>
                    )}
                    style={styles.absensiList}
                  />
                </View>

                <View style={styles.reportButtons}>
                  <TouchableOpacity style={styles.reportButton} onPress={() => downloadReport('excel')}>
                    <FileText size={20} color="#fff" />
                    <Text style={styles.reportButtonText}>Excel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reportButton} onPress={() => downloadReport('pdf')}>
                    <Download size={20} color="#fff" />
                    <Text style={styles.reportButtonText}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reportButton} onPress={sendEmailReport}>
                    <Mail size={20} color="#fff" />
                    <Text style={styles.reportButtonText}>Email Dekan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reportButton} onPress={scheduleWAReport}>
                    <MessageCircle size={20} color="#fff" />
                    <Text style={styles.reportButtonText}>WA Mingguan</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>

        {/* JADWAL DETAIL MODAL - Modal 2 */}
        <Modal visible={showJadwalDetailModal} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selectedJadwal?.subject || 'Loading...'}</Text>
                <Text style={styles.modalSubtitle}>{selectedJadwal?.class_name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowJadwalDetailModal(false)} style={styles.closeButton}>
                <ArrowLeft size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {jadwalDetailLoading ? (
              <ActivityIndicator size="large" color={Colors.ai.primary} style={styles.loadingSpinner} />
            ) : (
              <ScrollView style={styles.jadwalDetailContent} showsVerticalScrollIndicator={false}>
                {/* Dosen & Ruangan Info */}
                <View style={styles.infoSection}>
                  <View style={styles.infoCard}>
                    <View style={styles.infoIconBox}>
                      <User size={20} color={Colors.ai.primary} />
                    </View>
                    <View style={styles.infoDetails}>
                      <Text style={styles.infoLabel}>Dosen Pengampu</Text>
                      <Text style={styles.infoValue}>{selectedJadwal?.dosen_name}</Text>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoIconBox}>
                      <MapPin size={20} color={Colors.ai.primary} />
                    </View>
                    <View style={styles.infoDetails}>
                      <Text style={styles.infoLabel}>Ruangan</Text>
                      <Text style={styles.infoValue}>{selectedJadwal?.ruang}</Text>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoIconBox}>
                      <Clock size={20} color={Colors.ai.primary} />
                    </View>
                    <View style={styles.infoDetails}>
                      <Text style={styles.infoLabel}>Waktu Kuliah</Text>
                      <Text style={styles.infoValue}>{selectedJadwal?.jam_mulai} - {selectedJadwal?.jam_selesai}</Text>
                    </View>
                  </View>
                </View>

                {/* Daftar Mahasiswa by Status */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Daftar Mahasiswa</Text>
                  
                  {jadwalAbsensi.length > 0 ? (
                    <View>
                      {/* Hadir */}
                      {jadwalAbsensi.filter(a => a.status === 'hadir').length > 0 && (
                        <View style={styles.statusSection}>
                          <View style={styles.statusHeader}>
                            <CheckCircle2 size={16} color="#10B981" />
                            <Text style={[styles.statusTitle, { color: '#10B981' }]}>
                              Hadir ({jadwalAbsensi.filter(a => a.status === 'hadir').length})
                            </Text>
                          </View>
                          {jadwalAbsensi.filter(a => a.status === 'hadir').map((item) => (
                            <View key={`${item.id_absensi}-hadir`} style={styles.studentRow}>
                              <Text style={styles.studentName}>{item.name}</Text>
                              <Text style={[styles.studentStatus, { color: '#10B981' }]}>Hadir</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Terlambat */}
                      {jadwalAbsensi.filter(a => a.status === 'terlambat').length > 0 && (
                        <View style={styles.statusSection}>
                          <View style={styles.statusHeader}>
                            <Clock size={16} color="#F59E0B" />
                            <Text style={[styles.statusTitle, { color: '#F59E0B' }]}>
                              Terlambat ({jadwalAbsensi.filter(a => a.status === 'terlambat').length})
                            </Text>
                          </View>
                          {jadwalAbsensi.filter(a => a.status === 'terlambat').map((item) => (
                            <View key={`${item.id_absensi}-terlambat`} style={styles.studentRow}>
                              <Text style={styles.studentName}>{item.name}</Text>
                              <Text style={[styles.studentStatus, { color: '#F59E0B' }]}>Terlambat</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Sakit */}
                      {jadwalAbsensi.filter(a => a.status === 'sakit').length > 0 && (
                        <View style={styles.statusSection}>
                          <View style={styles.statusHeader}>
                            <AlertCircle size={16} color="#8B5CF6" />
                            <Text style={[styles.statusTitle, { color: '#8B5CF6' }]}>
                              Sakit ({jadwalAbsensi.filter(a => a.status === 'sakit').length})
                            </Text>
                          </View>
                          {jadwalAbsensi.filter(a => a.status === 'sakit').map((item) => (
                            <View key={`${item.id_absensi}-sakit`} style={styles.studentRow}>
                              <Text style={styles.studentName}>{item.name}</Text>
                              <Text style={[styles.studentStatus, { color: '#8B5CF6' }]}>Sakit</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Izin */}
                      {jadwalAbsensi.filter(a => a.status === 'izin').length > 0 && (
                        <View style={styles.statusSection}>
                          <View style={styles.statusHeader}>
                            <FileText size={16} color="#06B6D4" />
                            <Text style={[styles.statusTitle, { color: '#06B6D4' }]}>
                              Izin ({jadwalAbsensi.filter(a => a.status === 'izin').length})
                            </Text>
                          </View>
                          {jadwalAbsensi.filter(a => a.status === 'izin').map((item) => (
                            <View key={`${item.id_absensi}-izin`} style={styles.studentRow}>
                              <Text style={styles.studentName}>{item.name}</Text>
                              <Text style={[styles.studentStatus, { color: '#06B6D4' }]}>Izin</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Alfa */}
                      {jadwalAbsensi.filter(a => a.status === 'alfa').length > 0 && (
                        <View style={styles.statusSection}>
                          <View style={styles.statusHeader}>
                            <AlertCircle size={16} color="#EF4444" />
                            <Text style={[styles.statusTitle, { color: '#EF4444' }]}>
                              Alfa ({jadwalAbsensi.filter(a => a.status === 'alfa').length})
                            </Text>
                          </View>
                          {jadwalAbsensi.filter(a => a.status === 'alfa').map((item) => (
                            <View key={`${item.id_absensi}-alfa`} style={styles.studentRow}>
                              <Text style={styles.studentName}>{item.name}</Text>
                              <Text style={[styles.studentStatus, { color: '#EF4444' }]}>Alfa</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.emptyAbsensi}>
                      <Text style={styles.emptyAbsensiText}>Tidak ada data absensi</Text>
                    </View>
                  )}
                </View>

                {/* Download Buttons */}
                <View style={styles.jadwalReportButtons}>
                  <TouchableOpacity 
                    style={[styles.jadwalReportButton, isDownloading && styles.buttonDisabled]}
                    onPress={() => downloadReport('excel')}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <FileText size={20} color="#fff" />
                    )}
                    <Text style={styles.jadwalReportButtonText}>Excel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.jadwalReportButton, isDownloading && styles.buttonDisabled]}
                    onPress={() => downloadReport('pdf')}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Download size={20} color="#fff" />
                    )}
                    <Text style={styles.jadwalReportButtonText}>PDF</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
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
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 79, 168, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(30, 79, 168, 0.3)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  daySelectorContainer: {
    marginBottom: 20,
  },
  dayScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayTabActive: {
    backgroundColor: 'rgba(30, 79, 168, 0.3)',
    borderColor: Colors.ai.primary,
  },
  dayTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  dayTabTextActive: {
    color: '#fff',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ai.primary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  classIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 79, 168, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  classInfo: {
    flex: 1,
  },
  classNameText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  classDescText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 79, 168, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleInfo: {
    flex: 1,
  },
  subjectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  classText: {
    color: Colors.ai.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  recapContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  recapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recapTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  attendancePercent: {
    color: Colors.ai.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.ai.secondary,
    borderRadius: 3,
  },
  recapFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 16,
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.ai.gradientStart,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  loadingSpinner: {
    flex: 1,
    justifyContent: 'center',
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  jadwalList: {
    marginBottom: 20,
  },
  jadwalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  jadwalLeft: {
    flex: 1,
  },
  jadwalMK: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  jadwalDosen: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  jadwalRight: {
    alignItems: 'flex-end',
  },
  jadwalHari: {
    color: Colors.ai.primary,
    fontWeight: '600',
  },
  jadwalJam: {
    color: 'rgba(255,255,255,0.8)',
  },
  absensiList: {},
  absensiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 6,
  },
  absensiName: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  absensiStatus: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  absensiDate: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  reportButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.ai.primary,
    borderRadius: 12,
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Modal 2 Styles
  modalSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  jadwalDetailContent: {
    flex: 1,
  },
  infoSection: {
    padding: 20,
    paddingBottom: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 79, 168, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoDetails: {
    flex: 1,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  statusSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    gap: 8,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  studentName: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
  },
  studentStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyAbsensi: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAbsensiText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  jadwalReportButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
  },
  jadwalReportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.ai.primary,
    borderRadius: 12,
  },
  jadwalReportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

