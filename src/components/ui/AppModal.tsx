import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { X } from 'lucide-react-native';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const { width, height } = Dimensions.get('window');

export default function AppModal({ visible, onClose, title, children, icon }: AppModalProps) {
  const { tokens, isLightTheme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true })
      ]).start();
    }
  }, [visible]);

  if (!visible && (fadeAnim as any)._value === 0) return null; // Small optimization

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>
          <BlurView intensity={isLightTheme ? 70 : 40} tint={isLightTheme ? 'light' : 'dark'} style={[styles.modalContent, { backgroundColor: tokens.cardBg, borderColor: tokens.borderColor }]}>
            
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                {title && <Text style={[styles.title, { color: tokens.textColor }]}>{title}</Text>}
              </View>
              <TouchableOpacity style={[styles.closeButton, { backgroundColor: tokens.iconButtonBg }]} onPress={onClose}>
                <X size={20} color={tokens.textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              {children}
            </View>

          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(150,150,150,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 20,
  }
});
