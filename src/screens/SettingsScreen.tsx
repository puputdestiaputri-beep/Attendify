import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Bell, Moon, UserCog, ChevronLeft, ChevronRight, Shield, Info, HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { isDarkMode } = useTheme();

  const handleDevFeature = (name: string) => {
    Alert.alert('Info', `Fitur ${name} akan tersedia pada versi pembaruan mendatang.`);
  };

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd] :
        ['#f0f4f8', '#e0e7ff', '#f0f4f8']
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#1f2937' }]}>Pengaturan</Text>
        <TouchableOpacity onPress={() => handleDevFeature('Pusat Bantuan')}>
           <HelpCircle size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Keamanan & Akun</Text>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <TouchableOpacity 
               style={styles.settingItem}
               onPress={() => navigation.navigate('ProfileDetails')}
            >
              <View style={styles.settingItemLeft}>
                 <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                   <UserCog size={20} color="#38BDF8" />
                 </View>
                 <Text style={styles.settingItemText}>Detail Profil</Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            <TouchableOpacity 
               style={[styles.settingItem, styles.noBorder]}
               onPress={() => navigation.navigate('PrivacySecurity')}
            >
              <View style={styles.settingItemLeft}>
                 <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                   <Shield size={20} color="#10B981" />
                 </View>
                 <Text style={styles.settingItemText}>Privasi & Keamanan</Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          </BlurView>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Lainnya</Text>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <TouchableOpacity 
               style={[styles.settingItem, styles.noBorder]}
               onPress={() => navigation.navigate('AboutAttendify')}
            >
              <View style={styles.settingItemLeft}>
                 <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                   <Info size={20} color="rgba(255, 255, 255, 0.6)" />
                 </View>
                 <Text style={styles.settingItemText}>Tentang Attendify</Text>
              </View>
              <Text style={styles.versionText}>v1.0.4</Text>
            </TouchableOpacity>
          </BlurView>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.copyright}>© 2026 SmartFace System. All rights reserved.</Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    paddingHorizontal: 24, 
    paddingBottom: 24 
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', letterSpacing: 0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
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
    overflow: 'hidden' 
  },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.05)' 
  },
  noBorder: { borderBottomWidth: 0 },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  settingItemText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  versionText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' },
  copyright: { 
    textAlign: 'center', 
    color: 'rgba(255,255,255,0.2)', 
    fontSize: 12, 
    marginTop: 10,
    marginBottom: 40
  },
  logoutBtn: { 
    marginTop: 32, 
    marginBottom: 24, 
    height: 56, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  logoutGradient: { 
    flex: 1, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 8 
  },
  logoutText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
