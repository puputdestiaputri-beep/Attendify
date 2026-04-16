import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { MapPin, Clock, Calendar, ChevronRight, BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { AttendanceChart } from '../components/AttendanceChart';

const { width } = Dimensions.get('window');

const SCHEDULES = [
  { 
    id: 1, 
    subject: 'Pemrograman Web', 
    time: '08:00 - 10:30', 
    room: 'Lab Komputer 1', 
    status: 'Finished', 
    lecturer: 'Dr. John Doe',
    attendance: 85,
    total: 12,
    attended: 10,
  },
  { 
    id: 2, 
    subject: 'Kecerdasan Buatan', 
    time: '13:00 - 15:30', 
    room: 'Ruang 402', 
    status: 'Ongoing', 
    lecturer: 'Prof. Jane Smith',
    attendance: 92,
    total: 12,
    attended: 11,
  },
  { 
    id: 3, 
    subject: 'Mobile Programming', 
    time: '16:00 - 18:30', 
    room: 'Lab Komputer 2', 
    status: 'Upcoming', 
    lecturer: 'Alex Morgan, M.Kom',
    attendance: 78,
    total: 12,
    attended: 9,
  },
];

interface ScheduleItem {
  id: number;
  subject: string;
  time: string;
  room: string;
  status: string;
  lecturer: string;
  attendance: number;
  total: number;
  attended: number;
}

export default function JadwalScreen() {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Finished': return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.3)' };
      case 'Ongoing': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', border: 'rgba(34, 197, 94, 0.3)' };
      case 'Upcoming': return { bg: 'rgba(234, 179, 8, 0.15)', text: '#FDE047', border: 'rgba(234, 179, 8, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.2)' };
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <LinearGradient
      colors={isDarkMode ? 
        [Colors.ai.gradientStart, Colors.ai.gradientMiddle, Colors.ai.gradientEnd] :
        ['#f0f4f8', '#e0e7ff', '#f0f4f8']
      }
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Calendar color="#fff" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#1f2937' }]}>Jadwal Kuliah</Text>
            <Text style={[styles.subtitle, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(31,41,55,0.8)' }]}>
              Senin, 13 April 2026
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SCHEDULES.map((item) => {
          const statusStyle = getStatusColor(item.status);
          const isExpanded = expandedId === item.id;

          return (
            <View key={item.id}>
              <BlurView intensity={20} tint="dark" style={styles.card}>
                <View style={styles.cardIndicator} />
                
                <View style={styles.cardMain}>
                  <View style={styles.cardHeader}>
                    <View style={styles.subjectRow}>
                      <View style={styles.iconContainer}>
                        <BookOpen color={Colors.ai.primary} size={20} />
                      </View>
                      <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                      <View style={[styles.dot, { backgroundColor: statusStyle.text }]} />
                      <Text style={[styles.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.lecturer}>{item.lecturer}</Text>
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.infoCol}>
                      <View style={styles.infoRow}>
                        <Clock size={14} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.infoText}>{item.time}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <MapPin size={14} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.infoText}>{item.room}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.detailBtn}
                      onPress={() => toggleExpand(item.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp color="rgba(255,255,255,0.4)" size={20} />
                      ) : (
                        <ChevronDown color="rgba(255,255,255,0.4)" size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>

              {isExpanded && (
                <BlurView intensity={20} tint="dark" style={styles.expandedCard}>
                  <AttendanceChart
                    data={[
                      {
                        subject: item.subject,
                        attendance: item.attendance,
                        total: item.total,
                        attended: item.attended,
                      }
                    ]}
                    title={`Grafik Absensi ${item.subject}`}
                    showLegend={false}
                  />
                </BlurView>
              )}
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardIndicator: {
    width: 6,
    backgroundColor: Colors.ai.primary,
    opacity: 0.6,
  },
  cardMain: {
    flex: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(45, 108, 223, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subject: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lecturer: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 46,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    marginLeft: 46,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 46,
  },
  infoCol: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  detailBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedCard: {
    borderRadius: 24,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopWidth: 0,
    padding: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingTop: 16,
  }
});
