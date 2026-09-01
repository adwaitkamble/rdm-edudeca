import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStackNavigator } from './AuthStackNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { colors } from '@edudeca/ui';
import { useAuth } from '@clerk/expo';
import { useAppStore } from '../store/useAppStore';

import { setAuthTokenGetter, setCurrentUserId } from '../services/apiClient';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.teal,
  },
};

interface RootNavigatorProps {
  isClerkEnabled?: boolean;
}

const ClerkAuthNavigator: React.FC = () => {
  let isSignedIn = false;
  let clerkUserId: string | null = null;
  let clerkGetToken: any = null;

  try {
    const clerkAuth = useAuth();
    isSignedIn = Boolean(clerkAuth.isSignedIn);
    clerkUserId = clerkAuth.userId || null;
    clerkGetToken = clerkAuth.getToken;
  } catch (_e) {
    isSignedIn = false;
  }

  React.useEffect(() => {
    if (clerkUserId) {
      setCurrentUserId(clerkUserId);
    }
    if (clerkGetToken) {
      setAuthTokenGetter(clerkGetToken);
    }
  }, [clerkUserId, clerkGetToken]);

  const isGuestOrDevAuthenticated = useAppStore(
    (state) => state.isGuestOrDevAuthenticated
  );

  const isAuthenticated = Boolean(isSignedIn || isGuestOrDevAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator as React.ComponentType<any>} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator as React.ComponentType<any>} />
      )}
    </Stack.Navigator>
  );
};

const MockAuthNavigator: React.FC = () => {
  const isGuestOrDevAuthenticated = useAppStore(
    (state) => state.isGuestOrDevAuthenticated
  );

  const isAuthenticated = Boolean(isGuestOrDevAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator as React.ComponentType<any>} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator as React.ComponentType<any>} />
      )}
    </Stack.Navigator>
  );
};

export const RootNavigator: React.FC<RootNavigatorProps> = ({ isClerkEnabled = false }) => {
  return (
    <NavigationContainer theme={AppNavTheme}>
      {isClerkEnabled ? <ClerkAuthNavigator /> : <MockAuthNavigator />}
    </NavigationContainer>
  );
};
