import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEFAULT_GRADIENT = ['#0B1E5F', '#1E4FA8', '#2D6CDF', '#6846C1', '#2D6CDF', '#1E4FA8', '#0B1E5F'];

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  themeColors: string[];
  setThemeColors: (colors: string[]) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkModeState] = useState(true);
  const [themeColors, setThemeColorsState] = useState<string[]>(DEFAULT_GRADIENT);
  const [isLoading, setIsLoading] = useState(true);

  // Load tema dari AsyncStorage saat app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme !== null) {
          setIsDarkModeState(savedTheme === 'dark');
        }
        
        const savedGradient = await AsyncStorage.getItem('@attendify_theme');
        if (savedGradient) {
          const parsed = JSON.parse(savedGradient);
          if (parsed && parsed.gradient) {
             setThemeColorsState(parsed.gradient);
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setIsDarkMode = async (isDark: boolean) => {
    try {
      setIsDarkModeState(isDark);
      await AsyncStorage.setItem('appTheme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setThemeColors = async (colors: string[]) => {
    try {
      // expand colors to 7 stops for smooth repeating animation if needed, or just use as is
      const expandedColors = colors.length < 7 ? [...colors, ...[...colors].reverse(), colors[0]].slice(0, 7) : colors;
      setThemeColorsState(expandedColors);
      await AsyncStorage.setItem('@attendify_theme', JSON.stringify({ gradient: expandedColors }));
    } catch (error) {
      console.error('Error saving gradient theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, themeColors, setThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
