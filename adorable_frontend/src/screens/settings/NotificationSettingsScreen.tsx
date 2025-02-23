import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../../config/theme';
import { Typography } from '../../components/atoms';
import { List, ListItem } from '../../components/molecules';

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  value: boolean;
  category: 'messages' | 'connections' | 'activity';
}

export const NotificationSettingsScreen: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationOption[]>([
    {
      id: 'new_messages',
      title: 'New Messages',
      description: 'Get notified when you receive new messages',
      value: true,
      category: 'messages',
    },
    {
      id: 'message_likes',
      title: 'Message Reactions',
      description: 'Get notified when someone reacts to your messages',
      value: true,
      category: 'messages',
    },
    {
      id: 'connection_requests',
      title: 'Connection Requests',
      description: 'Get notified when someone wants to connect',
      value: true,
      category: 'connections',
    },
    {
      id: 'connection_accepted',
      title: 'Connection Accepted',
      description: 'Get notified when someone accepts your connection request',
      value: true,
      category: 'connections',
    },
    {
      id: 'nearby_users',
      title: 'Nearby Users',
      description: 'Get notified when new users are nearby',
      value: false,
      category: 'activity',
    },
    {
      id: 'user_activity',
      title: 'User Activity',
      description: 'Get notified about relevant user activity',
      value: true,
      category: 'activity',
    },
  ]);

  const handleToggle = (id: string) => {
    setNotificationSettings(prev =>
      prev.map(setting =>
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
    );
  };

  const renderSection = (category: NotificationOption['category'], title: string) => {
    const categorySettings = notificationSettings.filter(
      setting => setting.category === category
    );

    return (
      <View style={styles.section}>
        <Typography variant="h4" style={styles.sectionTitle}>
          {title}
        </Typography>
        <List
          data={categorySettings}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              subtitle={item.description}
              rightContent={
                <View style={[
                  styles.toggle,
                  item.value ? styles.toggleActive : styles.toggleInactive,
                ]} />
              }
              onPress={() => handleToggle(item.id)}
            />
          )}
          keyExtractor={item => item.id}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="body2" color={COLORS.text.secondary}>
          Choose which notifications you'd like to receive
        </Typography>
      </View>

      {renderSection('messages', 'Messages')}
      {renderSection('connections', 'Connections')}
      {renderSection('activity', 'Activity')}
    </ScrollView>
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
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    marginLeft: SPACING.md,
  },
  toggleActive: {
    backgroundColor: COLORS.primary.main,
  },
  toggleInactive: {
    backgroundColor: COLORS.disabled,
  },
});
