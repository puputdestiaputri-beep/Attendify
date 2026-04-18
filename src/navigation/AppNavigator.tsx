import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Calendar as CalendarIcon, User as UserIcon } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen';
import JadwalScreen from '../screens/JadwalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanScreen from '../screens/ScanScreen';
import NotificationScreen from '../screens/NotificationScreen';
import DosenDashboardScreen from '../screens/DosenDashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import AboutAttendifyScreen from '../screens/AboutAttendifyScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ManageStudentsScreen from '../screens/ManageStudentsScreen';
import ManageLecturersScreen from '../screens/ManageLecturersScreen';
import IoTSensorValidationScreen from '../screens/IoTSensorValidationScreen';
import DatabaseLogsScreen from '../screens/DatabaseLogsScreen';
import ManageAttendanceScreen from '../screens/ManageAttendanceScreen';
import { Colors } from '@/constants/Colors';


import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopRightRadius: 28,
          borderTopLeftRadius: 28,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.ai.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
      />
      <Tab.Screen
        name="Jadwal"
        component={JadwalScreen}
        options={{ tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color }) => <UserIcon color={color} size={24} /> }}
      />
    </Tab.Navigator>
  );
}

// Tab Navigator untuk Admin
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopRightRadius: 28,
          borderTopLeftRadius: 28,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.ai.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -4 }
      }}
    >
      <Tab.Screen
        name="Home"
        component={AdminDashboardScreen}
        options={{ 
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Home color={color} size={24} /> 
        }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={ProfileScreen}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon color={color} size={24} /> 
        }}
      />
    </Tab.Navigator>
  );
}

// Tab Navigator untuk Dosen
function DosenTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          borderTopRightRadius: 28,
          borderTopLeftRadius: 28,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors.ai.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: -4 }
      }}
    >
      <Tab.Screen
        name="Home"
        component={DosenDashboardScreen}
        options={{ 
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Home color={color} size={24} /> 
        }}
      />
      <Tab.Screen
        name="DosenProfile"
        component={ProfileScreen}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <UserIcon color={color} size={24} /> 
        }}
      />
    </Tab.Navigator>
  );
}

// Navigator untuk user yang sudah login (Mahasiswa)
function MahasiswaNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Scan" component={ScanScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="AboutAttendify" component={AboutAttendifyScreen} />
    </Stack.Navigator>
  );
}

// Navigator untuk Dosen yang sudah login
function DosenNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DosenMain" component={DosenTabNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="AboutAttendify" component={AboutAttendifyScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>

  );
}

// Navigator untuk Admin yang sudah login
function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
      <Stack.Screen name="ManageStudents" component={ManageStudentsScreen} />
      <Stack.Screen name="ManageLecturers" component={ManageLecturersScreen} />
      <Stack.Screen name="IoTSensor" component={IoTSensorValidationScreen} />
      <Stack.Screen name="DatabaseLogs" component={DatabaseLogsScreen} />
      <Stack.Screen name="ManageAttendance" component={ManageAttendanceScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />


      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
    </Stack.Navigator>

  );
}

export default function AppNavigator() {
  const { isLoggedIn, role } = useAuth();

  console.log('🔍 AppNavigator - isLoggedIn:', isLoggedIn, 'role:', role);

  if (!isLoggedIn) {
    return (
      <Stack.Navigator 
        key={`auth-${isLoggedIn}`}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
        />
        <Stack.Screen 
          name="CreateAccount" 
          component={CreateAccountScreen}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    );
  }

  if (role === 'dosen') {
    return <DosenNavigator />;
  }

  if (role === 'admin') {
    return <AdminNavigator />;
  }

  return <MahasiswaNavigator />;
}
