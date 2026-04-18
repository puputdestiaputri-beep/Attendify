import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Shield, Lock, CheckCircle2, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';

export default function PrivacySecurityScreen() {
  const navigation = useNavigation<any>();

  const features = [
    { icon: '🔐', title: 'Enkripsi Data', description: 'Data Anda terenkripsi end-to-end' },
    { icon: '👤', title: 'Autentikasi Wajah', description: 'Keamanan biometrik canggih' },
    { icon: '🛡️', title: 'Keamanan Akun', description: 'Perlindungan lapisan ganda' },
  ];

  return (
    <LinearGradient
      colors={[Colors.attendify.primary, Colors.attendify.tertiary, Colors.attendify.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privasi & Keamanan</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.shieldIcon}>
            <Shield size={60} color="#fff" strokeWidth={1.5} />
          </View>
        </View>

        {/* Main Card */}
        <View style={styles.cardContainer}>
          {/* Title */}
          <Text style={styles.cardTitle}>Fitur Segera Hadir 🔒</Text>

          {/* Description */}
          <Text style={styles.description}>
            Kami sedang menyiapkan sistem keamanan terbaik untuk melindungi data Anda.
          </Text>

          {/* Features List */}
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>✨ Coming Soon</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Kembali</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
            <LinearGradient
              colors={[Colors.attendify.primary, Colors.attendify.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Bell size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Beritahu Saya</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  shieldIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardContainer: {
    marginHorizontal: 20,
    backgroundColor: Colors.attendify.surface,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.attendify.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: Colors.attendify.neutral,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,30,95,0.1)',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.attendify.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.attendify.neutral,
    lineHeight: 18,
  },
  statusBadge: {
    backgroundColor: 'rgba(45, 108, 223, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.attendify.secondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
