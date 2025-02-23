import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../../config/theme';
import { Input } from '../../atoms';

export interface FormField {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  onChange: (value: string) => void;
}

export interface FormProps {
  fields: FormField[];
  style?: any;
}

export const Form: React.FC<FormProps> = ({ fields, style }) => {
  return (
    <View style={[styles.container, style]}>
      {fields.map((field) => (
        <View key={field.id} style={styles.fieldContainer}>
          <Input
            label={field.label}
            value={field.value}
            onChangeText={field.onChange}
            placeholder={field.placeholder}
            error={field.error}
            multiline={field.multiline}
            numberOfLines={field.numberOfLines}
            keyboardType={field.keyboardType}
            autoCapitalize={field.autoCapitalize}
            secureTextEntry={field.secureTextEntry}
            style={styles.input}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
  },
}); 