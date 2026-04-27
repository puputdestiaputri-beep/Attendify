import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function ESP32CameraScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const interval = setInterval(() => {
      setImage(`http://10.61.4.131/capture?${Date.now()}`);
      setLoading(false);
    }, 2000);

    setImage(`http://10.61.4.131/capture?${Date.now()}`);
    setLoading(false);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live ESP32 Camera</Text>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
      {loading && <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  image: { width: 300, height: 300, marginTop: 20, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
});
