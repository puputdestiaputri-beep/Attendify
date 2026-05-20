// Polyfill for TextEncoder/TextDecoder for React Native/Expo
import { TextEncoder, TextDecoder } from 'text-encoding';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

import React from 'react';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { SocketProvider } from './src/context/SocketContext';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <NavigationIndependentTree>
            <NavigationContainer>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </NavigationIndependentTree>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

import { registerRootComponent } from 'expo';
registerRootComponent(App);
