import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { FormProvider } from './FormContext';
import { BaseComponentProps } from '../../common/types';
import { SPACING } from '../../../config/theme';

export interface FormProps extends BaseComponentProps {
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  children: React.ReactNode;
  spacing?: keyof typeof SPACING;
}

export const Form: React.FC<FormProps> = ({
  initialValues,
  onSubmit,
  children,
  spacing = 'md',
  style,
  testID,
}) => {
  const containerStyle: StyleProp<ViewStyle> = [
    styles.container,
    { gap: SPACING[spacing] },
    style,
  ];

  return (
    <FormProvider initialValues={initialValues}>
      <View style={containerStyle} testID={testID}>
        {children}
      </View>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
}); 