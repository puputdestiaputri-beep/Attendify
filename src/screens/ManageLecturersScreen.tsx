import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Modal, Alert, Dimensions, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  ArrowLeft, Search, UserPlus, Trash2, 
  Edit3, Filter, X, Check, ShieldCheck, 
  UserCheck, Briefcase, Mail, Phone, IdCard
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


const { width } = Dimensions.get('window');

// Mock Data
const INITIAL_LECTURERS = [
  { id: '1', name: 'Dr. Handoko', nip: '19750001', jabatan: 'Lektor Kepala', email: 'handoko@example.com', phone: '08123456789' },
  { id: '2', name: 'Ir. Siti Khadijah', nip: '19820002', jabatan: 'Asisten Ahli', email: 'siti@example.com', phone: '08523456789' },
  { id: '3', name: 'Dr. Ahmad Subarjo', nip: '19700003', jabatan: 'Profesor', email: 'ahmad@example.com', phone: '08723456789' },
];

const API_URL = 'http://localhost:5000/api';

export default function ManageLecturersScreen() {
  const navigation = useNavigation<any>();
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', nip: '', jabatan: '', email: '', phone: '', password: ''
  });

  const fetchLecturers = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.status === 'success') {
        const dosenOnly = result.data.filter((u: any) => u.role === 'dosen');
        setLecturers(dosenOnly);
      }
    } catch (error) {
      console.error('Fetch lecturers error:', error);
      Alert.alert('Error', 'Gagal mengambil data dosen');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchLecturers();
    }, [])
  );


  const filteredLecturers = lecturers.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.nip.includes(searchQuery)
  );

  const handleAddPress = () => {
    setEditingLecturer(null);
    setFormData({ name: '', nip: '', jabatan: '', email: '', phone: '', password: '' });
    setIsModalVisible(true);
  };

  const handleEditPress = (lecturer: any) => {
    setEditingLecturer(lecturer);
    setFormData({ ...lecturer, password: '' }); // Password ignored for edit for now
    setIsModalVisible(true);
  };


  const handleDeletePress = (id: string) => {
    Alert.alert(
      'Hapus Data',
      'Apakah Anda yakin ingin menghapus data dosen ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('@attendify_auth_token');
              const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.ok) {
                fetchLecturers();
              }
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus dosen');
            }
          }
        }

      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || (!editingLecturer && !formData.password)) {
      Alert.alert('Error', 'Lengkapi data yang wajib diisi (Nama, Email, dan Password untuk data baru)');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      let response;
      
      if (editingLecturer) {
        response = await fetch(`${API_URL}/users/${editingLecturer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: 'dosen'
          })
        });
      } else {
        response = await fetch(`${API_URL}/register/admin-dosen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'dosen'
          })
        });
      }

      const result = await response.json();
      if (response.ok || result.status === 'success') {
        Alert.alert('Berhasil', editingLecturer ? 'Data dosen berhasil diperbarui' : 'Dosen baru berhasil ditambahkan');
        fetchLecturers();
        setIsModalVisible(false);
      } else {
        Alert.alert('Gagal', result.message || 'Terjadi kesalahan saat menyimpan data');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Terjadi kesalahan koneksi');
    }
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
          <Text style={styles.headerTitle}>Basis Data Dosen</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <BlurView intensity={20} tint="dark" style={styles.searchBar}>
            <Search size={20} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama atau NIP..."
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

        {/* Lecturer List */}
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {filteredLecturers.map(lecturer => (
            <BlurView key={lecturer.id} intensity={15} tint="dark" style={styles.lecturerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <ShieldCheck size={24} color="#fff" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{lecturer.name}</Text>
                  <Text style={styles.nip}>{lecturer.nip}</Text>
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleEditPress(lecturer)} style={styles.actionBtn}>
                    <Edit3 size={18} color={Colors.ai.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePress(lecturer.id)} style={styles.actionBtn}>
                    <Trash2 size={18} color="#F87171" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.cardFooter}>
                <View style={styles.metaItem}>
                  <Briefcase size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.metaText}>{lecturer.jabatan}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Mail size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.metaText} numberOfLines={1}>{lecturer.email}</Text>
                </View>
              </View>
            </BlurView>
          ))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleAddPress}>
          <LinearGradient
            colors={['#A78BFA', '#7C3AED']}
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
                  {editingLecturer ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <X color="#fff" size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Lengkap (Gelar)</Text>
                  <View style={styles.inputWrap}>
                    <UserCheck size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={text => setFormData({...formData, name: text})}
                      placeholder="Contoh: Dr. John Doe, M.Kom"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NIP / Nomor Induk</Text>
                  <View style={styles.inputWrap}>
                    <IdCard size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      value={formData.nip}
                      onChangeText={text => setFormData({...formData, nip: text})}
                      placeholder="Masukkan NIP..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Jabatan Akademik</Text>
                  <View style={styles.inputWrap}>
                    <Briefcase size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      value={formData.jabatan}
                      onChangeText={text => setFormData({...formData, jabatan: text})}
                      placeholder="Lektor, Asisten Ahli, dll..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputWrap}>
                      <Mail size={18} color="rgba(255,255,255,0.4)" />
                      <TextInput
                        style={[styles.input, { marginLeft: 8 }]}
                        value={formData.email}
                        onChangeText={text => setFormData({...formData, email: text})}
                        placeholder="email@..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="email-address"
                      />
                    </View>
                  </View>
                </View>

                {!editingLecturer && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password Awal</Text>
                    <View style={styles.inputWrap}>
                      <ShieldCheck size={18} color="rgba(255,255,255,0.4)" />
                      <TextInput
                        style={[styles.input, { marginLeft: 8 }]}
                        value={formData.password}
                        onChangeText={text => setFormData({...formData, password: text})}
                        placeholder="Password untuk dosen ini..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        secureTextEntry={true}
                      />
                    </View>
                  </View>
                )}


                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <LinearGradient
                    colors={['#A78BFA', '#7C3AED']}
                    style={styles.saveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Check color="#fff" size={20} />
                    <Text style={styles.saveBtnText}>Simpan Data Dosen</Text>
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
  lecturerCard: {
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
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nip: {
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
    gap: 16,
  },
  metaItem: {
    flex: 1,
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
