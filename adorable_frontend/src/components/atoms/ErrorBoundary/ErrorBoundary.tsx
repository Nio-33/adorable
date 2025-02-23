import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { Button } from '../Button';
import { COLORS, SPACING } from '../../../config/theme';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to your error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.container}>
          <Typography variant="h4" style={styles.title}>
            Something went wrong
          </Typography>
          <Typography
            variant="body1"
            color={COLORS.text.secondary}
            style={styles.message}
          >
            {error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button onPress={this.handleReset}>Try Again</Button>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
}); 