import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { User, Settings, LogOut, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();

  const userName = user?.fullName || 'Mahasiswa';
  const userProdi = user?.prodi || '-';
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);

              await logout();

              // 🔥 Pindah ke LoginScreen & reset stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });

            } catch (error) {
              console.log('Logout error:', error);
            }
          },
        },
      ]
    );
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
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.avatarContainer}>
            <User size={50} color="#fff" />
          </LinearGradient>

          <Text style={styles.name}>{userName}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.role}>Mahasiswa {userProdi}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(156,163,175,0.2)' }]}>
                <Settings size={20} color="#9CA3AF" />
              </View>
              <Text style={styles.menuItemText}>
                Pengaturan
              </Text>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
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
});