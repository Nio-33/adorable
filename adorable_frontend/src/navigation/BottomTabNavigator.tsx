import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/main/MapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { SavedPlacesScreen } from '../screens/main/SavedPlacesScreen';
import { CheckInsScreen } from '../screens/main/CheckInsScreen';
import { Icon } from '../components/common/Icon';
import { Map, User, Bookmark, CheckCircle } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1e1b4b',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Map} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedPlacesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon icon={Bookmark} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Check-ins"
        component={CheckInsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon icon={CheckCircle} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon icon={User} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}; 