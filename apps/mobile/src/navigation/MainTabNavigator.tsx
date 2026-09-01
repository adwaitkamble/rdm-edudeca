import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { DashboardStackNavigator } from './DashboardStackNavigator';
import { LevelPathScreen, LeaderboardScreen, RewardsScreen, ProfileScreen } from '../screens/main';
import { colors, typography } from '@edudeca/ui';
import { Home, Signal, Trophy, Star, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.mutedDim,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size || 20} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="LevelsTab"
        component={LevelPathScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Levels',
          tabBarIcon: ({ color, size }) => (
            <Signal color={color} size={size || 20} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="RankTab"
        component={LeaderboardScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Rank',
          tabBarIcon: ({ color, size }) => (
            <Trophy color={color} size={size || 20} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="RewardsTab"
        component={RewardsScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Rewards',
          tabBarIcon: ({ color, size }) => (
            <Star color={color} size={size || 20} strokeWidth={2.4} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen as React.ComponentType<any>}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size || 20} strokeWidth={2.4} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(11, 14, 20, 0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    height: Platform.OS === 'ios' ? 84 : 64,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
});
