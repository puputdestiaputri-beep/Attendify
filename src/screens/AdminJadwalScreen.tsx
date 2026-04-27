import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, FileSpreadsheet, FileText, Users, GraduationCap, ChevronRight, CheckCircle, Clock, FileX, AlertCircle, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

// @ts-ignore
import autoTable from 'jspdf-autotable';

const { width } = Dimensions.get('window');
const API_URL = 'http://localhost:5000/api';

type StatusType = 'Hadir' | 'Telat' | 'Izin' | 'Alfa';

const daftarKelas = [
  { id: '1', nama: 'IF-4A', jumlahMahasiswa: 30, dosen: 'Dr. Siti Aminah', matkul: 'Pemrograman Web' },
  { id: '2', nama: 'IF-4B', jumlahMahasiswa: 28, dosen: 'Dr. Budi Santoso', matkul: 'Kecerdasan Buatan' },
  { id: '3', nama: 'IF-4C', jumlahMahasiswa: 32, dosen: 'Dr. Ahmad Kadir', matkul: 'Sistem Database' },
];

const dataAbsensiByKelas: Record<string, { nama: string; status: StatusType; tanggal: string }[]> = {
  '1': [
   { nama: 'Andi Wijaya', status: 'Izin', tanggal: '2026-04-27' },
{ nama: 'Budi Santoso', status: 'Alfa', tanggal: '2026-04-27' },
{ nama: 'Chika Widia Aprilia', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Citra Dewi', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Doni Pratama', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Erika Wijaya', status: 'Telat', tanggal: '2026-04-27' },
{ nama: 'Fajar Rahman', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Gilang Saputra', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Hani Kusuma', status: 'Izin', tanggal: '2026-04-27' },
{ nama: 'Imas Ratna Sari', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Indra Setiawan', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Joko Prabowo', status: 'Alfa', tanggal: '2026-04-27' },
{ nama: 'Kartika Sari', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Lestari Putri', status: 'Telat', tanggal: '2026-04-27' },
{ nama: 'Lukman Hakim', status: 'Telat', tanggal: '2026-04-27' },
{ nama: 'Marsyella Hartati', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Mega Lestari', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Nanda Putra', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Nindy Faoziyah', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Oki Ramadhan', status: 'Izin', tanggal: '2026-04-27' },
{ nama: 'Puput Destia Putri', status: 'Izin', tanggal: '2026-04-27' },
{ nama: 'Putra Nugraha', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Qori Aulia', status: 'Telat', tanggal: '2026-04-27' },
{ nama: 'Rian Hidayat', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Rizky Maulana', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Salsa Billa', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Teguh Santoso', status: 'Alfa', tanggal: '2026-04-27' },
{ nama: 'Umi Farah', status: 'Hadir', tanggal: '2026-04-27' },
{ nama: 'Vina Oktaviani', status: 'Telat', tanggal: '2026-04-27' },
{ nama: 'Wansyca Ayu Wardany', status: 'Izin', tanggal: '2026-04-27' },
  ],
  '2': [
    { nama: 'Gita Sari', status: 'Hadir', tanggal: '2026-04-27' },
    { nama: 'Hendra Kusuma', status: 'Hadir', tanggal: '2026-04-27' },
    { nama: 'Ina Putri', status: 'Izin', tanggal: '2026-04-27' },
    { nama: 'Joko Suryanto', status: 'Hadir', tanggal: '2026-04-27' },
    { nama: 'Kiki Amalia', status: 'Telat', tanggal: '2026-04-27' },
  ],
  '3': [
    { nama: 'Ludi Hermawan', status: 'Hadir', tanggal: '2026-04-27' },
    { nama: 'Mita Shofianti', status: 'Hadir', tanggal: '2026-04-27' },
    { nama: 'Niko Setiawan', status: 'Hadir', tanggal: '2026-04-27' },
  ],
};

const jadwalKuliahByKelas: Record<string, any> = {
  '1': { kelas: 'IF-4A', dosen: 'Dr. Siti Aminah', matkul: 'Pemrograman Web', ruangan: 'Lab 2', jam: '08:00 - 09:40' },
  '2': { kelas: 'IF-4B', dosen: 'Dr. Budi Santoso', matkul: 'Kecerdasan Buatan', ruangan: 'Lab 3', jam: '10:00 - 11:40' },
  '3': { kelas: 'IF-4C', dosen: 'Dr. Ahmad Kadir', matkul: 'Sistem Database', ruangan: 'Lab 1', jam: '13:00 - 14:40' },
};

const statusColor: Record<StatusType, string> = {
  Hadir: '#22c55e',
  Telat: '#eab308',
  Izin: '#2563eb',
  Alfa: '#ef4444',
};

// Wrapper component for colored icons
const ColoredIcon = ({ icon: Icon, color, size }: { icon: any; color: string; size: number }) => {
  // @ts-ignore
  return <Icon size={size} color={color} />;
};

const statusIcon: Record<StatusType, React.ReactElement> = {
  Hadir: <ColoredIcon icon={CheckCircle} size={16} color="#22c55e" />,
  Telat: <ColoredIcon icon={Clock} size={16} color="#eab308" />,
  Izin: <ColoredIcon icon={FileX} size={16} color="#2563eb" />,
  Alfa: <ColoredIcon icon={AlertCircle} size={16} color="#ef4444" />,
};

function hitungRekap(data: any[]) {
  return {
    hadir: data.filter(d => d.status === 'Hadir').length,
    telat: data.filter(d => d.status === 'Telat').length,
    izin: data.filter(d => d.status === 'Izin').length,
    alfa: data.filter(d => d.status === 'Alfa').length,
  };
}

// Animated Card Component
const AnimatedStatCard = ({ status, color, icon, number, label, index }: any) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statCard,
        { borderLeftColor: color },
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {icon}
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// Animated Info Card Component
const AnimatedInfoCard = ({ children, delay }: any) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: opacityAnim,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function AdminJadwalScreen() {
  const navigation = useNavigation<any>();
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;

  const jadwal = selectedKelasId ? jadwalKuliahByKelas[selectedKelasId] : null;
  const absensi = selectedKelasId ? dataAbsensiByKelas[selectedKelasId] || [] : [];
  const rekap = hitungRekap(absensi);
  const totalMahasiswa = selectedKelasId ? daftarKelas.find(k => k.id === selectedKelasId)?.jumlahMahasiswa || 0 : 0;

  // Header animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerScaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedKelasId]);

  const downloadReport = async (type: 'excel' | 'pdf') => {
    const isExcel = type === 'excel';
    const setLoading = isExcel ? setLoadingExcel : setLoadingPDF;
    setLoading(true);

    try {
      if (isExcel) {
        // Generate Excel file
        const workbook = XLSX.utils.book_new();

        // Sheet 1: Informasi Jadwal
        const scheduleData = [
          ['INFORMASI JADWAL KULIAH'],
          [],
          ['Kelas', jadwal?.kelas],
          ['Mata Kuliah', jadwal?.matkul],
          ['Dosen', jadwal?.dosen],
          ['Ruangan', jadwal?.ruangan],
          ['Jam Kuliah', jadwal?.jam],
          ['Tanggal Export', new Date().toLocaleDateString('id-ID')],
        ];
        const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
        scheduleSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
        XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'Jadwal');

        // Sheet 2: Rekap Absensi
        const rekapData = [
          ['REKAP ABSENSI'],
          [],
          ['Status', 'Jumlah'],
          ['Hadir', rekap.hadir],
          ['Telat', rekap.telat],
          ['Izin', rekap.izin],
          ['Alfa', rekap.alfa],
          [],
          ['Total Mahasiswa', totalMahasiswa],
          ['Persentase Kehadiran', `${((rekap.hadir / totalMahasiswa) * 100).toFixed(2)}%`],
        ];
        const rekapSheet = XLSX.utils.aoa_to_sheet(rekapData);
        rekapSheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, rekapSheet, 'Rekap');

        // Sheet 3: Daftar Absensi
        const absensiData = [
          ['DAFTAR ABSENSI MAHASISWA'],
          [],
          ['No', 'Nama Mahasiswa', 'Status', 'Tanggal'],
          ...absensi.map((item, idx) => [
            idx + 1,
            item.nama,
            item.status,
            item.tanggal,
          ]),
        ];
        const absensiSheet = XLSX.utils.aoa_to_sheet(absensiData);
        absensiSheet['!cols'] = [
          { wch: 5 },
          { wch: 25 },
          { wch: 12 },
          { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(workbook, absensiSheet, 'Daftar Absensi');

        // Write file
        const wbout = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'base64',
        });

        const fileName = `Laporan-Absensi-${jadwal?.kelas}-${new Date().getTime()}.xlsx`;
        const fileUri = `${Paths.cache}/${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: 'base64',
        } as any);

        await Sharing.shareAsync(fileUri, {
          mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: `Share ${fileName}`,
        });

        Alert.alert('Sukses', `File ${fileName} telah berhasil dibuat dan dibagikan!`);
      } else {
        // Generate PDF file
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        let yPosition = 10;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('LAPORAN ABSENSI MAHASISWA', 105, yPosition, { align: 'center' });
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 105, yPosition, {
          align: 'center',
        });
        yPosition += 12;

        // Informasi Jadwal
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('INFORMASI JADWAL KULIAH', 10, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Kelas         : ${jadwal?.kelas}`, 10, yPosition);
        yPosition += 6;
        doc.text(`Mata Kuliah   : ${jadwal?.matkul}`, 10, yPosition);
        yPosition += 6;
        doc.text(`Dosen         : ${jadwal?.dosen}`, 10, yPosition);
        yPosition += 6;
        doc.text(`Ruangan       : ${jadwal?.ruangan}`, 10, yPosition);
        yPosition += 6;
        doc.text(`Jam Kuliah    : ${jadwal?.jam}`, 10, yPosition);
        yPosition += 12;

        // Rekap Absensi
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('REKAP ABSENSI', 10, yPosition);
        yPosition += 8;

        const rekapTableData = [
          ['Hadir', 'Telat', 'Izin', 'Alfa', 'Total', 'Kehadiran'],
          [
            rekap.hadir.toString(),
            rekap.telat.toString(),
            rekap.izin.toString(),
            rekap.alfa.toString(),
            totalMahasiswa.toString(),
            `${((rekap.hadir / totalMahasiswa) * 100).toFixed(2)}%`,
          ],
        ];

        autoTable(doc, {
          head: rekapTableData.slice(0, 1),
          body: rekapTableData.slice(1),
          startY: yPosition,
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
          },
          bodyStyles: {
            halign: 'center',
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 25 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 30 },
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 12;

        // Daftar Absensi
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('DAFTAR ABSENSI MAHASISWA', 10, yPosition);
        yPosition += 8;

        const tableData = [
          ['No', 'Nama Mahasiswa', 'Status', 'Tanggal'],
          ...absensi.map((item, idx) => [
            (idx + 1).toString(),
            item.nama,
            item.status,
            item.tanggal,
          ]),
        ];

        autoTable(doc, {
          head: tableData.slice(0, 1),
          body: tableData.slice(1),
          startY: yPosition,
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
          },
          bodyStyles: {
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 60 },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 40, halign: 'center' },
          },
        });

        // Write PDF to file
        const pdfData = doc.output('datauristring');
        const base64Data = pdfData.split(',')[1];
        const fileName = `Laporan-Absensi-${jadwal?.kelas}-${new Date().getTime()}.pdf`;
        const fileUri = `${Paths.cache}/${fileName}`;

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: 'base64',
        } as any);

        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${fileName}`,
        });

        Alert.alert('Sukses', `File ${fileName} telah berhasil dibuat dan dibagikan!`);
      }
    } catch (err: any) {
      console.error('Export Error:', err);
      Alert.alert('Error', `Gagal membuat file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#0a0e27', '#0f172a', '#1a1f3a']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      
      {/* ANIMATED HEADER */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            transform: [{ scale: headerScaleAnim }],
            opacity: headerOpacityAnim,
          }
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              headerScaleAnim.setValue(0.9);
              headerOpacityAnim.setValue(0);
              setTimeout(() => {
                if (selectedKelasId) setSelectedKelasId(null);
                else navigation.goBack();
              }, 200);
            }}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <LinearGradient 
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.backButtonGradient}
            >
              {/* @ts-ignore */}
              <ArrowLeft color="#60a5fa" size={24} />
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {selectedKelasId ? jadwal?.kelas : 'Daftar Kelas'}
            </Text>
          </View>
          {/* @ts-ignore */}
          <Sparkles color="#60a5fa" size={20} />
        </View>
      </Animated.View>

      {selectedKelasId ? (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >

          {/* INFO JADWAL KULIAH */}
          <AnimatedInfoCard delay={0}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.sectionHeader}>
                <LinearGradient 
                  colors={['#3b82f6', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBg}
                >
                  {/* @ts-ignore */}
                  <GraduationCap size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.section}>Informasi Jadwal Kuliah</Text>
              </View>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>👨‍🏫 Dosen</Text>
                  <Text style={styles.infoValue}>{jadwal?.dosen}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>📚 Mata Kuliah</Text>
                  <Text style={styles.infoValue}>{jadwal?.matkul}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🏫 Ruangan</Text>
                  <Text style={styles.infoValue}>{jadwal?.ruangan}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>🕐 Jam Kuliah</Text>
                  <Text style={styles.infoValue}>{jadwal?.jam}</Text>
                </View>
              </View>
            </LinearGradient>
          </AnimatedInfoCard>

          {/* REKAP ABSENSI */}
          <AnimatedInfoCard delay={100}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.sectionHeader}>
                <LinearGradient 
                  colors={['#6366f1', '#4f46e5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBg}
                >
                  {/* @ts-ignore */}
                  <Users size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.section}>Rekap Absensi Mahasiswa</Text>
              </View>
              <View style={styles.statGrid}>
                <AnimatedStatCard 
                  index={0}
                  color="#22c55e"
                  number={rekap.hadir}
                  label="Hadir"
                  icon={<ColoredIcon icon={CheckCircle} size={24} color="#22c55e" />}
                />
                <AnimatedStatCard 
                  index={1}
                  color="#eab308"
                  number={rekap.telat}
                  label="Telat"
                  icon={<ColoredIcon icon={Clock} size={24} color="#eab308" />}
                />
                <AnimatedStatCard 
                  index={2}
                  color="#2563eb"
                  number={rekap.izin}
                  label="Izin"
                  icon={<ColoredIcon icon={FileX} size={24} color="#2563eb" />}
                />
                <AnimatedStatCard 
                  index={3}
                  color="#ef4444"
                  number={rekap.alfa}
                  label="Alfa"
                  icon={<ColoredIcon icon={AlertCircle} size={24} color="#ef4444" />}
                />
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Total Kehadiran</Text>
                  <Text style={styles.progressPercentage}>{Math.round((rekap.hadir / totalMahasiswa) * 100)}%</Text>
                </View>
                <LinearGradient
                  colors={['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBarContainer}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressBarFill, 
                      { width: `${(rekap.hadir / totalMahasiswa) * 100}%` }
                    ]}
                  />
                </LinearGradient>
              </View>
            </LinearGradient>
          </AnimatedInfoCard>

          {/* DAFTAR ABSENSI */}
          <AnimatedInfoCard delay={200}>
            <LinearGradient
              colors={['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <View style={styles.sectionHeader}>
                <LinearGradient 
                  colors={['#ec4899', '#db2777']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconBg}
                >
                  {/* @ts-ignore */}
                  <FileText size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.section}>Daftar Absensi ({absensi.length})</Text>
              </View>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol1, styles.tableHeaderText]}>Nama</Text>
                <Text style={[styles.tableCol2, styles.tableHeaderText]}>Status</Text>
                <Text style={[styles.tableCol3, styles.tableHeaderText]}>Tanggal</Text>
              </View>
              {absensi.map((d, i) => (
                <Pressable 
                  key={i} 
                  style={({ pressed }) => [
                    styles.tableRow,
                    pressed && { 
                      backgroundColor: 'rgba(96, 165, 250, 0.15)',
                      transform: [{ scale: 0.99 }]
                    }
                  ]}
                >
                  <Text style={[styles.tableCol1, styles.tableText]}>{d.nama}</Text>
                  <View style={[styles.tableCol2, styles.statusBadge]}>
                    <LinearGradient
                      colors={[statusColor[d.status] + '30', statusColor[d.status] + '10']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.statusBadgeGradient}
                    >
                      <View style={{ marginRight: 6 }}>
                        {statusIcon[d.status]}
                      </View>
                      <Text style={[styles.tableText, { color: statusColor[d.status], fontWeight: '600' }]}>
                        {d.status}
                      </Text>
                    </LinearGradient>
                  </View>
                  <Text style={[styles.tableCol3, styles.tableText, { fontSize: 12 }]}>{d.tanggal}</Text>
                </Pressable>
              ))}
            </LinearGradient>
          </AnimatedInfoCard>

          {/* EXPORT BUTTONS */}
          <AnimatedInfoCard delay={300}>
            <View style={styles.buttonContainer}>
              <Pressable 
                style={({ pressed }) => [
                  styles.exportBtn,
                  styles.excelBtn,
                  pressed && { transform: [{ scale: 0.95 }] }
                ]}
                onPress={() => downloadReport('excel')}
                disabled={loadingExcel}
              >
                {loadingExcel ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    {/* @ts-ignore */}
                    <FileSpreadsheet size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>Excel</Text>
                  </>
                )}
              </Pressable>

              <Pressable 
                style={({ pressed }) => [
                  styles.exportBtn,
                  styles.pdfBtn,
                  pressed && { transform: [{ scale: 0.95 }] }
                ]}
                onPress={() => downloadReport('pdf')}
                disabled={loadingPDF}
              >
                {loadingPDF ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    {/* @ts-ignore */}
                    <FileText size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.btnText}>PDF</Text>
                  </>
                )}
              </Pressable>
            </View>
          </AnimatedInfoCard>

        </ScrollView>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.klasListContainer}>
            {daftarKelas.map((k, idx) => {
              const colorGroups = [
                ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)'],
                ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)'],
                ['rgba(236, 72, 153, 0.2)', 'rgba(236, 72, 153, 0.05)'],
              ];
              const colors = colorGroups[idx % 3] as [string, string];
              
              return (
              <Pressable 
                key={k.id} 
                style={({ pressed }) => [
                  styles.klasCard,
                  pressed && { 
                    transform: [{ scale: 0.97 }],
                  }
                ]}
                onPress={() => {
                  headerScaleAnim.setValue(0.9);
                  headerOpacityAnim.setValue(0);
                  setTimeout(() => setSelectedKelasId(k.id), 200);
                }}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.klasCardHeader}>
                  <View>
                    <Text style={styles.klasName}>{k.nama}</Text>
                    <Text style={styles.klasMatkul}>📖 {k.matkul}</Text>
                  </View>
                  {/* @ts-ignore */}
                  <ChevronRight color="#60a5fa" size={20} />
                </View>
                <View style={styles.klasInfoRow}>
                  <Text style={styles.klasInfo}>👨‍🏫 {k.dosen}</Text>
                  <Text style={styles.klasInfo}>👥 {k.jumlahMahasiswa}</Text>
                </View>
              </Pressable>
            );
            })}
          </View>
        </ScrollView>
      )}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // HEADER
  headerContainer: {
    paddingTop: 50,
    marginBottom: 8,
  },
  header: {
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // CARD STYLING
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  section: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  // INFO GRID
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 14,
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoValue: {
    color: '#f1f5f9',
    fontSize: 15,
    fontWeight: '600',
  },

  // STAT GRID
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 18,
  },
  statCard: {
    width: '50%',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 8,
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },

  // PROGRESS BAR
  progressBar: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },

  // TABLE STYLING
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  tableHeaderText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.05)',
    alignItems: 'center',
  },
  tableCol1: {
    flex: 2,
  },
  tableCol2: {
    flex: 1.2,
  },
  tableCol3: {
    flex: 0.8,
  },
  tableText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  // BUTTON STYLING
  buttonContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderWidth: 1,
  },
  excelBtn: {
    backgroundColor: '#16a34a',
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  pdfBtn: {
    backgroundColor: '#dc2626',
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },

  // KELAS LIST
  klasListContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  klasCard: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
  },
  klasCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  klasName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  klasMatkul: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  klasInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  klasInfo: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
});