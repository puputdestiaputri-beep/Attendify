import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import {
  Calendar, Clock, MapPin, User, BookOpen,
  ChevronRight, ArrowLeft, RefreshCw, BarChart3,
  Users, CheckCircle2
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const DAYS = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];

export default function AdminJadwalScreen() {
  const navigation = useNavigation<any>();
  const [activeDay, setActiveDay] = useState('senin');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/jadwal`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.status === 'success') {
        setSchedules(result.data);
      }
    } catch (err) {
      console.error('Fetch jadwal error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredSchedules = schedules.filter(s => s.hari.toLowerCase() === activeDay);

  const ScheduleCard = ({ item }: { item: any }) => {
    const attendanceRate = item.total_students > 0 
      ? Math.round((item.attended_count / item.total_students) * 100) 
      : 0;

    return (
      <BlurView intensity={20} tint="dark" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <BookOpen size={20} color={Colors.ai.primary} />
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.classText}>{item.class_name}</Text>
          </View>
          <View style={styles.timeBadge}>
            <Clock size={12} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timeText}>{item.jam_mulai.substring(0, 5)}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <User size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.detailText} numberOfLines={1}>{item.dosen_name}</Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={14} color="rgba(255,255,255,0.4)" />
            <Text style={styles.detailText}>{item.ruang}</Text>
          </View>
        </View>

        <View style={styles.recapContainer}>
          <View style={styles.recapHeader}>
            <View style={styles.recapTitleRow}>
              <BarChart3 size={14} color={Colors.ai.secondary} />
              <Text style={styles.recapTitle}>Rekap Absensi Hari Ini</Text>
            </View>
            <Text style={styles.attendancePercent}>{attendanceRate}%</Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${attendanceRate}%` }]} />
          </View>

          <View style={styles.recapFooter}>
            <View style={styles.statBox}>
              <Users size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.statLabel}>Total: {item.total_students}</Text>
            </View>
            <View style={styles.statBox}>
              <CheckCircle2 size={12} color="#34D399" />
              <Text style={[styles.statLabel, { color: '#34D399' }]}>Hadir: {item.attended_count}</Text>
            </View>
          </View>
        </View>
      </BlurView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Jadwal Perkuliahan</Text>
            <Text style={styles.headerSubtitle}>Monitor class activities and attendance</Text>
          </View>
          <TouchableOpacity 
            onPress={fetchSchedules} 
            disabled={isLoading}
            style={styles.refreshButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <RefreshCw size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setActiveDay(day)}
                style={[
                  styles.dayTab,
                  activeDay === day && styles.dayTabActive
                ]}
              >
                <Text style={[
                  styles.dayTabText,
                  activeDay === day && styles.dayTabTextActive
                ]}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                {activeDay === day && <View style={styles.activeDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading && schedules.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.ai.primary} />
            <Text style={styles.loadingText}>Loading schedules...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((item) => (
                <ScheduleCard key={item.id} item={item} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Calendar size={64} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>Tidak ada jadwal untuk hari {activeDay}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 79, 168, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelectorContainer: {
    marginBottom: 20,
  },
  dayScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayTabActive: {
    backgroundColor: 'rgba(30, 79, 168, 0.3)',
    borderColor: Colors.ai.primary,
  },
  dayTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    fontSize: 14,
  },
  dayTabTextActive: {
    color: '#fff',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.ai.primary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 79, 168, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleInfo: {
    flex: 1,
  },
  subjectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  classText: {
    color: Colors.ai.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  recapContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: 16,
  },
  recapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recapTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recapTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  attendancePercent: {
    color: Colors.ai.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.ai.secondary,
    borderRadius: 3,
  },
  recapFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 16,
    fontSize: 15,
  }
});
