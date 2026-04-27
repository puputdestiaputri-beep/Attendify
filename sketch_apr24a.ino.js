import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Poll every 2 seconds for a new image
  useEffect(() => {
    setLoading(true);
    const interval = setInterval(() => {
      setImage(`http://10.61.4.131/capture?${Date.now()}`);
      setLoading(false);
    }, 2000);

    // Initial fetch
    setImage(`http://10.61.4.131/capture?${Date.now()}`);
    setLoading(false);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ marginTop: 50, alignItems: 'center' }}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: 300, height: 300, marginTop: 20 }}
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
