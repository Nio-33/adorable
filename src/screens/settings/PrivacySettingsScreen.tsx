import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button } from '../../components/atoms';
import { List, ListItem } from '../../components/molecules';
import { useSettings } from '../../hooks/useSettings';
import type { RootStackParamList } from '../../navigation/types';

type PrivacySettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrivacySettings'>;

export const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation<PrivacySettingsScreenNavigationProp>();
  const { settings, loading, updatePrivacy } = useSettings();

  const handleToggle = async (key: keyof typeof settings.privacy) => {
    try {
      await updatePrivacy({
        [key]: !settings.privacy[key],
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  };

  const privacySettings = [
    {
      id: 'locationSharing',
      title: 'Location Sharing',
      description: 'Allow others to see your location on the map',
      value: settings.privacy.locationSharing,
    },
    {
      id: 'profileVisibility',
      title: 'Public Profile',
      description: 'Make your profile visible to everyone',
      value: settings.privacy.profileVisibility,
    },
    {
      id: 'activitySharing',
      title: 'Activity Sharing',
      description: 'Share your check-ins and reviews',
      value: settings.privacy.activitySharing,
    },
    {
      id: 'onlineStatus',
      title: 'Online Status',
      description: "Show when you're active on the app",
      value: settings.privacy.onlineStatus,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h4" style={styles.title}>
          Privacy Settings
        </Typography>
        <Typography
          variant="body2"
          color={COLORS.text.secondary}
          style={styles.subtitle}
        >
          Control who can see your information and how it's used
        </Typography>
      </View>

      <ScrollView style={styles.content}>
        <List
          data={privacySettings}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={item.description}
              rightContent={
                <View style={[
                  styles.toggle,
                  item.value ? styles.toggleActive : styles.toggleInactive
                ]} />
              }
              onPress={() => handleToggle(item.id as keyof typeof settings.privacy)}
            />
          )}
          keyExtractor={item => item.id}
          loading={loading}
        />

        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Blocked Users
          </Typography>
          <Typography
            variant="body2"
            color={COLORS.text.secondary}
            style={styles.sectionDescription}
          >
            Manage your list of blocked users
          </Typography>
          <Button
            variant="outline"
            onPress={() => navigation.navigate('BlockedUsers')}
            style={styles.blockedUsersButton}
          >
            Manage Blocked Users
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    marginBottom: SPACING.xs,
  },
  subtitle: {
    marginBottom: SPACING.md,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  sectionTitle: {
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    marginBottom: SPACING.md,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary.main,
  },
  toggleInactive: {
    backgroundColor: COLORS.border.light,
  },
  blockedUsersButton: {
    marginTop: SPACING.md,
  },
}); 