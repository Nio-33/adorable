import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../config/theme';
import { Typography, Button } from '../../components/atoms';
import { Form, FormField } from '../../components/molecules';
import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface LoginForm {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values: Record<string, any>) => {
    try {
      const { email, password } = values as LoginForm;
      await signIn(email, password);
    } catch (err) {
      // Error is handled by useAuth hook
    }
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          Welcome Back
        </Typography>

        <Typography
          variant="body1"
          color={COLORS.text.secondary}
          style={styles.subtitle}
        >
          Sign in to continue
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
          initialValues={{ email: '', password: '' }}
          onSubmit={handleLogin}
          style={styles.form}
        >
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

          <Button
            variant="text"
            onPress={() => {}}
            style={styles.forgotPassword}
          >
            Forgot Password?
          </Button>

          <Button
            onPress={() => {}}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            Sign In
          </Button>
        </Form>

        <View style={styles.footer}>
          <Typography variant="body2" color={COLORS.text.secondary}>
            Don't have an account?{' '}
          </Typography>
          <Button
            variant="text"
            onPress={() => navigation.navigate('SignUp')}
          >
            Sign Up
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
});
