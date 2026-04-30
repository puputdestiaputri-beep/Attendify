export const DesignSystem = {
  colors: {
    primary: '#1E4FA8',
    secondary: '#2D6CDF',
    tertiary: '#6846C1',
    neutral: '#0B1E5F',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    surface: 'rgba(255,255,255,0.1)',
    surfaceVariant: 'rgba(255,255,255,0.05)',
    glass: 'rgba(255,255,255,0.08)',
    glassBorder: 'rgba(255,255,255,0.15)',
  },
  gradients: {
    primary: ['#1E4FA8', '#2D6CDF'],
    dashboard: ['#0F172A', '#1E293B', '#334155'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    button: {
      shadowColor: '#1E4FA8',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    }
  },
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: 28,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 12,
  },
  blur: 25,
  animation: {
    duration: 300,
    easing: 'outQuad', // Easing.out(Easing.quad)
  }
} as const;

export type Color = keyof typeof DesignSystem.colors;
export type Gradient = keyof typeof DesignSystem.gradients;

