import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Input } from '../../atoms/Input';
import { BaseComponentProps } from '../../common/types';
import { COLORS } from '../../../config/theme';
import debounce from 'lodash/debounce';

export interface SearchBarProps extends BaseComponentProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoSearch?: boolean;
  clearable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  autoSearch = true,
  clearable = true,
  leftIcon,
  rightIcon,
  style,
  testID,
}) => {
  const [searchText, setSearchText] = useState(value);

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch(query);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Update local state when value prop changes
  useEffect(() => {
    setSearchText(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setSearchText(text);
    if (autoSearch) {
      debouncedSearch(text);
    }
  };

  const handleClear = () => {
    setSearchText('');
    onSearch('');
  };

  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    style,
  ];

  return (
    <Input
      value={searchText}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      style={containerStyle}
      variant="filled"
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onRightIconPress={clearable && searchText ? handleClear : undefined}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
  },
}); 