import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

type DeleteAccountScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DeleteAccountScreen = () => {
  const navigation = useNavigation<DeleteAccountScreenNavigationProp>();
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [password, setPassword] = useState('');

  const reasons = [
    { value: '', label: 'Select a reason' },
    { value: 'unused', label: "I don't use the app anymore" },
    { value: 'privacy', label: 'Privacy concerns' },
    { value: 'technical', label: 'Technical issues' },
    { value: 'alternative', label: 'Found a better alternative' },
    { value: 'fresh', label: 'Want to start fresh' },
    { value: 'other', label: 'Other' },
  ];

  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    console.log('Account deletion requested');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Warning Card */}
        <View style={styles.warningCard}>
          <View style={styles.warningHeader}>
            <AlertTriangle color="white" size={24} style={{ marginRight: 8 }} />
            <Text style={styles.warningTitle}>Warning: This action cannot be undone</Text>
          </View>
          <Text style={styles.warningText}>
            Deleting your account will permanently remove all your data, including:
          </Text>
          <View style={styles.warningList}>
            <Text style={styles.warningListItem}>• Profile information</Text>
            <Text style={styles.warningListItem}>• Messages and conversations</Text>
            <Text style={styles.warningListItem}>• Places you've saved</Text>
            <Text style={styles.warningListItem}>• Your activity history</Text>
          </View>
        </View>

        {/* Delete Account Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Please select a reason for leaving</Text>

          <View style={styles.formSection}>
            <Text style={styles.label}>Reason for deletion</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={reason}
                onValueChange={setReason}
                style={styles.picker}
                dropdownIconColor="white"
              >
                {reasons.map(option => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color="white"
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Additional feedback (optional)</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={3}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Tell us more about why you're leaving..."
              placeholderTextColor="#a5b4fc"
            />

            <Text style={styles.label}>Type "DELETE" to confirm</Text>
            <TextInput
              style={styles.input}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="DELETE"
              placeholderTextColor="#a5b4fc"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#a5b4fc"
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.deleteButtonText}>Delete Account Permanently</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.supportText}>
            Need help? Contact our support team before deleting your account.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b', // indigo-950
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#312e81', // indigo-900
    gap: 16,
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
  warningCard: {
    backgroundColor: '#dc2626', // red-600
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
  },
  warningText: {
    color: '#fecaca', // red-100
    fontSize: 16,
    marginBottom: 8,
  },
  warningList: {
    marginTop: 8,
  },
  warningListItem: {
    color: '#fecaca', // red-100
    fontSize: 16,
    marginBottom: 4,
  },
  formCard: {
    backgroundColor: '#312e81', // indigo-900
    borderRadius: 12,
    padding: 16,
  },
  formTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  formSection: {
    gap: 16,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  pickerContainer: {
    backgroundColor: '#1e1b4b', // indigo-950
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4338ca', // indigo-700
    overflow: 'hidden',
  },
  picker: {
    color: 'white',
  },
  textArea: {
    backgroundColor: '#1e1b4b', // indigo-950
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4338ca', // indigo-700
    color: 'white',
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  input: {
    backgroundColor: '#1e1b4b', // indigo-950
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4338ca', // indigo-700
    color: 'white',
    padding: 12,
  },
  deleteButton: {
    backgroundColor: '#dc2626', // red-600
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  supportText: {
    color: '#a5b4fc', // indigo-300
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default DeleteAccountScreen;
