/**
 * Below are the colors that are used in the app.
 * The colors are based on the AI Futuristic Theme.
 */

const tintColorLight = '#2D6CDF';
const tintColorDark = '#2D6CDF';

export const Colors = {
  light: {
    text: '#ffffff',
    background: '#0B1F3F',
    tint: tintColorLight,
    icon: '#6B46C1',
    tabIconDefault: '#8e8e93',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#0B1F3F', // Always dark
    tint: tintColorDark,
    icon: '#6B46C1',
    tabIconDefault: '#8e8e93',
    tabIconSelected: tintColorDark,
  },
  ai: {
    background: '#0B1F3F',
    gradientStart: '#0B1F3F',
    gradientMiddle: '#1E1F48',
    gradientEnd: '#2D6CDF',
    primary: '#2D6CDF',
    highlight: '#2D6CDF',
    accentGlow: '#6B46C1',
    card: 'rgba(255, 255, 255, 0.1)', // Glassmorphism
    cardBorder: 'rgba(255, 255, 255, 0.2)',
  }
};
