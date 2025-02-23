import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../../components/atoms';
import { COLORS } from '../../config/theme';

export const PeopleScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Typography variant="h1">People Screen</Typography>
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