import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ESP32_URL = 'http://10.61.4.131/capture';
const BACKEND_URL = 'http://10.61.4.141:5000/api';
const DEVICE_ID = 'esp32-kelas-a';
const SEND_INTERVAL = 5000; // 5 seconds

export default function ESP32CameraScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [recognitionStatus, setRecognitionStatus] = useState<string>('');

  const [imageError, setImageError] = useState(false);

  // ── Helper: Fetch image and convert to base64 ────────────
  const fetchImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // ── Helper: Send image to backend for face recognition ────
  const sendToBackend = async (imageUrl: string) => {
    const now = Date.now();

    // Rate limiting: prevent spam requests (minimum 5 seconds between requests)
    if (now - lastSentTime < SEND_INTERVAL) {
      return;
    }

    try {
      setLastSentTime(now);
      console.log(`[IoT] Sending image from ${imageUrl} to backend...`);

      // Step 1: Fetch image and convert to base64
      const base64Image = await fetchImageAsBase64(imageUrl);
      if (!base64Image) {
        console.warn('[IoT] Failed to convert image to base64');
        return;
      }

      // Step 2: Get auth token
      const token = await AsyncStorage.getItem('@attendify_auth_token');

      // Step 3: Send to backend
      const response = await fetch(`${BACKEND_URL}/iot/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          image: base64Image,
          device_id: DEVICE_ID,
          timestamp: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      console.log('[IoT] Backend response:', result);

      if (result.status === 'matched') {
        setRecognitionStatus(`✅ Recognized: ${result.name}`);
        console.log(`[IoT] Face matched: ${result.name} (ID: ${result.user_id})`);
      } else if (result.status === 'unknown') {
        setRecognitionStatus('❓ Unknown face');
        console.log('[IoT] Face not recognized');
      } else if (result.status === 'duplicate') {
        setRecognitionStatus(`ℹ️ Already scanned: ${result.name}`);
        console.log(`[IoT] User already scanned today: ${result.name}`);
      }

      // Auto-clear status message after 3 seconds
      setTimeout(() => setRecognitionStatus(''), 3000);
    } catch (error) {
      console.error('[IoT] Error sending to backend:', error);
      setRecognitionStatus('❌ Error processing');
      setTimeout(() => setRecognitionStatus(''), 3000);
    }
  };

  useEffect(() => {
    setLoading(true);
    const interval = setInterval(() => {
      const imageUrl = `${ESP32_URL}?${Date.now()}`;
      setImage(imageUrl);
      // We don't set loading to false here, we let the Image onLoadEnd do it
      // but we need to trigger it

      // Send image to backend for face recognition
      sendToBackend(imageUrl);
    }, 2000);

    // Fetch initial image
    const initialImageUrl = `${ESP32_URL}?${Date.now()}`;
    setImage(initialImageUrl);

    // Send initial image
    sendToBackend(initialImageUrl);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live ESP32 Camera - Face Recognition</Text>

      {image ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            onLoadStart={() => {
              setLoading(true);
              setImageError(false);
            }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setImageError(true);
            }}
          />
          {imageError && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorText}>Camera Offline</Text>
              <Text style={styles.errorSubText}>Check IP 10.61.4.131</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {loading && !imageError && (
        <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />
      )}

      {recognitionStatus && (
        <Text style={styles.statusText}>{recognitionStatus}</Text>
      )}

      <Text style={styles.infoText}>
        Device: {DEVICE_ID} | Interval: {SEND_INTERVAL / 1000}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginTop: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc'
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubText: {
    color: '#fff',
    fontSize: 14,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    textAlign: 'center',
    minWidth: '80%',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});
