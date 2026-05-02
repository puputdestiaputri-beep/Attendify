import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Platform, Dimensions, ScrollView, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, Users, User, MessageCircle, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { DesignSystem } from '../../constants/DesignSystem';
import { API_URL } from '../../constants/Config';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import AnimatedCard from '../components/ui/AnimatedCard';
import AnimatedBackground from '../components/ui/AnimatedBackground';

import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAuthToken } from '../services/authService';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const [role, setRole] = useState<'mahasiswa' | 'dosen' | 'admin'>('mahasiswa');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered credentials on mount
  React.useEffect(() => {
    const loadRemembered = async () => {
      try {
        const savedIdentifier = await AsyncStorage.getItem('@remembered_identifier');
        const savedRole = await AsyncStorage.getItem('@remembered_role');
        if (savedIdentifier) {
          setIdentifier(savedIdentifier);
          setRememberMe(true);
          if (savedRole) {
            setRole(savedRole as any);
          }
        }
      } catch (e) {
        console.error('Error loading remembered credentials', e);
      }
    };
    loadRemembered();
  }, []);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      // Use the custom modal on native platforms
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertVisible(true);
    }
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };


  const handleLogin = async () => {
    if (!identifier.trim()) {
      showAlert('Perhatian', 'Silakan masukkan NIM, NIP, atau Email Anda.');
      return;
    }

    if (!password.trim()) {
      showAlert('Perhatian', 'Silakan masukkan password.');
      return;
    }

    setIsLoading(true);
    try {
      // Use centralized API_URL
      // Use centralized API_URL from Config.ts

      console.log('Attempting login via backend:', `${API_URL}/login`);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: identifier.trim(), // Backend handles this as email or username
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const { user: userData, token } = result.data;
        console.log('Login result user data:', JSON.stringify(userData));
        
        // Save token for future API calls
        await saveAuthToken(token);

        // Gunakan foto_profil dari server (sudah tersimpan di database)
        const serverAvatar = userData.foto_profil || null;
        if (serverAvatar) {
          console.log('🖼️ Avatar loaded from server for:', userData.email);
        }
        
        login(userData.role, {
          fullName: userData.name,
          email: userData.email,
          nim: userData.username || (role === 'mahasiswa' ? identifier : undefined),
          prodi: userData.prodi,
          kelas: userData.kelas,
          phone: userData.phone,
          avatar: serverAvatar || undefined,
        });

        // Handle Remember Me
        if (rememberMe) {
          await AsyncStorage.setItem('@remembered_identifier', identifier.trim());
          await AsyncStorage.setItem('@remembered_role', role);
        } else {
          await AsyncStorage.removeItem('@remembered_identifier');
          await AsyncStorage.removeItem('@remembered_role');
        }

        console.log('✅ Login successful via backend');
      } else {
        setIsLoading(false);
        if (response.status === 404) {
          showAlert('Belum Terdaftar', 'Akun belum terdaftar di sistem. Silakan hubungi admin.');
        } else if (response.status === 401) {
          showAlert('Gagal', 'Password salah.');
        } else {
          showAlert('Gagal', result.message || 'Terjadi kesalahan saat login.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      showAlert('Kesalahan', 'Gagal terhubung ke server. Pastikan backend berjalan dan periksa koneksi internet Anda.');
    } finally {
      // Loading state is handled in logic
    }
  };


  return (
    <AnimatedBackground style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Header */}
        <View style={styles.headerSection}>
          <Image source={require('../assets/images/logo_attendify.png')} style={{ width: 300, height: 220, marginBottom: -40 }} resizeMode="contain" />
          <Text style={styles.subtitle}>Welcome Back!</Text>
        </View>

        {/* Main Card - Glassmorphism */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.cardWrapper}
        >
          <AnimatedCard variant="glass" style={styles.mainCard}>
            {/* Role Selector - Modern Tabs */}
            <View style={styles.roleSection}>
            
              <View style={styles.roleContainer}>
                {(['mahasiswa', 'dosen', 'admin'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.roleTab,
                      role === r && styles.roleTabActive,
                    ]}
                    onPress={() => setRole(r)}
                    activeOpacity={0.8}
                  >
                    <Animated.View 
                      entering={role === r ? ZoomIn.springify() : undefined}
                    >
                      {r === 'mahasiswa' && <Users size={18} color={role === r ? '#FFF' : 'rgba(255,255,255,0.5)'} />}
                      {r === 'dosen' && <User size={18} color={role === r ? '#FFF' : 'rgba(255,255,255,0.5)'} />}
                      {r === 'admin' && <ShieldCheck size={18} color={role === r ? '#FFF' : 'rgba(255,255,255,0.5)'} />}
                    </Animated.View>
                    <Text style={[styles.roleTabText, role === r && styles.roleTabTextActive]}>
                      {r === 'mahasiswa' ? 'Mahasiswa' : r === 'dosen' ? 'Dosen' : 'Admin'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Form Inputs */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Login</Text>
              
              <AnimatedInput
                icon={Mail}
                label={role === 'mahasiswa' ? 'NIM atau Email' : role === 'dosen' ? 'NIP atau Email' : 'Username atau Email'}
                placeholder={role === 'mahasiswa' ? 'Masukkan Email' : 'Masukkan Email'}
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />

              <AnimatedInput
                icon={Lock}
                label="Password"
                placeholder="Masukkan password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
            </View>

            {/* Options Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Ingat saya</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation?.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Lupa password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Animated.View 
              entering={FadeInUp.delay(400).springify()}
            >
              <AnimatedButton
                title={isLoading ? 'Memproses...' : 'Login'}
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
              />
            </Animated.View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Belum punya akun? </Text>
              <TouchableOpacity 
                onPress={() => navigation?.navigate('CreateAccount')} 
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={styles.signupLinkContainer}>
                  <Text style={styles.signupLink}>Daftar Sekarang</Text>
                  <ArrowRight size={14} color={DesignSystem.colors.secondary} />
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        </Animated.View>

        {/* Footer Info */}
        <Animated.View 
          entering={FadeInUp.delay(600)}
          style={styles.footerInfo}
        >
          <Text style={styles.footerText}>© 2024 Attendify. Semua hak dilindungi.</Text>
        </Animated.View>
      </ScrollView>

      {/* Custom Alert Modal - Modern Style */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertVisible}
        onRequestClose={hideAlert}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={ZoomIn.springify()}
            style={styles.modalContent}
          >
            <BlurView intensity={90} style={styles.modalBlur}>
              <LinearGradient
                colors={['rgba(30, 79, 168, 0.1)', 'rgba(45, 108, 223, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>
                    {alertTitle === 'Gagal' || alertTitle === 'Belum Terdaftar' || alertTitle === 'Perhatian' ? '⚠️' : '✅'}
                  </Text>
                  <Text style={styles.modalTitle}>{alertTitle}</Text>
                </View>
                <Text style={styles.modalMessage}>{alertMessage}</Text>
                <AnimatedButton
                  title="Mengerti"
                  onPress={hideAlert}
                />
              </LinearGradient>
            </BlurView>
          </Animated.View>
        </View>
      </Modal>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: 0,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoText: {
    fontSize: 48,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginTop: -10,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  mainCard: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  roleSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: DesignSystem.colors.surfaceVariant,
    borderRadius: DesignSystem.radius.md,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: DesignSystem.radius.sm,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: DesignSystem.colors.primary,
  },
  roleTabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 12,
  },
  roleTabTextActive: {
    color: '#FFF',
  },
  formSection: {
    marginBottom: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: DesignSystem.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    backgroundColor: DesignSystem.colors.primary,
  },
  checkboxTick: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  rememberText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: DesignSystem.colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  signupText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  signupLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  signupLink: {
    color: DesignSystem.colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  footerInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
  },
  modalBlur: {
    borderRadius: DesignSystem.radius.lg,
  },
  modalGradient: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: DesignSystem.colors.glassBorder,
    borderRadius: DesignSystem.radius.lg,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
});
