import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Dimensions, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Mail, Lock, User, Phone, Book, ArrowLeft, Check, Loader } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface CreateAccountScreenProps {
  navigation: any;
}

export default function CreateAccountScreen({ navigation }: CreateAccountScreenProps) {
  const { login } = useAuth();
  const [role, setRole] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
  const [formData, setFormData] = useState({
    fullName: '',
    identifier: '',
    email: '',
    phone: '',
    prodi: '',
    kelas: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    }

    if (!formData.identifier.trim()) {
      newErrors.identifier = role === 'mahasiswa' ? 'NIM harus diisi' : 'NIP harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^\d{10,12}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Nomor telepon tidak valid (10-12 digit)';
    }

    if (role === 'mahasiswa') {
      if (!formData.prodi.trim()) {
        newErrors.prodi = 'Program studi harus diisi';
      }
      if (!formData.kelas.trim()) {
        newErrors.kelas = 'Kelas harus diisi';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Account created:', { ...formData, role });
      
      login(role, {
        fullName: formData.fullName,
        prodi: formData.prodi,
        kelas: formData.kelas,
      });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Gagal membuat akun. Coba lagi.',
      }));
    } finally {
      setIsLoading(false);
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
        {/* Header with Back Button */}
        <View style={styles.headerSection}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🤖</Text>
          </View>
          <Text style={styles.brandName}>ATTENDIFY</Text>
          <Text style={styles.subtitle}>Create Account</Text>
        </View>

        {/* Main Card Container */}
        <View style={styles.cardContainer}>
          {/* Role Selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'mahasiswa' && styles.roleTabActive]}
              onPress={() => setRole('mahasiswa')}
            >
              <User
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
              <UserPlus
                size={18}
                color={role === 'dosen' ? Colors.attendify.primary : Colors.attendify.onSurface}
              />
              <Text style={[styles.roleTabText, role === 'dosen' && styles.roleTabTextActive]}>
                Dosen
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {errors.general && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>❌ {errors.general}</Text>
            </View>
          )}

          {/* Input Fields */}
          <View style={styles.inputWrapper}>
            {/* Full Name */}
            <View style={[styles.inputContainer, errors.fullName && styles.inputContainerError]}>
              <User size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nama Lengkap"
                placeholderTextColor={Colors.attendify.neutral}
                value={formData.fullName}
                onChangeText={(text) => updateFormData('fullName', text)}
                editable={!isLoading}
              />
            </View>
            {errors.fullName && <Text style={styles.errorMsg}>{errors.fullName}</Text>}

            {/* NIM/NIP */}
            <View style={[styles.inputContainer, errors.identifier && styles.inputContainerError]}>
              <Book size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={role === 'mahasiswa' ? 'NIM' : 'NIP'}
                placeholderTextColor={Colors.attendify.neutral}
                value={formData.identifier}
                onChangeText={(text) => updateFormData('identifier', text)}
                editable={!isLoading}
              />
            </View>
            {errors.identifier && <Text style={styles.errorMsg}>{errors.identifier}</Text>}

            {/* Email */}
            <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
              <Mail size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.attendify.neutral}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {errors.email && <Text style={styles.errorMsg}>{errors.email}</Text>}

            {/* Phone */}
            <View style={[styles.inputContainer, errors.phone && styles.inputContainerError]}>
              <Phone size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nomor Telepon"
                placeholderTextColor={Colors.attendify.neutral}
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
            {errors.phone && <Text style={styles.errorMsg}>{errors.phone}</Text>}

            {/* Program Studi (Mahasiswa only) */}
            {role === 'mahasiswa' && (
              <>
                <View style={[styles.inputContainer, errors.prodi && styles.inputContainerError]}>
                  <Book size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Program Studi"
                    placeholderTextColor={Colors.attendify.neutral}
                    value={formData.prodi}
                    onChangeText={(text) => updateFormData('prodi', text)}
                    editable={!isLoading}
                  />
                </View>
                {errors.prodi && <Text style={styles.errorMsg}>{errors.prodi}</Text>}
              </>
            )}

            {/* Kelas (Mahasiswa only) */}
            {role === 'mahasiswa' && (
              <>
                <View style={[styles.inputContainer, errors.kelas && styles.inputContainerError]}>
                  <Book size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Kelas"
                    placeholderTextColor={Colors.attendify.neutral}
                    value={formData.kelas}
                    onChangeText={(text) => updateFormData('kelas', text)}
                    editable={!isLoading}
                  />
                </View>
                {errors.kelas && <Text style={styles.errorMsg}>{errors.kelas}</Text>}
              </>
            )}

            {/* Password */}
            <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
              <Lock size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.attendify.neutral}
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{showPassword ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorMsg}>{errors.password}</Text>}

            {/* Confirm Password */}
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputContainerError]}>
              <Lock size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Konfirmasi Password"
                placeholderTextColor={Colors.attendify.neutral}
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorMsg}>{errors.confirmPassword}</Text>}
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.createButton, isLoading && styles.createButtonLoading]}
            onPress={handleCreateAccount}
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
                <>
                  <Text style={styles.createButtonText}>Create Account</Text>
                  <Check size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms & Conditions */}
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
          </Text>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    marginBottom: 20,
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
  errorBox: {
    backgroundColor: '#ffe5e5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: Colors.attendify.error,
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.attendify.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(30, 79, 168, 0.2)',
    marginBottom: 6,
    paddingHorizontal: 16,
    height: 52,
  },
  inputContainerError: {
    borderColor: Colors.attendify.error,
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
  errorMsg: {
    color: Colors.attendify.error,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 16,
    fontWeight: '500',
  },
  createButton: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  createButtonLoading: {
    opacity: 0.7,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 13,
    color: Colors.attendify.neutral,
    textAlign: 'center',
    marginBottom: 16,
  },
  termsLink: {
    color: Colors.attendify.secondary,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    color: Colors.attendify.neutral,
    fontSize: 14,
  },
  signInLink: {
    color: Colors.attendify.secondary,
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
