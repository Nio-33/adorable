import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../config/theme';
import { useDebounce } from '../../../hooks/useDebounce';

export interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoSearch?: boolean;
  clearable?: boolean;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  autoSearch = true,
  clearable = true,
  style,
}) => {
  const [searchText, setSearchText] = useState(value);

  const debouncedSearch = useDebounce((query: string) => {
    onSearch(query);
  }, debounceMs);

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  const handleChangeText = useCallback((text: string) => {
    setSearchText(text);
    if (autoSearch) {
      debouncedSearch(text);
    }
  }, [autoSearch, debouncedSearch]);

  const handleClear = useCallback(() => {
    setSearchText('');
    onSearch('');
  }, [onSearch]);

  const handleSubmitEditing = useCallback(() => {
    if (!autoSearch) {
      onSearch(searchText);
    }
  }, [autoSearch, onSearch, searchText]);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={searchText}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.secondary}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {clearable && searchText && (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <View style={styles.clearIcon} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 40,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text.primary,
    ...TYPOGRAPHY.body1,
    padding: 0,
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  clearIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.text.secondary,
    opacity: 0.5,
  },
}); 