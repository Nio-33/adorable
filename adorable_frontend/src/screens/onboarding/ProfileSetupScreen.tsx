import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ArrowLeft, MapPin, Calendar } from 'lucide-react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@/context/AuthContext';
import Svg, { Circle, Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import type { AuthScreenProps } from '@/types/navigation';
import type { ProfileSetupFormData } from '@/types/forms';
import type { User, Interest } from '@/types/user';

const AdorableLogo = () => (
  <Svg width={80} height={80} viewBox="0 0 200 200">
    <Circle cx="100" cy="100" r="90" fill="#000080"/>
    <Circle cx="70" cy="85" r="8" fill="white" />
    <Circle cx="130" cy="85" r="8" fill="white" />
    <Path d="M70 130 Q100 160 130 130" stroke="white" strokeWidth="8" fill="none" />
    <Path d="M100 40 C60 40, 40 70, 40 100 C40 140, 100 160, 100 180 C100 160, 160 140, 160 100 C160 70, 140 40, 100 40"
          fill="none"
          stroke="white"
          strokeWidth="8"/>
  </Svg>
);

const interests: Interest[] = [
  { name: 'Art & Culture', icon: '🎨' },
  { name: 'Food & Dining', icon: '🍽️' },
  { name: 'Nightlife', icon: '🌙' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Movies', icon: '🎬' },
  { name: 'Music', icon: '🎵' },
  { name: 'Technology', icon: '💻' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Reading', icon: '📚' },
  { name: 'Photography', icon: '📸' },
  { name: 'Fitness', icon: '💪' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

const ProfileSetupScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState<ProfileSetupFormData>({
    fullName: user?.name || '',
    username: '',
    bio: '',
    phoneNumber: user?.phoneNumber || '',
    dateOfBirth: '',
    gender: '',
    interests: [],
    location: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(user?.photoURL || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagePicker = () => {
    // TODO: Implement image picker
    Alert.alert('Coming Soon', 'Image upload will be implemented');
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const currentInterests = prev.interests;
      if (currentInterests.includes(interest)) {
        return {
          ...prev,
          interests: currentInterests.filter(i => i !== interest),
        };
      } else if (currentInterests.length < 5) {
        return {
          ...prev,
          interests: [...currentInterests, interest],
        };
      } else {
        Alert.alert('Limit Reached', 'You can select up to 5 interests');
        return prev;
      }
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please choose a username');
      return;
    }

    if (!formData.bio.trim()) {
      Alert.alert('Error', 'Please write a short bio about yourself');
      return;
    }

    if (!formData.location.trim()) {
      Alert.alert('Error', 'Please enter your location');
      return;
    }

    if (formData.interests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }

    // Update user profile
    if (user) {
      const updatedUser: User = {
        ...user,
        name: formData.fullName,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        interests: formData.interests,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as User['gender'],
        photoURL: profileImage,
        hasCompletedSetup: true,
      };

      setUser(updatedUser);
    }

    // Navigate to main app
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  // Update date picker handlers
  const handleDateConfirm = (selectedDate: Date) => {
    setShowDatePicker(false);
    setDate(selectedDate);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    handleInputChange('dateOfBirth', formattedDate);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        {/* Back Button - Keep outside ScrollView to stay fixed */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Header - Now inside ScrollView */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <AdorableLogo />
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Tell us about yourself</Text>
          </View>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={styles.photoContainer}
            onPress={handleImagePicker}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera size={32} color="#60a5fa" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.photoText}>Add Profile Photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#94a3b8"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
            />
          </View>

          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              placeholderTextColor="#94a3b8"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
            />
          </View>

          {/* Bio */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself"
              placeholderTextColor="#94a3b8"
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#94a3b8"
              value={formData.phoneNumber}
              onChangeText={(value) => handleInputChange('phoneNumber', value)}
              keyboardType="phone-pad"
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color="#60a5fa" />
              <Text style={styles.datePickerButtonText}>
                {formData.dateOfBirth || 'Select Date of Birth'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={handleDateCancel}
              date={date}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          </View>

          {/* Gender */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    formData.gender === option.value && styles.genderOptionSelected,
                  ]}
                  onPress={() => handleInputChange('gender', option.value)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    formData.gender === option.value && styles.genderOptionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationInput}>
              <MapPin size={20} color="#60a5fa" />
              <TextInput
                style={styles.locationTextInput}
                placeholder="Enter your location"
                placeholderTextColor="#94a3b8"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
              />
            </View>
          </View>

          {/* Interests */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Interests (Select up to 5)</Text>
            <View style={styles.interestsContainer}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest.name}
                  style={[
                    styles.interestChip,
                    formData.interests.includes(interest.name) && styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.name)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      formData.interests.includes(interest.name) && styles.interestTextSelected,
                    ]}
                  >
                    {interest.icon} {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Complete Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  content: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60, // Add extra padding to account for the absolute positioned back button
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#312e81',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4338ca',
    borderStyle: 'dashed',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#312e81',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  bioInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  locationInput: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  locationTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  genderOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  genderOptionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  genderOptionTextSelected: {
    fontWeight: '600',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  interestChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
    marginBottom: 4,
  },
  interestChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  interestText: {
    color: '#ffffff',
    fontSize: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestTextSelected: {
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  datePickerButton: {
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  datePickerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 12,
  },
});

export default ProfileSetupScreen;
