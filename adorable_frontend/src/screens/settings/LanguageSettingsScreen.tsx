import React, { useState } from 'react';
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
import { ArrowLeft, Check } from 'lucide-react-native';
import { SettingsStackParamList } from '../../types/navigation';
import { Icon } from '../../components/common/Icon';

type LanguageSettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface Language {
  code: string;
  name: string;
  localName: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'fr', name: 'French', localName: 'Français' },
  { code: 'es', name: 'Spanish', localName: 'Español' },
  { code: 'de', name: 'German', localName: 'Deutsch' },
  { code: 'it', name: 'Italian', localName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', localName: 'Português' },
  { code: 'ru', name: 'Russian', localName: 'Русский' },
  { code: 'zh', name: 'Chinese', localName: '中文' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
  { code: 'ko', name: 'Korean', localName: '한국어' },
];

interface LanguageItemProps {
  language: Language;
  selected: boolean;
  onSelect: () => void;
}

const LanguageItem: React.FC<LanguageItemProps> = ({
  language,
  selected,
  onSelect,
}) => (
  <TouchableOpacity
    style={[styles.languageItem, selected && styles.languageItemSelected]}
    onPress={onSelect}
  >
    <View style={styles.languageInfo}>
      <Text style={styles.languageName}>{language.name}</Text>
      <Text style={styles.localName}>{language.localName}</Text>
    </View>
    {selected && <Icon icon={Check} size={20} color="#1e1b4b" />}
  </TouchableOpacity>
);

export const LanguageSettingsScreen: React.FC = () => {
  const navigation = useNavigation<LanguageSettingsNavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Here you would typically update the app's language setting
    // and possibly trigger a reload of the app's content
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon icon={ArrowLeft} size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Language Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Choose your preferred language for the app interface
        </Text>
        {LANGUAGES.map((language) => (
          <LanguageItem
            key={language.code}
            language={language}
            selected={selectedLanguage === language.code}
            onSelect={() => handleLanguageSelect(language.code)}
          />
        ))}
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
  description: {
    fontSize: 14,
    color: '#666',
    margin: 16,
    marginBottom: 24,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  languageItemSelected: {
    backgroundColor: '#f3f4f6',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  localName: {
    fontSize: 14,
    color: '#666',
  },
}); 