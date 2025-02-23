import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../config/theme';
import { Avatar, Button, Typography } from '../../components/atoms';
import { Form } from '../../components/molecules';
import { useAuth } from '../../hooks/useAuth';
import type { FormField } from '../../components/molecules/Form/Form';
import type { User } from '../../types';

interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  email: string;
  phone?: string;
  location?: string;
}

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<ProfileFormData>({
    displayName: user?.displayName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
    location: '',
  });

  const validateDisplayName = (value: string) => {
    if (!value.trim()) {
      return 'Display name is required';
    }
    if (value.length < 2) {
      return 'Display name must be at least 2 characters';
    }
    if (value.length > 50) {
      return 'Display name must be less than 50 characters';
    }
    return '';
  };

  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return 'Username is required';
    }
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 30) {
      return 'Username must be less than 30 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const formFields: FormField[] = [
    {
      id: 'displayName',
      label: 'Display Name',
      value: formState.displayName,
      placeholder: 'Enter your display name',
      error: '',
      required: true,
      onChange: (value) => setFormState(prev => ({ ...prev, displayName: value })),
    },
    {
      id: 'username',
      label: 'Username',
      value: formState.username,
      placeholder: 'Enter your username',
      error: '',
      required: true,
      onChange: (value) => setFormState(prev => ({ ...prev, username: value })),
    },
    {
      id: 'bio',
      label: 'Bio',
      value: formState.bio,
      placeholder: 'Tell us about yourself',
      multiline: true,
      numberOfLines: 4,
      onChange: (value) => setFormState(prev => ({ ...prev, bio: value })),
    },
    {
      id: 'email',
      label: 'Email',
      value: formState.email,
      placeholder: 'Enter your email',
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      error: '',
      required: true,
      onChange: (value) => setFormState(prev => ({ ...prev, email: value })),
    },
  ];

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate all fields
      const displayNameError = validateDisplayName(formState.displayName);
      const usernameError = validateUsername(formState.username);
      const emailError = validateEmail(formState.email);

      if (displayNameError || usernameError || emailError) {
        Alert.alert('Validation Error', 'Please check your input and try again.');
        return;
      }

      // Update user profile
      await updateProfile({
        ...user,
        displayName: formState.displayName,
        username: formState.username,
        bio: formState.bio,
        email: formState.email,
      } as Partial<User>);

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Avatar
            uri={user?.photoURL || user?.avatarUrl}
            fallback={user?.displayName?.[0] || 'A'}
            size="xlarge"
            style={styles.avatar}
          />
          <Button
            variant="outline"
            onPress={() => {
              // TODO: Implement photo upload
              Alert.alert('Coming Soon', 'Photo upload will be available soon');
            }}
          >
            Change Photo
          </Button>
        </View>

        <Form
          fields={formFields}
          style={styles.form}
        />

        <View style={styles.actions}>
          <Button
            variant="primary"
            onPress={handleSave}
            loading={loading}
            style={styles.submitButton}
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Cancel
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
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  avatar: {
    marginBottom: SPACING.md,
  },
  form: {
    padding: SPACING.lg,
  },
  actions: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  submitButton: {
    marginBottom: SPACING.sm,
  },
  cancelButton: {
    borderColor: COLORS.border.light,
  },
}); 