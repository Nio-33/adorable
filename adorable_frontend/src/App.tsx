import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './store';

// Import screens (we'll create these next)
import MapScreen from './screens/MapScreen';
import DiscoverScreen from './screens/DiscoverScreen';
import ChatScreen from './screens/ChatScreen';
import PeopleScreen from './screens/PeopleScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen 
              name="Map" 
              component={MapScreen}
              options={{
                headerShown: false
              }}
            />
            <Tab.Screen 
              name="Discover" 
              component={DiscoverScreen}
              options={{
                headerShown: false
              }}
            />
            <Tab.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                headerShown: false
              }}
            />
            <Tab.Screen 
              name="People" 
              component={PeopleScreen}
              options={{
                headerShown: false
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
} 