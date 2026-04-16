import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Dimensions, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, Send, Loader } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

interface ForgotPasswordScreenProps {
  navigation: any;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendReset = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Reset password sent to:', email);
      setIsSent(true);
      
      setTimeout(() => {
        Alert.alert(
          'Berhasil',
          'Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.',
          [
            {
              text: 'Kembali ke Login',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Gagal mengirim link reset. Coba lagi.',
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Lock size={48} color="#fff" />
          </View>
          <Text style={styles.brandName}>ATTENDIFY</Text>
          <Text style={styles.subtitle}>Reset Password</Text>
        </View>

        {/* Main Card Container */}
        <View style={styles.cardContainer}>
          {/* Error Message */}
          {errors.general && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>❌ {errors.general}</Text>
            </View>
          )}

          {/* Success Message */}
          {isSent && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Link telah dikirim ke email Anda!</Text>
            </View>
          )}

          {/* Description */}
          <Text style={styles.descriptionText}>
            Masukkan email Anda dan kami akan mengirimkan link untuk mereset password Anda.
          </Text>

          {/* Email Input */}
          <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
            <Mail size={20} color={Colors.attendify.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda"
              placeholderTextColor={Colors.attendify.neutral}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.email && <Text style={styles.errorMsg}>{errors.email}</Text>}

          {/* Info Text */}
          <Text style={styles.infoText}>
            Kami akan mengirimkan link reset password ke email Anda. Silakan ikuti instruksi untuk membuat password baru.
          </Text>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.sendButtonLoading]}
            onPress={handleSendReset}
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
                  <Text style={styles.sendButtonText}>Send Reset Link</Text>
                  <Send size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Remember password? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
              <Text style={styles.backToLoginLink}>Back to Login</Text>
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
  errorBox: {
    backgroundColor: '#ffe5e5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    color: Colors.attendify.error,
    fontSize: 14,
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#e5ffe5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccffcc',
  },
  successText: {
    color: Colors.attendify.success,
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionText: {
    color: Colors.attendify.neutral,
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
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
  errorMsg: {
    color: Colors.attendify.error,
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  infoText: {
    color: Colors.attendify.neutral,
    fontSize: 12,
    marginVertical: 20,
    lineHeight: 18,
    textAlign: 'center',
  },
  sendButton: {
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  sendButtonLoading: {
    opacity: 0.7,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    color: Colors.attendify.neutral,
    fontSize: 14,
  },
  backToLoginLink: {
    color: Colors.attendify.secondary,
    fontWeight: 'bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
