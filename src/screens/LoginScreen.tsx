import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform, Dimensions, ScrollView, Modal, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, Users, User, Send, MessageCircle, Loader, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { API_URL } from '../../constants/Config';
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

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
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
      // Ambil URL backend dari environment variable
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        
        // Save token for future API calls
        await saveAuthToken(token);
        
        // Ensure role matches what user selected, or use role from backend
        // For admin, we should trust the backend role
        
        login(userData.role, {
          fullName: userData.name,
          email: userData.email,
          nim: role === 'mahasiswa' ? identifier : undefined,
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
    <LinearGradient
      colors={[Colors.attendify.primary, Colors.attendify.tertiary, Colors.attendify.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🤖</Text>
          </View>
          <Text style={styles.brandName}>ATTENDIFY</Text>
          <Text style={styles.subtitle}>Welcome back !</Text>
        </View>

        {/* Main Card Container */}
        <View style={styles.cardContainer}>
          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'mahasiswa' && styles.roleTabActive]}
              onPress={() => setRole('mahasiswa')}
            >
              <Users
                size={18}
                color={role === 'mahasiswa' ? Colors.attendify.primary : Colors.attendify.onSurface}
              />
              <Text style={[styles.roleTabText, role === 'mahasiswa' && styles.roleTabTextActive]}>
                Mahasiswa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, role === 'dosen' && styles.roleTabActive]}
              onPress={() => setRole('dosen')}
            >
              <User
                size={18}
                color={role === 'dosen' ? Colors.attendify.primary : Colors.attendify.onSurface}
              />
              <Text style={[styles.roleTabText, role === 'dosen' && styles.roleTabTextActive]}>
                Dosen
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, role === 'admin' && styles.roleTabActive]}
              onPress={() => setRole('admin')}
            >
              <ShieldCheck
                size={18}
                color={role === 'admin' ? Colors.attendify.primary : Colors.attendify.onSurface}
              />
              <Text style={[styles.roleTabText, role === 'admin' && styles.roleTabTextActive]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={role === 'mahasiswa' ? 'NIM / Email' : role === 'dosen' ? 'NIP / Email' : 'Username / Email'}
                placeholderTextColor={Colors.attendify.neutral}
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.attendify.neutral}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? (
                  <Eye size={20} color={Colors.attendify.neutral} />
                ) : (
                  <EyeOff size={20} color={Colors.attendify.neutral} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember and Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation?.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonLoading]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.attendify.primary, Colors.attendify.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <Loader size={20} color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
              <MessageCircle size={24} color={Colors.attendify.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
              <Mail size={24} color={Colors.attendify.primary} />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New user? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate('CreateAccount')} disabled={isLoading}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wave Separator */}

      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertVisible}
        onRequestClose={hideAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                {alertTitle === 'Gagal' || alertTitle === 'Belum Terdaftar' || alertTitle === 'Perhatian' ? (
                  <Text style={styles.modalIcon}>⚠️</Text>
                ) : (
                  <Text style={styles.modalIcon}>✅</Text>
                )}
              </View>
              <Text style={styles.modalTitle}>{alertTitle}</Text>
            </View>
            <Text style={styles.modalMessage}>{alertMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={hideAlert}>
              <Text style={styles.modalButtonText}>Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontSize: 48,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  cardContainer: {
    backgroundColor: Colors.attendify.surface,
    borderRadius: 30,
    marginHorizontal: 20,
    padding: 28,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.attendify.surfaceVariant,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    gap: 8,
  },
  roleTabActive: {
    backgroundColor: 'rgba(30, 79, 168, 0.1)',
  },
  roleTabText: {
    color: Colors.attendify.neutral,
    fontWeight: '500',
    fontSize: 14,
  },
  roleTabTextActive: {
    color: Colors.attendify.primary,
    fontWeight: '700',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.attendify.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(30, 79, 168, 0.2)',
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: Colors.attendify.onSurface,
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.attendify.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.attendify.primary,
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    color: Colors.attendify.neutral,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: Colors.attendify.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(11, 30, 95, 0.2)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: Colors.attendify.neutral,
    fontSize: 13,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.attendify.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(30, 79, 168, 0.2)',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: Colors.attendify.neutral,
    fontSize: 14,
  },
  signupLink: {
    color: Colors.attendify.secondary,
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  waveSeparator: {
    height: 50,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  waveContainer: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 24,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 79, 168, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.attendify.onSurface,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: Colors.attendify.neutral,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: Colors.attendify.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
