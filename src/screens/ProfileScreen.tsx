import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Modal, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { User, Settings, LogOut, ChevronRight, CreditCard, BookOpen, GraduationCap, Phone, Mail, ShieldCheck, Shield, UserCheck, Key, Edit3, IdCard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout, user, role, login } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();

  // Refresh profile data from server on mount
  useEffect(() => {
    const refreshProfile = async () => {
      try {
        const token = await getAuthToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
        if (result.status === 'success' && role) {
          const userData = result.data;
          // Sync with AuthContext
          login(role, {
            fullName: userData.name,
            email: userData.email,
            nim: userData.username || user?.nim,
            prodi: userData.prodi,
            kelas: userData.kelas,
            phone: userData.phone,
            avatar: userData.foto_profil || undefined,
          });
          console.log('🔄 Profile synced from server');
        }
      } catch (error) {
        console.error('❌ Failed to refresh profile:', error);
      }
    };

    refreshProfile();
  }, []);

  const userName = user?.fullName || 'User';
  const roleLabel = role === 'dosen' ? 'Dosen' : role === 'admin' ? 'Administrator' : 'Mahasiswa';
  const userProdi = user?.prodi || (role === 'mahasiswa' ? 'S1 Informatika' : '');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    try {
      setIsLoggingOut(true);
      setShowLogoutModal(false);
      logout();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const handleDevFeature = (featureName: string) => {
    Alert.alert('Info', `Fitur ${featureName} sedang dalam tahap pengembangan.`);
  };

  return (
    <AnimatedBackground style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarContainer} />
          ) : (
            <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.avatarContainer}>
              <User size={50} color="#fff" />
            </LinearGradient>
          )}

          <Text style={styles.name}>{userName}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.role}>{roleLabel} {userProdi && role !== 'admin' ? `- ${userProdi}` : ''}</Text>
          </View>
        </View>

        {/* Menu */}
          {/* Menu - 3 Card Layout */}
        <View style={styles.menuWrapper}>
          
          {/* ── CARD 1: Identitas ── */}
          <Text style={styles.cardTitle}>Identitas Akun</Text>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            {/* NIM / NIP / Admin ID */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                  <IdCard size={20} color="#60A5FA" />
                </View>
                <View>
                  <Text style={styles.menuItemLabel}>{role === 'mahasiswa' ? 'NIM' : role === 'dosen' ? 'NIP' : 'Admin ID'}</Text>
                  <Text style={styles.menuItemValue}>{user?.nim || (role === 'admin' ? 'ADM-2024-001' : '-')}</Text>
                </View>
              </View>
            </View>

            {/* Role Display */}
            <View style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                  <Shield size={20} color="#34D399" />
                </View>
                <View>
                  <Text style={styles.menuItemLabel}>Status Akun</Text>
                  <Text style={styles.menuItemValue}>{roleLabel}</Text>
                </View>
              </View>
            </View>
          </BlurView>

          {/* ── CARD 2: Detail Informasi ── */}
          <Text style={styles.cardTitle}>{role === 'mahasiswa' ? 'Data Akademik' : 'Informasi Kontak'}</Text>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            {role === 'mahasiswa' ? (
              <>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                      <BookOpen size={20} color="#A78BFA" />
                    </View>
                    <View>
                      <Text style={styles.menuItemLabel}>Program Studi</Text>
                      <Text style={styles.menuItemValue}>{userProdi || '-'}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                      <GraduationCap size={20} color="#FBBF24" />
                    </View>
                    <View>
                      <Text style={styles.menuItemLabel}>Kelas</Text>
                      <Text style={styles.menuItemValue}>{user?.kelas || '-'}</Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                      <Mail size={20} color="#A78BFA" />
                    </View>
                    <View>
                      <Text style={styles.menuItemLabel}>Email Terdaftar</Text>
                      <Text style={styles.menuItemValue}>{user?.email || '-'}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                      <Phone size={20} color="#FBBF24" />
                    </View>
                    <View>
                      <Text style={styles.menuItemLabel}>Nomor Telepon</Text>
                      <Text style={styles.menuItemValue}>{user?.phone || '-'}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </BlurView>

          {/* ── CARD 3: Pengaturan & Aksi ── */}
          <Text style={styles.cardTitle}>Pengaturan & Akun</Text>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            {/* Edit Profile */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProfileDetails')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                  <Edit3 size={20} color="#60A5FA" />
                </View>
                <Text style={styles.menuItemText}>Ubah Profil</Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity 
              style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }]}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(156,163,175,0.15)' }]}>
                  <Settings size={20} color="#9CA3AF" />
                </View>
                <Text style={styles.menuItemText}>Pengaturan Aplikasi</Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </BlurView>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient
            colors={['#dc2626', '#b91c1c']}
            style={styles.logoutGradient}
          >
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout dari Akun</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <LogOut size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>Konfirmasi Logout</Text>
            <Text style={styles.modalMessage}>Apakah Anda yakin ingin keluar dari akun Anda?</Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalBtnCancel} 
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalBtnLogout} 
                onPress={confirmLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.modalBtnLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  profileHeader: { alignItems: 'center', marginBottom: 40 },

  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  name: { fontSize: 26, fontWeight: 'bold', color: '#fff' },

  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },

  role: { fontSize: 14, color: '#E2E8F0' },

  menuWrapper: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
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
  menuItemText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  menuItemLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItemValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  logoutBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 10,
  },

  logoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 17,
    gap: 10,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 26,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalBtnLogout: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalBtnLogoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});