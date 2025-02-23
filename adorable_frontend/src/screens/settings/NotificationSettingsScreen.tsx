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

type NotificationSettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface NotificationToggleProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
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

export const NotificationSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationSettingsNavigationProp>();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [friendRequestNotifs, setFriendRequestNotifs] = useState(true);
  const [checkInNotifs, setCheckInNotifs] = useState(true);
  const [nearbyNotifs, setNearbyNotifs] = useState(true);
  const [reviewNotifs, setReviewNotifs] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon icon={ArrowLeft} size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <NotificationToggle
            title="Push Notifications"
            description="Receive push notifications on your device"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <NotificationToggle
            title="Email Notifications"
            description="Receive notifications via email"
            value={emailEnabled}
            onValueChange={setEmailEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social</Text>
          <NotificationToggle
            title="Messages"
            description="Notifications for new messages"
            value={messageNotifs}
            onValueChange={setMessageNotifs}
          />
          <NotificationToggle
            title="Friend Requests"
            description="Notifications for friend requests"
            value={friendRequestNotifs}
            onValueChange={setFriendRequestNotifs}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <NotificationToggle
            title="Check-ins"
            description="When friends check in nearby"
            value={checkInNotifs}
            onValueChange={setCheckInNotifs}
          />
          <NotificationToggle
            title="Nearby Friends"
            description="When friends are nearby"
            value={nearbyNotifs}
            onValueChange={setNearbyNotifs}
          />
          <NotificationToggle
            title="Reviews & Ratings"
            description="When someone reviews your shared places"
            value={reviewNotifs}
            onValueChange={setReviewNotifs}
          />
        </View>
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
}); 