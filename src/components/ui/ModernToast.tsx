import React, { useRef, useEffect } from 'react';
import {
  View, StyleSheet, Text, Animated, ViewStyle, SafeAreaView
} from 'react-native';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { DesignSystem } from '@/constants/DesignSystem';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

interface ToastProps extends ToastConfig {
  id: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => {
      slideOut();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const slideOut = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={24} color="#10B981" />;
      case 'error':
        return <AlertCircle size={24} color="#EF4444" />;
      case 'warning':
        return <AlertTriangle size={24} color="#F59E0B" />;
      case 'info':
      default:
        return <Info size={24} color={DesignSystem.colors.primary} />;
    }
  };

  const getGradient = (): [string, string] => {
    switch (type) {
      case 'success':
        return ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)'];
      case 'error':
        return ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)'];
      case 'warning':
        return ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)'];
      case 'info':
      default:
        return ['rgba(30, 79, 168, 0.1)', 'rgba(45, 108, 223, 0.05)'];
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'rgba(16, 185, 129, 0.3)';
      case 'error':
        return 'rgba(239, 68, 68, 0.3)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.3)';
      case 'info':
      default:
        return 'rgba(30, 79, 168, 0.3)';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <BlurView intensity={DesignSystem.blur} style={styles.blur}>
        <LinearGradient
          colors={getGradient() as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.toast,
            {
              borderColor: getBorderColor(),
            },
          ]}
        >
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
          <TouchableOpacity onPress={slideOut} style={styles.closeButton}>
            <X size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

interface ToastStackProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
}

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onRemove }) => {
  return (
    <SafeAreaView style={styles.stack} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </SafeAreaView>
  );
};

// Toast Manager Hook
let toastId = 0;
let toastCallback: ((config: ToastProps) => void) | null = null;

export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  React.useEffect(() => {
    toastCallback = (config: ToastProps) => {
      setToasts((prev) => [...prev, config]);
    };
  }, []);

  const showToast = (config: Omit<ToastProps, 'id'> & Omit<ToastConfig, 'onClose'>) => {
    const id = `toast-${toastId++}`;
    const toastConfig: ToastProps = {
      ...config,
      id,
      onClose: () => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
    };
    setToasts((prev) => [...prev, toastConfig]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
};

// Global Toast function
export const showToast = (config: Omit<ToastConfig, 'onClose'>) => {
  if (toastCallback) {
    const id = `toast-${toastId++}`;
    toastCallback({
      ...config,
      id,
    } as ToastProps);
  }
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: DesignSystem.radius.lg,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: DesignSystem.radius.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: DesignSystem.radius.lg,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: DesignSystem.typography.body,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  message: {
    fontSize: DesignSystem.typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  stack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
  },
});

export default Toast;
