import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Fingerprint, Lock, Mail, Users, User, ArrowRight } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const [role, setRole] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Cukup panggil login(role) — AppNavigator otomatis render screen yang sesuai
    login(role);
  };

  return (
    <LinearGradient
      colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>

          {/* Header & Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Fingerprint color={Colors.ai.primary} size={48} />
            </View>
            <Text style={styles.title}>Attendify</Text>
            <Text style={styles.subtitle}>Smart Face Attendance System</Text>
          </View>

          {/* Login Form Container */}
          <BlurView intensity={20} tint="dark" style={styles.formContainer}>

            {/* Role Switcher */}
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'mahasiswa' && styles.roleButtonActive]}
                onPress={() => setRole('mahasiswa')}
              >
                <Users color={role === 'mahasiswa' ? '#fff' : 'rgba(255,255,255,0.5)'} size={20} />
                <Text style={[styles.roleText, role === 'mahasiswa' && styles.roleTextActive]}>Mahasiswa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, role === 'dosen' && styles.roleButtonActive]}
                onPress={() => setRole('dosen')}
              >
                <User color={role === 'dosen' ? '#fff' : 'rgba(255,255,255,0.5)'} size={20} />
                <Text style={[styles.roleText, role === 'dosen' && styles.roleTextActive]}>Dosen</Text>
              </TouchableOpacity>
            </View>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <Mail color="rgba(255,255,255,0.6)" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={role === 'mahasiswa' ? 'NIM / Email' : 'NIP / Email'}
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="rgba(255,255,255,0.6)" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <LinearGradient
                colors={[Colors.ai.primary, Colors.ai.accentGlow]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                <Text style={styles.loginButtonText}>Masuk</Text>
                <ArrowRight color="#fff" size={20} />
              </LinearGradient>
            </TouchableOpacity>

          </BlurView>

        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(45,108,223,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(45,108,223,0.5)',
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', letterSpacing: 1, marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  formContainer: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.ai.cardBorder,
    overflow: 'hidden',
  },
  roleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    gap: 8,
  },
  roleButtonActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  roleText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600', fontSize: 14 },
  roleTextActive: { color: '#ffffff' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#ffffff', fontSize: 16 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: Colors.ai.primary, fontSize: 14, fontWeight: '500' },
  loginButton: { height: 56, borderRadius: 16, overflow: 'hidden' },
  loginGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});
