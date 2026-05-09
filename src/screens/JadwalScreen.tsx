import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { MapPin, Clock, Calendar, BookOpen, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { AttendanceChart } from '../components/AttendanceChart';
import AnimatedBackground from '../components/ui/AnimatedBackground';

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
  const { tokens, isLightTheme } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Finished': return { bg: 'rgba(156, 163, 175, 0.15)', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.3)' };
      case 'Ongoing':  return { bg: 'rgba(34, 197, 94, 0.15)',  text: '#16a34a', border: 'rgba(34, 197, 94, 0.4)' };
      case 'Upcoming': return { bg: 'rgba(234, 179, 8, 0.15)',  text: '#d97706', border: 'rgba(234, 179, 8, 0.4)' };
      default:         return { bg: tokens.cardBg, text: tokens.textColor, border: tokens.borderColor };
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <AnimatedBackground style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={[styles.iconBtn, { backgroundColor: tokens.iconButtonBg, borderColor: tokens.borderColor }]}>
            <Calendar color={tokens.textColor} size={22} />
          </View>
          <View>
            <Text style={[styles.title, { color: tokens.textColor }]}>Jadwal Kuliah</Text>
            <Text style={[styles.subtitle, { color: tokens.subTextColor }]}>
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
              <BlurView
                intensity={20}
                tint={isLightTheme ? 'light' : 'dark'}
                style={[styles.card, { borderColor: tokens.borderColor }]}
              >
                {/* Left indicator bar */}
                <View style={styles.cardIndicator} />
                
                <View style={styles.cardMain}>
                  {/* Header Row */}
                  <View style={styles.cardHeader}>
                    <View style={styles.subjectRow}>
                      <View style={[styles.iconContainer, { backgroundColor: isLightTheme ? 'rgba(59,130,246,0.12)' : 'rgba(45,108,223,0.15)' }]}>
                        <BookOpen color={Colors.ai.primary} size={20} />
                      </View>
                      <Text style={[styles.subject, { color: tokens.textColor }]} numberOfLines={1}>
                        {item.subject}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                      <View style={[styles.dot, { backgroundColor: statusStyle.text }]} />
                      <Text style={[styles.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
                    </View>
                  </View>

                  {/* Lecturer */}
                  <Text style={[styles.lecturer, { color: tokens.subTextColor }]}>{item.lecturer}</Text>
                  
                  <View style={[styles.divider, { backgroundColor: tokens.borderColor }]} />
                  
                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View style={styles.infoCol}>
                      <View style={styles.infoRow}>
                        <Clock size={14} color={tokens.subTextColor} />
                        <Text style={[styles.infoText, { color: tokens.subTextColor }]}>{item.time}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <MapPin size={14} color={tokens.subTextColor} />
                        <Text style={[styles.infoText, { color: tokens.subTextColor }]}>{item.room}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.detailBtn, { backgroundColor: tokens.cardBg, borderWidth: 1, borderColor: tokens.borderColor }]}
                      onPress={() => toggleExpand(item.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp color={tokens.subTextColor} size={20} />
                      ) : (
                        <ChevronDown color={tokens.subTextColor} size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>

              {isExpanded && (
                <BlurView
                  intensity={20}
                  tint={isLightTheme ? 'light' : 'dark'}
                  style={[styles.expandedCard, { borderColor: tokens.borderColor }]}
                >
                  <AttendanceChart
                    data={[{
                      subject: item.subject,
                      attendance: item.attendance,
                      total: item.total,
                      attended: item.attended,
                    }]}
                    title={`Grafik Absensi ${item.subject}`}
                    showLegend={false}
                  />
                </BlurView>
              )}
            </View>
          );
        })}
      </ScrollView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  card: {
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardIndicator: {
    width: 6,
    backgroundColor: Colors.ai.primary,
    opacity: 0.7,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  subject: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
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
    marginLeft: 46,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    marginBottom: 14,
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
    fontSize: 13,
    fontWeight: '500',
  },
  detailBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedCard: {
    borderRadius: 20,
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 16,
    marginTop: -8,
    borderWidth: 1,
    padding: 20,
  },
});
