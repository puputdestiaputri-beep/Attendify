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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Mail, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function ProfileDetailsScreen() {
  const navigation = useNavigation<any>();
  const { user, login } = useAuth();

  // FIX: pakai any biar nggak error type dulu
  const [name, setName] = useState((user as any)?.fullName || '');
  const [email, setEmail] = useState((user as any)?.email || '');

  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const userRole = 'Mahasiswa';

  const handleSave = async () => {
    setSaving(true);
    try {
      login('mahasiswa', { ...(user as any), fullName: name, email });
      Alert.alert('Berhasil', 'Perubahan profil berhasil disimpan.');
      setChanged(false);
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.attendify.primary, Colors.attendify.tertiary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Profil</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={styles.avatarGradient}
            >
              <User size={80} color="#fff" />
            </LinearGradient>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Belum Tersedia</Text>
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.fieldsContainer}>
              {/* Nama */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <User size={18} color={Colors.attendify.primary} />
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
                    placeholder="Nama"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Mail size={18} color={Colors.attendify.primary} />
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
                    placeholder="Email"
                    keyboardType="email-address"
                    editable={!saving}
                  />
                </View>
              </View>

              {/* Role */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Briefcase size={18} color={Colors.attendify.primary} />
                  <Text style={styles.fieldLabel}>Role</Text>
                </View>
                <View style={styles.fieldContent}>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{userRole}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                ℹ️ Data profil tersimpan di perangkat.
              </Text>
            </View>
          </View>

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
    paddingBottom: 40,
  },
   fieldsContainer: {
    marginBottom: 20,
  },

  input: {
    fontSize: 15,
    color: Colors.attendify.onSurface,
    fontWeight: '500',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },

  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 10,
  },

  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  avatarSection: {
    alignItems: 'center',
    marginVertical: 30,
  },

  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusBadge: {
    marginTop: 10,
  },

  statusText: {
    color: '#FFA500',
  },

  card: {
    backgroundColor: Colors.attendify.surface,
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },

  field: {
    marginBottom: 15,
  },

  fieldHeader: {
    flexDirection: 'row',
    gap: 8,
  },

  fieldLabel: {
    fontWeight: '600',
  },

  fieldContent: {
    marginTop: 5,
  },

  roleBadge: {
    backgroundColor: '#eee',
    padding: 5,
    borderRadius: 6,
  },

  roleText: {
    fontWeight: '600',
  },

  infoBox: {
    marginTop: 10,
  },

  infoText: {
    fontSize: 12,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    margin: 20,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: Colors.attendify.primary,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  secondaryButtonText: {
    color: '#000',
  },
});