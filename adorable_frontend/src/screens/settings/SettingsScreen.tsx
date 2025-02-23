import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  User,
  Lock,
  Bell,
  Globe,
  UserX,
  ChevronRight,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../types/navigation';
import { Icon } from '../../components/common/Icon';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: any;
  title: string;
  onPress: () => void;
  color?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  onPress,
  color = '#1a1a1a',
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingItemContent}>
      <Icon icon={icon} size={24} color={color} />
      <Text style={[styles.settingItemText, { color }]}>{title}</Text>
    </View>
    <Icon icon={ChevronRight} size={20} color={color} />
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon={User}
            title="Edit Profile"
            onPress={() => navigation.navigate('ProfileEdit')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingItem
            icon={Lock}
            title="Privacy"
            onPress={() => navigation.navigate('PrivacySettings')}
          />
          <SettingItem
            icon={Bell}
            title="Notifications"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
          <SettingItem
            icon={Globe}
            title="Language"
            onPress={() => navigation.navigate('LanguageSettings')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <SettingItem
            icon={UserX}
            title="Blocked Users"
            onPress={() => navigation.navigate('BlockedUsers')}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon={LogOut}
            title="Sign Out"
            onPress={handleSignOut}
            color="#ef4444"
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 