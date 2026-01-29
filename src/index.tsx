import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import AppNavigation from './app/navigation';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <AppNavigation />
    </SafeAreaView>
  );
}
