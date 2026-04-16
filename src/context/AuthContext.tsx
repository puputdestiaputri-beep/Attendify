import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { performLogout, saveAuthState, loadAuthState } from '../services/authService';

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = 'mahasiswa' | 'dosen' | null;

interface UserData {
  fullName: string;
  prodi?: string;
  kelas?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: Role;
  user: UserData | null;
  login: (userRole: Role, userData: UserData) => void;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  role: null,
  user: null,
  login: () => {},
  logout: () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from AsyncStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('📂 Loading auth state from AsyncStorage...');
        const { isLoggedIn: savedIsLoggedIn, role: savedRole, userData: savedUserData } = await loadAuthState();
        
        setIsLoggedIn(savedIsLoggedIn);
        setRole(savedRole as Role);
        setUser(savedUserData);

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

  const login = (userRole: Role, userData: UserData) => {
    setRole(userRole);
    setUser(userData);
    setIsLoggedIn(true);
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
      console.log('✅ Logged out successfully');
    });
  };

  // Don't render app until auth is initialized
  if (isLoading) {
    return null; // Or show splash screen
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);
