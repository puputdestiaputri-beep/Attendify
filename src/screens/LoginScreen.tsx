import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, KeyboardAvoidingView, Platform, Dimensions, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, Users, User, Send, MessageCircle, Loader, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../context/AuthContext';

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

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      let userEmail = '';
      let userName = identifier || 'User';
      let userNim = '';

      if (identifier.includes('@')) {
        userEmail = identifier;
        userName = identifier.split('@')[0];
      } else if (/^\d+$/.test(identifier) || identifier.toLowerCase().includes('nim')) {
        userNim = identifier;
        userName = 'Pengguna (NIM)';
      } else {
        userNim = identifier;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      login(role, { fullName: userName, email: userEmail, nim: userNim, prodi: 'S1 Informatika', kelas: 'A Pagi' });
    } catch (error) {
      console.error('Login error:', error);
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
            <TouchableOpacity style={styles.rememberContainer}>
              <View style={styles.checkbox} />
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
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.attendify.primary,
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
});
