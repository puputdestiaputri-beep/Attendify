import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ArrowLeft, User, Mail, Briefcase, Camera, IdCard, Phone, BookOpen, GraduationCap, Save, ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileDetailsScreen() {
  const navigation = useNavigation<any>();
  const { user, login, role } = useAuth();

  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [prodi, setProdi] = useState(user?.prodi || '');
  const [kelas, setKelas] = useState(user?.kelas || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [idNumber, setIdNumber] = useState(user?.nim || '');

  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : '-';

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      setChanged(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = user ? 
        { ...user, fullName: name, email, avatar, prodi, kelas, phone, nim: idNumber } : 
        { fullName: name, email, avatar, prodi, kelas, phone, nim: idNumber };
      
      if (email && avatar) {
        await AsyncStorage.setItem(`@avatar_${email}`, avatar);
      }

      if (role) {
        login(role, updatedUser);
        Alert.alert('Berhasil', 'Perubahan profil berhasil disimpan.');
        setChanged(false);
      }
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ubah Profil</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={{ alignItems: 'center' }}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                <LinearGradient
                  colors={['#3B82F6', '#8B5CF6']}
                  style={styles.avatarGradient}
                >
                  <User size={80} color="#fff" />
                </LinearGradient>
              )}
              
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3B82F6', padding: 8, borderRadius: 20 }}>
                <Camera size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <View style={[styles.statusBadge, { marginTop: 16 }]}>
              <Text style={styles.statusText}>{avatar ? 'Edit Foto' : 'Pilih Foto'}</Text>
            </View>
          </View>

          {/* Card */}
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <View style={styles.fieldsContainer}>
              {/* Nama */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <User size={18} color={Colors.ai.primary} />
                  <Text style={styles.fieldLabel}>Nama Lengkap</Text>
                </View>
                <View style={styles.fieldContent}>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      setChanged(true);
                    }}
                    placeholder="Masukkan nama lengkap"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Mail size={18} color={Colors.ai.primary} />
                  <Text style={styles.fieldLabel}>Email</Text>
                </View>
                <View style={styles.fieldContent}>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setChanged(true);
                    }}
                    placeholder="email@example.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="email-address"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* NIM / NIP */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <IdCard size={18} color={Colors.ai.primary} />
                  <Text style={styles.fieldLabel}>
                    {role === 'dosen' ? 'NIP' : role === 'admin' ? 'Admin ID' : 'NIM'}
                  </Text>
                </View>
                <View style={styles.fieldContent}>
                  <TextInput
                    style={styles.input}
                    value={idNumber}
                    onChangeText={(t) => {
                      setIdNumber(t);
                      setChanged(true);
                    }}
                    placeholder={role === 'dosen' ? 'NIP' : role === 'admin' ? 'Admin ID' : 'NIM'}
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Mahasiswa Only Fields */}
              {role === 'mahasiswa' && (
                <>
                  <View style={styles.field}>
                    <View style={styles.fieldHeader}>
                      <BookOpen size={18} color={Colors.ai.primary} />
                      <Text style={styles.fieldLabel}>Program Studi</Text>
                    </View>
                    <View style={styles.fieldContent}>
                      <TextInput
                        style={styles.input}
                        value={prodi}
                        onChangeText={(t) => {
                          setProdi(t);
                          setChanged(true);
                        }}
                        placeholder="Program Studi"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        editable={!saving}
                      />
                    </View>
                  </View>

                  <View style={styles.field}>
                    <View style={styles.fieldHeader}>
                      <GraduationCap size={18} color={Colors.ai.primary} />
                      <Text style={styles.fieldLabel}>Kelas</Text>
                    </View>
                    <View style={styles.fieldContent}>
                      <TextInput
                        style={styles.input}
                        value={kelas}
                        onChangeText={(t) => {
                          setKelas(t);
                          setChanged(true);
                        }}
                        placeholder="Kelas"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        editable={!saving}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Dosen Only Fields */}
              {role === 'dosen' && (
                <View style={styles.field}>
                  <View style={styles.fieldHeader}>
                    <Phone size={18} color={Colors.ai.primary} />
                    <Text style={styles.fieldLabel}>Nomor Telepon</Text>
                  </View>
                  <View style={styles.fieldContent}>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={(t) => {
                        setPhone(t);
                        setChanged(true);
                      }}
                      placeholder="Nomor Telepon"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      editable={!saving}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ⚠️ Perubahan data akan tersimpan di profil akun Anda.
              </Text>
            </View>
          </BlurView>

          {/* Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Kembali</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { opacity: changed ? 1 : 0.5 },
              ]}
              onPress={handleSave}
              disabled={!changed}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 40,
  },
  fieldsContainer: {
    marginBottom: 10,
  },

  input: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  backButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },

  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },

  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  statusBadge: {
    marginTop: 10,
  },

  statusText: {
    color: Colors.ai.primary,
    fontWeight: '600',
  },

  card: {
    margin: 20,
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },

  field: {
    marginBottom: 20,
  },

  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  fieldLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  fieldContent: {
    marginTop: 0,
  },

  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  roleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  infoBox: {
    marginTop: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },

  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 18,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 40,
  },

  primaryButton: {
    flex: 2,
    backgroundColor: Colors.ai.primary,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.ai.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});