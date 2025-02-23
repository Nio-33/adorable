import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { RootScreenProps } from '@/types/navigation';
import { Shield, MapPin, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { PrivacySettings } from '@/types/forms';

const visibilityOptions = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'contacts', label: 'Contacts Only' },
  { value: 'private', label: 'Private' },
] as const;

const PrivacySettingsScreen: React.FC<RootScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    profile: {
      visibility: 'everyone',
      showLocation: true,
      showActivity: true,
      allowTagging: true,
    },
    location: {
      shareRealTime: false,
      showNearby: true,
      preciseLocation: true,
    },
    messaging: {
      allowDirect: 'contacts',
      readReceipts: true,
      onlineStatus: true,
    },
  });

  const updateSetting = <T extends keyof PrivacySettings>(
    category: T,
    setting: keyof PrivacySettings[T],
    value: PrivacySettings[T][keyof PrivacySettings[T]]
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield color="#60a5fa" size={20} />
            <Text style={styles.sectionTitle}>Profile Privacy</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Profile Visibility</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={settings.profile.visibility}
                  onValueChange={(value) => updateSetting('profile', 'visibility', value)}
                  style={styles.pickerContent}
                  dropdownIconColor="white"
                >
                  {visibilityOptions.map(option => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color="white"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Show Location</Text>
                <Text style={styles.settingDescription}>Display your current location</Text>
              </View>
              <Switch
                value={settings.profile.showLocation}
                onValueChange={(value) => updateSetting('profile', 'showLocation', value)}
                trackColor={{ false: '#312e81', true: '#4f46e5' }}
                thumbColor="white"
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Activity Status</Text>
                <Text style={styles.settingDescription}>Show your activity status</Text>
              </View>
              <Switch
                value={settings.profile.showActivity}
                onValueChange={(value) => updateSetting('profile', 'showActivity', value)}
                trackColor={{ false: '#312e81', true: '#4f46e5' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Location Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color="#60a5fa" size={20} />
            <Text style={styles.sectionTitle}>Location Services</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Real-time Location</Text>
                <Text style={styles.settingDescription}>Share location while using app</Text>
              </View>
              <Switch
                value={settings.location.shareRealTime}
                onValueChange={(value) => updateSetting('location', 'shareRealTime', value)}
                trackColor={{ false: '#312e81', true: '#4f46e5' }}
                thumbColor="white"
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Show Nearby Users</Text>
                <Text style={styles.settingDescription}>Allow others to find you nearby</Text>
              </View>
              <Switch
                value={settings.location.showNearby}
                onValueChange={(value) => updateSetting('location', 'showNearby', value)}
                trackColor={{ false: '#312e81', true: '#4f46e5' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Messages & Interactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare color="#60a5fa" size={20} />
            <Text style={styles.sectionTitle}>Messages & Interactions</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Who can message you</Text>
              <View style={styles.picker}>
                <Picker
                  selectedValue={settings.messaging.allowDirect}
                  onValueChange={(value) => updateSetting('messaging', 'allowDirect', value)}
                  style={styles.pickerContent}
                  dropdownIconColor="white"
                >
                  <Picker.Item label="Everyone" value="everyone" color="white" />
                  <Picker.Item label="Contacts Only" value="contacts" color="white" />
                  <Picker.Item label="No One" value="none" color="white" />
                </Picker>
              </View>
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>Read Receipts</Text>
                <Text style={styles.settingDescription}>Show when you've read messages</Text>
              </View>
              <Switch
                value={settings.messaging.readReceipts}
                onValueChange={(value) => updateSetting('messaging', 'readReceipts', value)}
                trackColor={{ false: '#312e81', true: '#4f46e5' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Warning Section */}
        <View style={styles.warningCard}>
          <AlertCircle color="#fbbf24" size={20} style={styles.warningIcon} />
          <Text style={styles.warningText}>
            Some features may be limited when privacy settings are restricted. You can always adjust these settings later.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  header: {
    backgroundColor: '#312e81',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  card: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  pickerContainer: {
    gap: 8,
  },
  label: {
    color: 'white',
    fontSize: 16,
  },
  picker: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4338ca',
    overflow: 'hidden',
  },
  pickerContent: {
    color: 'white',
    backgroundColor: '#1e1b4b',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    color: '#a5b4fc',
    fontSize: 14,
  },
  warningCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  warningIcon: {
    marginTop: 2,
  },
  warningText: {
    color: '#fbbf24',
    fontSize: 14,
    flex: 1,
  },
});

export default PrivacySettingsScreen;
