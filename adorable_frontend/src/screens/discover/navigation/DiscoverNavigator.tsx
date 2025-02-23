import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverScreen } from '../DiscoverScreen';
import { CategoryScreen } from '../CategoryScreen';
import { PopularPlacesScreen } from '../PopularPlacesScreen';
import { RecommendationsScreen } from '../RecommendationsScreen';
import { PlaceDetailsScreen } from '../../map/PlaceDetailsScreen';
import { COLORS } from '../../../config/theme';

export type DiscoverStackParamList = {
  DiscoverMain: undefined;
  Category: { category: string };
  PopularPlaces: undefined;
  Recommendations: undefined;
  PlaceDetails: { placeId: string };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export const DiscoverNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background.primary,
        },
      }}
    >
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params.category,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: COLORS.background.primary,
          },
          headerTintColor: COLORS.text.primary,
        })}
      />
      <Stack.Screen
        name="PopularPlaces"
        component={PopularPlacesScreen}
        options={{
          headerShown: true,
          headerTitle: 'Popular Places',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: COLORS.background.primary,
          },
          headerTintColor: COLORS.text.primary,
        }}
      />
      <Stack.Screen
        name="Recommendations"
        component={RecommendationsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Recommended For You',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: COLORS.background.primary,
          },
          headerTintColor: COLORS.text.primary,
        }}
      />
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
    </Stack.Navigator>
  );
};
