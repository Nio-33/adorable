import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MessagesScreen } from '../MessagesScreen';
import { ChatRoomScreen } from '../ChatRoomScreen';
import { NewChatScreen } from '../NewChatScreen';
import { COLORS } from '../../../config/theme';

export type MessagesStackParamList = {
  MessagesList: undefined;
  ChatRoom: { roomId: string; title: string };
  NewChat: undefined;
};

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export const MessagesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background.primary,
        },
        headerTintColor: COLORS.text.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MessagesList"
        component={MessagesScreen}
        options={{
          title: 'Messages',
        }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          title: route.params.title,
          headerBackTitle: '',
        })}
      />
      <Stack.Screen
        name="NewChat"
        component={NewChatScreen}
        options={{
          title: 'New Chat',
          headerBackTitle: '',
        }}
      />
    </Stack.Navigator>
  );
}; 