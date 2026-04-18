import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Modal, Alert, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  ArrowLeft, Search, UserPlus, Trash2, 
  Edit3, Filter, X, Check, GraduationCap, 
  Users, IdCard, Mail, Phone
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Mock Data
const INITIAL_STUDENTS = [
  { id: '1', name: 'Budi Santoso', nim: '20240001', prodi: 'Informatika', kelas: 'A Pagi', email: 'budi@example.com' },
  { id: '2', name: 'Aisyah Mutiara', nim: '20240002', prodi: 'Sistem Informasi', kelas: 'B Sore', email: 'aisyah@example.com' },
  { id: '3', name: 'Rizwan Hakim', nim: '20240003', prodi: 'Informatika', kelas: 'A Pagi', email: 'rizwan@example.com' },
];

export default function ManageStudentsScreen() {
  const navigation = useNavigation<any>();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', nim: '', prodi: '', kelas: '', email: ''
  });

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nim.includes(searchQuery)
  );

  const handleAddPress = () => {
    setEditingStudent(null);
    setFormData({ name: '', nim: '', prodi: '', kelas: '', email: '' });
    setIsModalVisible(true);
  };

  const handleEditPress = (student: any) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsModalVisible(true);
  };

  const handleDeletePress = (id: string) => {
    Alert.alert(
      'Hapus Data',
      'Apakah Anda yakin ingin menghapus data siswa ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive', 
          onPress: () => setStudents(prev => prev.filter(s => s.id !== id)) 
        }
      ]
    );
  };

  const handleSave = () => {
    if (!formData.name || !formData.nim) {
      Alert.alert('Error', 'Nama dan NIM wajib diisi');
      return;
    }

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...formData, id: s.id } : s));
    } else {
      const newStudent = { ...formData, id: Date.now().toString() };
      setStudents(prev => [newStudent, ...prev]);
    }
    setIsModalVisible(false);
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Basis Data Siswa</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <BlurView intensity={20} tint="dark" style={styles.searchBar}>
            <Search size={20} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama atau NIM..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            )}
          </BlurView>
        </View>

        {/* Student List */}
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredStudents.map(student => (
            <BlurView key={student.id} intensity={15} tint="dark" style={styles.studentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentNim}>{student.nim}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleEditPress(student)} style={styles.actionBtn}>
                    <Edit3 size={18} color={Colors.ai.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePress(student.id)} style={styles.actionBtn}>
                    <Trash2 size={18} color="#F87171" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.cardFooter}>
                <View style={styles.metaItem}>
                  <GraduationCap size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.metaText}>{student.prodi}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.metaText}>{student.kelas}</Text>
                </View>
              </View>
            </BlurView>
          ))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
          <LinearGradient
            colors={[Colors.ai.primary, Colors.ai.accentGlow]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <UserPlus color="#fff" size={24} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add/Edit Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={80} tint="dark" style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X color="#fff" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Lengkap</Text>
                  <View style={styles.inputWrap}>
                    <Users size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={text => setFormData({...formData, name: text})}
                      placeholder="Masukkan nama..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NIM / Nomor Induk</Text>
                  <View style={styles.inputWrap}>
                    <IdCard size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      value={formData.nim}
                      onChangeText={text => setFormData({...formData, nim: text})}
                      placeholder="Masukkan NIM..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Program Studi</Text>
                  <View style={styles.inputWrap}>
                    <GraduationCap size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      value={formData.prodi}
                      onChangeText={text => setFormData({...formData, prodi: text})}
                      placeholder="Informatika, SI, dll..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Kelas</Text>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={formData.kelas}
                        onChangeText={text => setFormData({...formData, kelas: text})}
                        placeholder="A Pagi..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputWrap}>
                      <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={text => setFormData({...formData, email: text})}
                        placeholder="email@..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <LinearGradient
                    colors={[Colors.ai.primary, Colors.ai.accentGlow]}
                    style={styles.saveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Check color="#fff" size={20} />
                    <Text style={styles.saveBtnText}>Simpan Data</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
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
    marginBottom: 20,
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  studentCard: {
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
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentNim: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalForm: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
  },
  saveBtn: {
    marginTop: 20,
    marginBottom: 40,
    borderRadius: 18,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
