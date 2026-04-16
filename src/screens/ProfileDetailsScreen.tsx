
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Mail, Briefcase } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function ProfileDetailsScreen() {
  const navigation = useNavigation<any>();
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const userRole = 'Mahasiswa';

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update context & storage
      login('mahasiswa', { ...user, fullName: name, email });
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <User size={80} color="#fff" strokeWidth={1} />
          </LinearGradient>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Belum Tersedia</Text>
          </View>
        </View>


        {/* Info Card */}
        <View style={styles.card}>
          {/* Profile Fields */}
          <View style={styles.fieldsContainer}>
            {/* Name Field */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Mail size={18} color={Colors.attendify.primary} />
                <Text style={styles.fieldLabel}>Nama Lengkap</Text>
              </View>
              <View style={styles.fieldContent}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={t => { setName(t); setChanged(true); }}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#aaa"
                  editable={!saving}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.field}>
              <View style={styles.fieldHeader}>
                <Mail size={18} color={Colors.attendify.primary} />
                <Text style={styles.fieldLabel}>Email</Text>
              </View>
              <View style={styles.fieldContent}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={t => { setEmail(t); setChanged(true); }}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!saving}
                />
              </View>
            </View>

            {/* Role Field */}
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

          {/* Info Text */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Data profil Anda akan tersimpan di perangkat.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.secondaryButtonText}>Kembali</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, { opacity: changed && !saving ? 1 : 0.5 }]}
            onPress={handleSave}
            disabled={!changed || saving}
          >
            <Text style={styles.primaryButtonText}>{saving ? 'Menyimpan...' : 'Simpan'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
  input: {
    fontSize: 15,
    color: Colors.attendify.onSurface,
    fontWeight: '500',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 40,
  },
  avatarGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,165,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,165,0,0.5)',
  },
  statusText: {
    color: '#FFA500',
    fontWeight: '600',
    fontSize: 12,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.attendify.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: Colors.attendify.neutral,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  fieldsContainer: {
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.attendify.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldContent: {
    backgroundColor: 'rgba(11,30,95,0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(11,30,95,0.1)',
  },
  fieldValue: {
    fontSize: 15,
    color: Colors.attendify.onSurface,
    fontWeight: '500',
    marginBottom: 8,
  },
  skeletonLine: {
    height: 8,
    backgroundColor: 'rgba(11,30,95,0.1)',
    borderRadius: 4,
    width: '40%',
  },
  roleBadge: {
    backgroundColor: 'rgba(30,79,168,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.attendify.primary,
  },
  infoBox: {
    backgroundColor: 'rgba(45,108,223,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.attendify.secondary,
  },
  infoText: {
    fontSize: 13,
    color: Colors.attendify.primary,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.attendify.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
