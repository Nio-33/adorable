import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../../config/theme';
import { Typography } from '../../components/atoms';
import { List, ListItem } from '../../components/molecules';

interface Language {
  id: string;
  name: string;
  code: string;
  native: string;
}

export const LanguageSettingsScreen: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages: Language[] = [
    { id: 'en', name: 'English', code: 'en', native: 'English' },
    { id: 'es', name: 'Spanish', code: 'es', native: 'Español' },
    { id: 'fr', name: 'French', code: 'fr', native: 'Français' },
    { id: 'de', name: 'German', code: 'de', native: 'Deutsch' },
    { id: 'it', name: 'Italian', code: 'it', native: 'Italiano' },
    { id: 'pt', name: 'Portuguese', code: 'pt', native: 'Português' },
    { id: 'ru', name: 'Russian', code: 'ru', native: 'Русский' },
    { id: 'zh', name: 'Chinese', code: 'zh', native: '中文' },
    { id: 'ja', name: 'Japanese', code: 'ja', native: '日本語' },
    { id: 'ko', name: 'Korean', code: 'ko', native: '한국어' },
  ];

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // TODO: Implement language change logic
    // This should update the app's locale and persist the selection
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h4" style={styles.title}>
          Select Language
        </Typography>
        <Typography
          variant="body2"
          color={COLORS.text.secondary}
          style={styles.description}
        >
          Choose your preferred language for the app
        </Typography>
      </View>

      <List
        data={languages}
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subtitle={item.native}
            rightContent={
              selectedLanguage === item.code && (
                <View style={styles.selectedIndicator} />
              )
            }
            onPress={() => handleLanguageSelect(item.code)}
            selected={selectedLanguage === item.code}
          />
        )}
        keyExtractor={item => item.id}
      />

      <View style={styles.footer}>
        <Typography
          variant="caption"
          color={COLORS.text.secondary}
          style={styles.footerText}
        >
          Some content may not be available in all languages
        </Typography>
      </View>
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
  title: {
    marginBottom: SPACING.xs,
  },
  description: {
    marginBottom: SPACING.sm,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary.main,
  },
  footer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
}); 