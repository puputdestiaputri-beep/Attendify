import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Bell, Moon, UserCog, ChevronLeft, ChevronRight, Shield, Info, HelpCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const navigation = useNavigation<any>();

  const handleDevFeature = (name: string) => {
    Alert.alert('Info', `Fitur ${name} akan tersedia pada versi pembaruan mendatang.`);
  };

  return (
    <LinearGradient
      colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Pengaturan</Text>
        <TouchableOpacity onPress={() => handleDevFeature('Pusat Bantuan')}>
           <HelpCircle size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Aplikasi & Tampilan</Text>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                 <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                   <Bell size={20} color="#F59E0B" />
                 </View>
                 <Text style={styles.settingItemText}>Notifikasi Real-time</Text>
              </View>
              <Switch
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#3B82F6' }}
                thumbColor="#fff"
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>

            <View style={[styles.settingItem, styles.noBorder]}>
              <View style={styles.settingItemLeft}>
                 <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                   <Moon size={20} color="#A855F7" />
                 </View>
                 <Text style={styles.settingItemText}>Mode Gelap (Otomatis)</Text>
              </View>
              <Switch
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#3B82F6' }}
                thumbColor="#fff"
                onValueChange={setDarkModeEnabled}
                value={darkModeEnabled}
              />
            </View>
          </BlurView>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Keamanan & Akun</Text>
          <BlurView intensity={20} tint="dark" style={styles.card}>
            <TouchableOpacity 
               style={styles.settingItem}
               onPress={() => handleDevFeature('Edit Profil')}
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
               onPress={() => handleDevFeature('Privasi')}
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
               onPress={() => handleDevFeature('Tentang Aplikasi')}
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

        <Text style={styles.copyright}>© 2026 SmartFace System. All rights reserved.</Text>

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
  }
});
