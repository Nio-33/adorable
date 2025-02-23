import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button } from '../../components/atoms';
import { Form, FormField, useForm } from '../../components/molecules';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface SignUpForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { signUp, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async (values: Record<string, any>) => {
    try {
      const { username, email, password } = values as SignUpForm;
      await signUp(email, password, username);
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const validateUsername = (value: string): string | undefined => {
    if (!value) {return 'Username is required';}
    if (value.length < 3) {return 'Username must be at least 3 characters';}
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value) {return 'Email is required';}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {return 'Invalid email address';}
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {return 'Password is required';}
    if (value.length < 8) {return 'Password must be at least 8 characters';}
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    const { values } = useForm();
    if (!value) {return 'Please confirm your password';}
    if (value !== values.password) {return 'Passwords do not match';}
    return undefined;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          Create Account
        </Typography>

        <Typography
          variant="body1"
          color={COLORS.text.secondary}
          style={styles.subtitle}
        >
          Join our community
        </Typography>

        {error && (
          <Typography
            variant="body2"
            color={COLORS.status.error}
            style={styles.error}
          >
            {error}
          </Typography>
        )}

        <Form
          initialValues={{
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          onSubmit={handleSignUp}
          style={styles.form}
        >
          <FormField
            name="username"
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect={false}
            validate={validateUsername}
          />

          <FormField
            name="email"
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            validate={validateEmail}
          />

          <FormField
            name="password"
            placeholder="Password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            validate={validatePassword}
            rightIcon={
              <Button
                variant="text"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            }
          />

          <FormField
            name="confirmPassword"
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            validate={validateConfirmPassword}
            rightIcon={
              <Button
                variant="text"
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Button>
            }
          />

          <Button
            onPress={() => {}}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            Sign Up
          </Button>
        </Form>

        <View style={styles.footer}>
          <Typography variant="body2" color={COLORS.text.secondary}>
            Already have an account?{' '}
          </Typography>
          <Button
            variant="text"
            onPress={() => navigation.navigate('Login')}
          >
            Sign In
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  title: {
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.md,
  },
  error: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
});
