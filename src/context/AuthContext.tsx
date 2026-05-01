import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { performLogout, saveAuthState, loadAuthState, getAuthToken } from '../services/authService';

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'mahasiswa' | 'dosen' | 'admin' | null;

interface UserData {
  fullName: string;
  email?: string;
  avatar?: string;
  nim?: string;
  prodi?: string;
  kelas?: string;
  phone?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: Role;
  user: UserData | null;
  token?: string | null;
  login: (userRole: Role, userData: UserData) => void;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  role: null,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from AsyncStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('📂 Loading auth state from AsyncStorage...');
        const { isLoggedIn: savedIsLoggedIn, role: savedRole, userData: savedUserData } = await loadAuthState();
        const savedToken = await getAuthToken();
        
        setIsLoggedIn(savedIsLoggedIn);
        setRole(savedRole as Role);
        setUser(savedUserData);
        setToken(savedToken);

        if (savedIsLoggedIn) {
          console.log('✅ User restored from storage:', savedUserData?.fullName);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userRole: Role, userData: UserData) => {
    setRole(userRole);
    setUser(userData);
    setIsLoggedIn(true);
    // Fetch token from storage if not passed
    const savedToken = await getAuthToken();
    setToken(savedToken);

    // Save to AsyncStorage
    saveAuthState(true, userRole, userData);
    console.log('✅ Login successful:', userData.fullName);
  };

  const logout = () => {
    console.log('🔐 Logging out...');
    performLogout(() => {
      setRole(null);
      setUser(null);
      setIsLoggedIn(false);
      setToken(null);
      console.log('✅ Logged out successfully');
    });
  };

  // Show branded splash during auth init instead of blank screen
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#334155']}
          style={styles.splashGradient}
        >
          <View style={styles.splashContent}>
            <Text style={styles.splashTitle}>Attendify</Text>
            <Text style={styles.splashSubtitle}>Sistem Absensi Cerdas</Text>
            <ActivityIndicator size="large" color="#3B82F6" style={styles.spinner} />
            <Text style={styles.splashLoading}>Memuat data pengguna...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
  },
  splashGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  splashLoading: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);
