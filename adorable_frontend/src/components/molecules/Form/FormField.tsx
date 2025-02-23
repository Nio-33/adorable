import React, { useCallback } from 'react';
import { Input, InputProps } from '../../atoms/Input';
import { useForm } from './FormContext';

export interface FormFieldProps extends Omit<InputProps, 'value' | 'onChangeText'> {
  name: string;
  validate?: (value: string) => string | undefined;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  validate,
  ...inputProps
}) => {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldError,
    setFieldTouched,
  } = useForm();

  const handleChange = useCallback((text: string) => {
    setFieldValue(name, text);
    if (validate) {
      const error = validate(text);
      if (error) {
        setFieldError(name, error);
      } else {
        setFieldError(name, '');
      }
    }
  }, [name, setFieldValue, setFieldError, validate]);

  const handleFocus = useCallback(() => {
    setFieldTouched(name, true);
  }, [name, setFieldTouched]);

  const showError = touched[name] && errors[name];

  return (
    <Input
      {...inputProps}
      value={values[name] || ''}
      onChangeText={handleChange}
      onFocus={handleFocus}
      error={showError ? errors[name] : undefined}
    />
  );
};
