
import { Platform } from 'react-native';

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    // Use localhost for web development to avoid IP address changes breaking the app
    return 'http://localhost:5000/api';
  }
  // For physical devices, use the machine's IP address where the backend is running
  return 'http://10.61.4.141:5000/api';
};

export const API_URL = getApiUrl();