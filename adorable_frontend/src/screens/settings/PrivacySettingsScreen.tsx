import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { SettingsStackParamList } from '../../types/navigation';
import { Icon } from '../../components/common/Icon';

type PrivacySettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface PrivacyToggleProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  title,
  description,
  value,
  onValueChange,
}) => (
  <View style={styles.toggleItem}>
    <View style={styles.toggleInfo}>
      <Text style={styles.toggleTitle}>{title}</Text>
      <Text style={styles.toggleDescription}>{description}</Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
      thumbColor={value ? '#1e1b4b' : '#f4f3f4'}
    />
  </View>
);

export const PrivacySettingsScreen: React.FC = () => {
  const navigation = useNavigation<PrivacySettingsNavigationProp>();
  const [locationSharing, setLocationSharing] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [activitySharing, setActivitySharing] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon icon={ArrowLeft} size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Privacy</Text>
          <PrivacyToggle
            title="Location Sharing"
            description="Allow others to see your location on the map"
            value={locationSharing}
            onValueChange={setLocationSharing}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Privacy</Text>
          <PrivacyToggle
            title="Public Profile"
            description="Make your profile visible to everyone"
            value={profileVisibility}
            onValueChange={setProfileVisibility}
          />
          <PrivacyToggle
            title="Activity Sharing"
            description="Share your check-ins and reviews"
            value={activitySharing}
            onValueChange={setActivitySharing}
          />
          <PrivacyToggle
            title="Online Status"
            description="Show when you're active on the app"
            value={onlineStatus}
            onValueChange={setOnlineStatus}
          />
        </View>

        <TouchableOpacity
          style={styles.blockedUsersButton}
          onPress={() => navigation.navigate('BlockedUsers')}
        >
          <Text style={styles.blockedUsersText}>Manage Blocked Users</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
  },
  blockedUsersButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  blockedUsersText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1b4b',
  },
}); 