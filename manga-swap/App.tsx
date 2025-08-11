import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SimpleThemeProvider } from './src/context/SimpleTheme';
import { NotificationProvider } from './src/hooks/useNotification';
import BottomTabNavigator from './src/components/BottomTabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SimpleThemeProvider>
        <NotificationProvider>
          <BottomTabNavigator />
          <StatusBar style="auto" />
        </NotificationProvider>
      </SimpleThemeProvider>
    </SafeAreaProvider>
  );
}