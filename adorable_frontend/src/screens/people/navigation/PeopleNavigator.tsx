import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PeopleScreen } from '../PeopleScreen';
import { UserProfileScreen } from '../UserProfileScreen';
import { COLORS } from '../../../config/theme';

export type PeopleStackParamList = {
  PeopleMain: undefined;
  UserProfile: { userId: string };
};

const Stack = createNativeStackNavigator<PeopleStackParamList>();

export const PeopleNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background.primary,
        },
      }}
    >
      <Stack.Screen name="PeopleMain" component={PeopleScreen} />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
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
