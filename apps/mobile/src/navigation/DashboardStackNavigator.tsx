import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardStackParamList } from './types';
import {
  DashboardScreen,
  LevelSelectScreen,
  QuizScreen,
  ResultsScreen,
  ReferScreen,
  LevelPathScreen,
  LeaderboardScreen,
  RewardsScreen,
  ProfileScreen,
} from '../screens/main';
import { PickPathScreen } from '../screens/auth/PickPathScreen';
import { colors } from '@edudeca/ui';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen as React.ComponentType<any>} />
      <Stack.Screen
        name="LevelSelect"
        component={LevelSelectScreen as React.ComponentType<any>}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Quiz"
        component={QuizScreen as React.ComponentType<any>}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen as React.ComponentType<any>}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Refer" component={ReferScreen as React.ComponentType<any>} />
      <Stack.Screen name="LevelPath" component={LevelPathScreen as React.ComponentType<any>} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen as React.ComponentType<any>} />
      <Stack.Screen name="PickPath" component={PickPathScreen as React.ComponentType<any>} />
      <Stack.Screen name="Rewards" component={RewardsScreen as React.ComponentType<any>} />
      <Stack.Screen name="Profile" component={ProfileScreen as React.ComponentType<any>} />
    </Stack.Navigator>
  );
};
