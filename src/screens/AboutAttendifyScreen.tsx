import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Zap, Code2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';

export default function AboutAttendifyScreen() {
  const navigation = useNavigation<any>();

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
          <Text style={styles.headerTitle}>Tentang Attendify</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Zap size={50} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.appName}>ATTENDIFY</Text>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tentang Kami</Text>
          <Text style={styles.description}>
            Attendify adalah aplikasi absensi berbasis IoT dan face recognition untuk mempermudah proses kehadiran.
          </Text>

          {/* Key Features */}
          <View style={styles.featureBox}>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.iconText}>🤖</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Face Recognition</Text>
                <Text style={styles.featureDesc}>Teknologi pengenalan wajah terdepan</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.iconText}>🌐</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>IoT Integration</Text>
                <Text style={styles.featureDesc}>Koneksi IoT yang seamless dan aman</Text>
              </View>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Text style={styles.iconText}>⚡</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-time Tracking</Text>
                <Text style={styles.featureDesc}>Pelacakan kehadiran secara real-time</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoBadge}>
            <View style={styles.badgeIcon}>
              <Code2 size={20} color={Colors.attendify.primary} />
            </View>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeLabel}>Versi Aplikasi</Text>
              <Text style={styles.badgeValue}>v1.0.0</Text>
            </View>
          </View>

          <View style={styles.infoBadge}>
            <View style={styles.badgeIcon}>
              <Zap size={20} color={Colors.attendify.secondary} />
            </View>
            <View style={styles.badgeContent}>
              <Text style={styles.badgeLabel}>Developer</Text>
              <Text style={styles.badgeValue}>Attendify Team</Text>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>✨</Text>
          <Text style={styles.statusTitle}>Konten Lengkap Segera Hadir</Text>
          <Text style={styles.statusDesc}>
            Lebih banyak fitur dan informasi akan ditambahkan segera.
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButtonBottom}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient
            colors={[Colors.attendify.primary, Colors.attendify.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Kembali</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  logoSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.attendify.surface,
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.attendify.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.attendify.neutral,
    lineHeight: 22,
    marginBottom: 24,
  },
  featureBox: {
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(11,30,95,0.1)',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 14,
    marginTop: 2,
  },
  iconText: {
    fontSize: 28,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.attendify.primary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: Colors.attendify.neutral,
    lineHeight: 18,
  },
  infoCard: {
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  badgeContent: {
    flex: 1,
  },
  badgeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  statusIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 18,
  },
  backButtonBottom: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
