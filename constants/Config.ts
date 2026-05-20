
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${hostname}:5000/api`;
  }
  
  // Dynamic resolution for Expo Go physical devices
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const localhost = debuggerHost.split(':')[0];
    return `http://${localhost}:5000/api`;
  }

  // Fallback for built standalone apps or cases where hostUri fails
  return 'http://10.61.4.23:5000/api';
};

export const API_URL = getApiUrl();