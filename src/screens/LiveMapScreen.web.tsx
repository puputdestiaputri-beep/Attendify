import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, Map } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import RealtimeIndicator from '../components/ui/RealtimeIndicator';

export default function LiveMapScreen() {
  const { tokens, isLightTheme } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      {/* Floating Header */}
      <BlurView intensity={20} tint={isLightTheme ? 'light' : 'dark'} style={[styles.header, { borderColor: tokens.borderColor }]}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, { backgroundColor: tokens.iconButtonBg }]}>
            <ChevronLeft size={24} color={tokens.textColor} />
         </TouchableOpacity>
         <View>
            <Text style={[styles.headerTitle, { color: tokens.textColor }]}>Live Map</Text>
            <Text style={[styles.headerSub, { color: tokens.subTextColor }]}>Realtime Geospatial Monitor</Text>
         </View>
         <RealtimeIndicator />
      </BlurView>

      <View style={styles.centerContainer}>
        <Map size={48} color={tokens.subTextColor} style={{ marginBottom: 16 }} />
        <Text style={[styles.message, { color: tokens.textColor }]}>
          Map view is not supported on the web platform.
        </Text>
        <Text style={[styles.subMessage, { color: tokens.subTextColor }]}>
          Please use the mobile app to view the live realtime map.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSub: {
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
  }
});
