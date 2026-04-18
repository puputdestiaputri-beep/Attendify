import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Modal, 
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Send, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api';

interface ReportIssueModalProps {
  visible: boolean;
  onClose: () => void;
  adminId?: number; // Target admin ID
}

export default function ReportIssueModal({ visible, onClose, adminId = 1 }: ReportIssueModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!title || !message) {
      Alert.alert('Error', 'Harap isi judul dan pesan laporan');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('@attendify_auth_token');
      const response = await fetch(`${API_URL}/notifikasi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: adminId,
          title: `LAPORAN: ${title}`,
          message: message,
          type: 'informasi'
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setTitle('');
          setMessage('');
          onClose();
        }, 2000);
      } else {
        Alert.alert('Error', result.message || 'Gagal mengirim laporan');
      }
    } catch (err) {
      Alert.alert('Error', 'Koneksi ke server gagal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.gradientCard}
            >
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <AlertTriangle size={20} color="#FBBF24" />
                  <Text style={styles.title}>Laporkan Masalah</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>

              {isSuccess ? (
                <View style={styles.successContainer}>
                  <CheckCircle2 size={48} color="#34D399" />
                  <Text style={styles.successText}>Laporan Terkirim!</Text>
                  <Text style={styles.successSubtext}>Admin akan segera meninjau pesan Anda.</Text>
                </View>
              ) : (
                <View style={styles.form}>
                  <Text style={styles.label}>Judul Laporan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Kamera Rusak, Jadwal Salah"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={title}
                    onChangeText={setTitle}
                  />

                  <Text style={styles.label}>Pesan / Detail</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Jelaskan masalah yang Anda alami..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline={true}
                    numberOfLines={4}
                    value={message}
                    onChangeText={setMessage}
                  />

                  <TouchableOpacity 
                    style={styles.submitBtn} 
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[Colors.ai.primary, Colors.ai.accentGlow]}
                      style={styles.submitGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Send size={18} color="#fff" />
                          <Text style={styles.submitText}>Kirim Laporan</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </KeyboardAvoidingView>
        </BlurView>
      </View>
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
  blurContainer: {
    width: '90%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalContent: {
    borderRadius: 24,
  },
  gradientCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    gap: 16,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: -8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  successText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  successSubtext: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  }
});
