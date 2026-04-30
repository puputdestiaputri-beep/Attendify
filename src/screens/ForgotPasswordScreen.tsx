import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Mail, Send, ArrowLeft, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { DesignSystem } from '../../constants/DesignSystem';
import AnimatedButton from '../../components/ui/AnimatedButton';
import AnimatedInput from '../components/ui/AnimatedInput';
import AnimatedCard from '../components/ui/AnimatedCard';

import { Dimensions } from 'react-native';
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
      colors={[DesignSystem.colors.neutral, '#0F3A6D', DesignSystem.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.duration(600).springify()}
          style={styles.headerSection}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#FFF" size={22} />
          </TouchableOpacity>
          
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[DesignSystem.colors.secondary, DesignSystem.colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBg}
            >
              <Lock size={40} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={styles.brandName}>RESET PASSWORD</Text>
          <Text style={styles.subtitle}>Pulihkan akses akun Anda</Text>
        </Animated.View>

        {/* Main Card */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.cardWrapper}
        >
          <AnimatedCard variant="glass" style={styles.mainCard}>
            {/* Success Message */}
            {isSent && (
              <Animated.View 
                entering={ZoomIn.springify()}
                style={styles.successAlert}
              >
                <CheckCircle size={20} color={DesignSystem.colors.success} />
                <Text style={styles.successAlertText}>Link reset telah dikirim ke email!</Text>
              </Animated.View>
            )}

            {/* Error Message */}
            {errors.general && (
              <Animated.View 
                entering={FadeInDown.springify()}
                style={styles.errorAlert}
              >
                <AlertCircle size={18} color={DesignSystem.colors.error} />
                <Text style={styles.errorAlertText}>{errors.general}</Text>
              </Animated.View>
            )}

            {/* Description */}
            <Text style={styles.descriptionText}>
              Masukkan email terdaftar Anda. Kami akan mengirimkan link untuk mereset password.
            </Text>

            {/* Email Input */}
            <AnimatedInput
              icon={Mail}
              label="Email Terdaftar"
              placeholder="Masukkan email Anda..."
              value={email}
              onChangeText={(text: string) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            {/* Info Text */}
            <Text style={styles.infoText}>
              Periksa inbox atau folder spam Anda untuk email reset password. Link akan berlaku selama 24 jam.
            </Text>

            {/* Send Button */}
            <Animated.View 
              entering={FadeInUp.delay(400).springify()}
              style={styles.buttonWrapper}
            >
              <AnimatedButton
                title={isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                onPress={handleSendReset}
                loading={isLoading}
                disabled={isLoading}
              />
            </Animated.View>

            {/* Back to Login */}
            <View style={styles.backToLoginContainer}>
              <Text style={styles.backToLoginText}>Ingat password? </Text>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <View style={styles.backToLoginLinkContainer}>
                  <Text style={styles.backToLoginLink}>Kembali ke login</Text>
                  <ArrowRight size={12} color={DesignSystem.colors.secondary} />
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        </Animated.View>
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
    paddingHorizontal: 0,
  },
  headerSection: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: DesignSystem.radius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
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
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  mainCard: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: DesignSystem.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  successAlertText: {
    flex: 1,
    color: DesignSystem.colors.success,
    fontSize: 13,
    fontWeight: '500',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: DesignSystem.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  errorAlertText: {
    flex: 1,
    color: DesignSystem.colors.error,
    fontSize: 13,
    fontWeight: '500',
  },
  descriptionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  infoText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginVertical: 20,
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginVertical: 20,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  backToLoginText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  backToLoginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backToLoginLink: {
    color: DesignSystem.colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
});
