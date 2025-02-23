import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MapScreen } from '../MapScreen';
import { PlaceDetailsScreen } from '../PlaceDetailsScreen';
import { SearchResultsScreen } from '../SearchResultsScreen';
import { COLORS } from '../../../config/theme';

export type MapStackParamList = {
  MapMain: undefined;
  PlaceDetails: { placeId: string };
  SearchResults: { query: string };
};

const Stack = createNativeStackNavigator<MapStackParamList>();

export const MapNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background.primary,
        },
      }}
    >
      <Stack.Screen name="MapMain" component={MapScreen} />
      <Stack.Screen
        name="PlaceDetails"
        component={PlaceDetailsScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerBackTitle: '',
          headerTintColor: COLORS.text.primary,
        }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Search Results',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: COLORS.background.primary,
          },
          headerTintColor: COLORS.text.primary,
        }}
      />
    </Stack.Navigator>
  );
}; 