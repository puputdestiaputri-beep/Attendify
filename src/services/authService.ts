import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Auth Storage Keys ─────────────────────────────────────────────────────────
const AUTH_STORAGE_KEYS = {
  USER_DATA: '@attendify_user_data',
  USER_ROLE: '@attendify_user_role',
  IS_LOGGED_IN: '@attendify_is_logged_in',
  AUTH_TOKEN: '@attendify_auth_token',
};

// ── Save Auth State ───────────────────────────────────────────────────────────
export const saveAuthState = async (
  isLoggedIn: boolean,
  role: string | null,
  userData: any
) => {
  try {
    const authData = {
      isLoggedIn,
      role,
      userData,
      timestamp: new Date().getTime(),
    };

    await AsyncStorage.multiSet([
      [AUTH_STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn)],
      [AUTH_STORAGE_KEYS.USER_ROLE, role || ''],
      [AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
    ]);

    console.log('💾 Auth state saved to AsyncStorage');
    return true;
  } catch (error) {
    console.error('❌ Error saving auth state:', error);
    return false;
  }
};

// ── Load Auth State ───────────────────────────────────────────────────────────
export const loadAuthState = async () => {
  try {
    const values = await AsyncStorage.multiGet([
      AUTH_STORAGE_KEYS.IS_LOGGED_IN,
      AUTH_STORAGE_KEYS.USER_ROLE,
      AUTH_STORAGE_KEYS.USER_DATA,
    ]);

    const isLoggedIn = values[0][1] ? JSON.parse(values[0][1]) : false;
    const role = values[1][1] || null;
    const userData = values[2][1] ? JSON.parse(values[2][1]) : null;

    console.log('📂 Auth state loaded from AsyncStorage:', {
      isLoggedIn,
      role,
      userData,
    });

    return { isLoggedIn, role, userData };
  } catch (error) {
    console.error('❌ Error loading auth state:', error);
    return { isLoggedIn: false, role: null, userData: null };
  }
};

// ── Clear Auth State (Logout) ─────────────────────────────────────────────────
export const clearAuthState = async () => {
  try {
    console.log('🔐 Clearing auth state...');

    // Remove all auth-related data from AsyncStorage
    await AsyncStorage.multiRemove([
      AUTH_STORAGE_KEYS.IS_LOGGED_IN,
      AUTH_STORAGE_KEYS.USER_ROLE,
      AUTH_STORAGE_KEYS.USER_DATA,
      AUTH_STORAGE_KEYS.AUTH_TOKEN,
    ]);

    console.log('✅ Auth state cleared successfully');

    // Optional: Call backend to invalidate token
    // await invalidateTokenOnBackend();

    return true;
  } catch (error) {
    console.error('❌ Error clearing auth state:', error);
    return false;
  }
};

// ── Perform Logout ────────────────────────────────────────────────────────────
export const performLogout = async (logoutCallback?: () => void) => {
  try {
    console.log('🚪 Starting logout process...');

    // Clear local storage
    const cleared = await clearAuthState();

    if (!cleared) {
      console.warn('⚠️ Warning: Some auth data may not have been cleared');
    }

    // Optional: Perform API call to backend
    // try {
    //   await fetch('http://your-api.com/api/auth/logout', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    //   console.log('📡 Logout API call successful');
    // } catch (apiError) {
    //   console.warn('⚠️ API logout failed, but local logout proceeding:', apiError);
    // }

    // Execute callback (usually the logout function from AuthContext)
    if (logoutCallback) {
      logoutCallback();
    }

    console.log('✅ Logout complete');
    return true;
  } catch (error) {
    console.error('❌ Logout failed:', error);
    return false;
  }
};

// ── Check if User is Authenticated ────────────────────────────────────────────
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const { isLoggedIn } = await loadAuthState();
    return isLoggedIn;
  } catch (error) {
    console.error('❌ Error checking authentication:', error);
    return false;
  }
};

// ── Get Stored User Data ──────────────────────────────────────────────────────
export const getStoredUserData = async () => {
  try {
    const { userData, role } = await loadAuthState();
    return { userData, role };
  } catch (error) {
    console.error('❌ Error getting stored user data:', error);
    return { userData: null, role: null };
  }
};

// ── Save Auth Token ───────────────────────────────────────────────────────────
export const saveAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, token);
    console.log('💾 Auth token saved');
    return true;
  } catch (error) {
    console.error('❌ Error saving auth token:', error);
    return false;
  }
};

// ── Get Auth Token ────────────────────────────────────────────────────────────
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.AUTH_TOKEN);
    return token;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    return null;
  }
};
