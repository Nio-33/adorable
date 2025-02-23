import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PrivacySettingsScreen } from '../screens/settings/PrivacySettingsScreen';

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('PrivacySettingsScreen', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithNavigation(<PrivacySettingsScreen />);
    expect(getByText('Privacy Settings')).toBeTruthy();
  });
}); 