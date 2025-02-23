import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { List, ListItem } from '../../components/molecules';
import { useAuth } from '../../hooks/useAuth';
import type { SettingsStackParamList } from './navigation/SettingsNavigator';

type SettingsScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, signOut } = useAuth();

  const settingsOptions = [
    {
      id: 'profile',
      title: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'privacy',
      title: 'Privacy',
      onPress: () => navigation.navigate('PrivacySettings'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      id: 'language',
      title: 'Language',
      onPress: () => navigation.navigate('LanguageSettings'),
    },
    {
      id: 'logout',
      title: 'Log Out',
      onPress: signOut,
    },
  ];

  return (
    <View style={styles.container}>
      <List
        data={settingsOptions}
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            onPress={item.onPress}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
}); 