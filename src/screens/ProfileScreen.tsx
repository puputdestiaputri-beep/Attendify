import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { User, Settings, LogOut, ChevronRight, Edit3, Monitor } from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(), // ← cukup ini, navigator otomatis render Login
        },
      ]
    );
  };

  const handleDevFeature = (featureName: string) => {
    Alert.alert('Info', `Fitur ${featureName} sedang dalam tahap pengembangan.`);
  };

  return (
    <LinearGradient
      colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Profile Header ── */}
        <View style={styles.profileHeader}>
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.avatarContainer}>
            <User size={50} color="#fff" />
          </LinearGradient>
          <Text style={styles.name}>Aldi</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.role}>Mahasiswa Fasilkom</Text>
          </View>
        </View>

        {/* ── Menu Actions ── */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleDevFeature('Edit Profile')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(56,189,248,0.2)' }]}>
                <Edit3 size={20} color="#38BDF8" />
              </View>
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DosenDashboard')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
                <Monitor size={20} color="#A855F7" />
              </View>
              <Text style={styles.menuItemText}>Dashboard Dosen (Demo)</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(156,163,175,0.2)' }]}>
                <Settings size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.menuItemText}>Pengaturan</Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>

        {/* ── Logout Button – Prominent ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient
            colors={['#dc2626', '#b91c1c']}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout dari Akun</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // ── Profile Header ──────────────────────────────
  profileHeader: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  name: { fontSize: 26, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  role: { fontSize: 14, color: '#E2E8F0', fontWeight: '500' },

  // ── Menu Card ────────────────────────────────────
  menuContainer: {
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: { fontSize: 16, color: '#fff', fontWeight: '600' },

  // ── Logout Button ─────────────────────────────────
  logoutBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
