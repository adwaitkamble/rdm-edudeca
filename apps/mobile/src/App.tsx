import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, ClerkLoaded } from '@clerk/expo';
import * as SecureStore from 'expo-secure-store';
import { RootNavigator } from './navigation/RootNavigator';

declare const process: {
  env: {
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
    [key: string]: string | undefined;
  };
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (_err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (_err) {
      // Ignored
    }
  },
};

const CLERK_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_YW11c2luZy1idXp6YXJkLTQwMzYuY2xlcmsuYWNjb3VudHMuZGV2JA';

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator isClerkEnabled={true} />
        </SafeAreaProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
