import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, Modal, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { User, Settings, LogOut, ChevronRight, CreditCard, BookOpen, GraduationCap, Phone, Mail, ShieldCheck, Shield, UserCheck, Key } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout, user, role } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();

  const userName = user?.fullName || 'User';
  const roleLabel = user?.role === 'dosen' ? 'Dosen' : user?.role === 'admin' ? 'Administrator' : 'Mahasiswa';
  const userProdi = user?.prodi || (user?.role === 'mahasiswa' ? 'S1 Informatika' : '');
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
    <LinearGradient
      colors={isDarkMode ? 
        [Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd] :
        ['#f0f4f8', '#e0e7ff', '#f0f4f8']
      }
      style={styles.container}
    >
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
            <Text style={styles.role}>{roleLabel} {userProdi && roleLabel !== 'Administrator' ? `- ${userProdi}` : ''}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          
          {/* ── Mahasiswa Specific Info ── */}
          {role === 'mahasiswa' && (
            <>
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                    <CreditCard size={20} color="#3B82F6" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>NIM</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>{user?.nim || '20240001'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                    <BookOpen size={20} color="#10B981" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>Program Studi</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>{userProdi || 'S1 Informatika'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                    <GraduationCap size={20} color="#F59E0B" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>Kelas</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>{user?.kelas || 'A Pagi'}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* ── Dosen Specific Info ── */}
          {role === 'dosen' && (
            <>
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                    <CreditCard size={20} color="#3B82F6" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>NIP</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>{user?.nim || '197508212005011002'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                    <Mail size={20} color="#10B981" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>Email</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>{user?.email || 'dosen@university.ac.id'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                    <Phone size={20} color="#F59E0B" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>Nomor Telepon</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>{user?.phone || '081234567890'}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* ── Admin Specific Info ── */}
          {role === 'admin' && (
            <>
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                    <Shield size={20} color="#3B82F6" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>Admin ID</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>ADM-2024-001</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
                    <UserCheck size={20} color="#10B981" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>Role</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>Super Administrator</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
                    <Key size={20} color="#F59E0B" />
                  </View>
                  <View style={{ justifyContent: 'center' }}>
                    <Text style={styles.menuItemText}>Izin Akses</Text>
                    <Text style={{color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2}}>Full System Access</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(156,163,175,0.2)' }]}>
                <Settings size={20} color="#9CA3AF" />
              </View>
              <View style={{ justifyContent: 'center' }}>
                <Text style={styles.menuItemText}>Pengaturan</Text>
              </View>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" style={{ alignSelf: 'center' }} />
          </TouchableOpacity>
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

  menuContainer: {
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderRadius: 24,
    marginBottom: 20,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

  menuItemText: { color: '#fff' },

  settingsGroup: { marginBottom: 32 },
  groupTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: 'rgba(255,255,255,0.4)', 
    marginBottom: 16, 
    marginLeft: 4, 
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  card: { 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.4)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemText: { 
    fontSize: 16, 
    color: '#fff',
    fontWeight: '500',
  },

  logoutBtn: {
    borderRadius: 18,
    overflow: 'hidden',
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
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    color: '#1F2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
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
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalBtnLogout: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  modalBtnLogoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});