import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';
import { MapScreen } from '../screens/map/MapScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { PeopleScreen } from '../screens/people/PeopleScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons 
    name="home" 
    size={24} 
    color={focused ? COLORS.primary.main : COLORS.secondary.main} 
  />
);

const ChatTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons 
    name="chatbubbles" 
    size={24} 
    color={focused ? COLORS.primary.main : COLORS.secondary.main} 
  />
);

const MapTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons 
    name="map" 
    size={24} 
    color={focused ? COLORS.primary.main : COLORS.secondary.main} 
  />
);

const ProfileTabIcon = ({ focused }: { focused: boolean }) => (
  <Ionicons 
    name="person" 
    size={24} 
    color={focused ? COLORS.primary.main : COLORS.secondary.main} 
  />
);

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: MapTabIcon,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={MessagesScreen}
        options={{
          tabBarIcon: ChatTabIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PeopleScreen}
        options={{
          tabBarIcon: ProfileTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};
