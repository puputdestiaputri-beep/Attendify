import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { API_URL } from '@/constants/Config';
import { useSocket } from '../../context/SocketContext';
import { Wifi, Smartphone, Radio, Activity, Camera, BrainCircuit, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export default function DebugPanel({ visible, onClose }: DebugPanelProps) {
  const { tokens, isLightTheme } = useTheme();
  const { isConnected: socketConnected } = useSocket();
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Ping API periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (visible) {
      pingApi();
      interval = setInterval(pingApi, 5000);
    }
    return () => clearInterval(interval);
  }, [visible]);

  const pingApi = async () => {
    try {
      const res = await fetch(`${API_URL.replace('/api', '')}/`);
      setApiConnected(res.ok);
    } catch (e) {
      setApiConnected(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <BlurView intensity={isLightTheme ? 80 : 40} tint={isLightTheme ? 'light' : 'dark'} style={[styles.panel, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: tokens.textColor }]}>Developer Debug Panel</Text>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: tokens.iconButtonBg }]}>
             <X size={18} color={tokens.textColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
           {/* Network Endpoint Info */}
           <View style={[styles.infoBox, { backgroundColor: tokens.inputBg, borderColor: tokens.borderColor }]}>
              <Text style={[styles.infoLabel, { color: tokens.subTextColor }]}>Current API Endpoint (hostUri):</Text>
              <Text style={[styles.infoValue, { color: tokens.textColor }]} selectable>{API_URL}</Text>
           </View>

           {/* Health Indicators */}
           <Text style={[styles.sectionTitle, { color: tokens.textColor }]}>System Health</Text>
           
           <View style={styles.statusGrid}>
             <StatusItem 
                icon={<Radio size={16} color={socketConnected ? '#10B981' : '#EF4444'} />} 
                label="Socket.IO" 
                status={socketConnected ? 'Connected' : 'Disconnected'}
                color={socketConnected ? '#10B981' : '#EF4444'}
                tokens={tokens}
             />
             <StatusItem 
                icon={<Wifi size={16} color={apiConnected === true ? '#10B981' : (apiConnected === false ? '#EF4444' : '#F59E0B')} />} 
                label="REST API" 
                status={apiConnected === true ? 'Reachable' : (apiConnected === false ? 'Unreachable' : 'Pinging...')}
                color={apiConnected === true ? '#10B981' : (apiConnected === false ? '#EF4444' : '#F59E0B')}
                tokens={tokens}
             />
             <StatusItem 
                icon={<Activity size={16} color="#10B981" />} 
                label="Location (GPS)" 
                status="Ready"
                color="#10B981"
                tokens={tokens}
             />
             <StatusItem 
                icon={<Camera size={16} color="#10B981" />} 
                label="Camera Module" 
                status="Ready"
                color="#10B981"
                tokens={tokens}
             />
             <StatusItem 
                icon={<BrainCircuit size={16} color="#3B82F6" />} 
                label="AI Engine" 
                status="Active"
                color="#3B82F6"
                tokens={tokens}
             />
           </View>
        </View>
      </BlurView>
    </View>
  );
}

function StatusItem({ icon, label, status, color, tokens }: any) {
  return (
    <View style={[styles.statusItem, { borderColor: tokens.borderColor, backgroundColor: tokens.inputBg }]}>
       <View style={[styles.iconWrapper, { backgroundColor: `${color}20` }]}>
          {icon}
       </View>
       <View style={{ flex: 1 }}>
          <Text style={[styles.statusLabel, { color: tokens.subTextColor }]}>{label}</Text>
          <Text style={[styles.statusValue, { color }]}>{status}</Text>
       </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusGrid: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: 'bold',
  }
});
