import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { ArrowLeft, Check } from 'lucide-react-native';

type LanguageSettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LanguageSettingsScreen = () => {
  const navigation = useNavigation<LanguageSettingsScreenNavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
    { code: 'ha', name: 'Hausa', native: 'Hausa' },
    { code: 'ig', name: 'Igbo', native: 'Igbo' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
  ];

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
        <Text style={styles.headerTitle}>Language Settings</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageButton,
                selectedLanguage === language.code && styles.languageButtonSelected,
              ]}
              onPress={() => setSelectedLanguage(language.code)}
            >
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageNative}>{language.native}</Text>
              </View>
              {selectedLanguage === language.code && (
                <View style={styles.checkmarkContainer}>
                  <Check color="white" size={16} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          These translations are community provided. Some content may not be available in all languages.
        </Text>
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
  card: {
    backgroundColor: '#312e81',
    borderRadius: 12,
    overflow: 'hidden',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1b4b',
  },
  languageButtonSelected: {
    backgroundColor: '#4338ca',
  },
  languageInfo: {
    gap: 4,
  },
  languageName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  languageNative: {
    color: '#a5b4fc',
    fontSize: 14,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimer: {
    color: '#a5b4fc',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 24,
  },
});

export default LanguageSettingsScreen;
