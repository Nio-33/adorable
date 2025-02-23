import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Loading } from '../components/atoms';
import { COLORS } from '../config/theme';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Loading size="large" text="Loading..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
}); 