import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { AdorableLogo } from '../../components/common/AdorableLogo';

type OTPVerificationScreenProps = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, value, onChange }) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    onChange(otp.join(''));
  }, [otp, onChange]);

  const handleChange = (text: string, index: number) => {
    if (isNaN(Number(text))) {return;}

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Focus previous input on backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => ref && (inputRefs.current[index] = ref)}
          style={styles.otpInput}
          keyboardType="numeric"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectionColor={colors.white}
        />
      ))}
    </View>
  );
};

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { email, purpose } = route.params;
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer > 0 && isResending) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsResending(false);
    }
  }, [timer, isResending]);

  const handleResendOTP = async () => {
    try {
      setError(null);
      setTimer(30);
      setIsResending(true);

      // Implement your resend OTP logic here
      // For now, we'll just simulate success
      setTimeout(() => {
        Alert.alert(
          'Code Sent',
          'A new verification code has been sent to your email.'
        );
      }, 1000);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setError(null);
      setIsVerifying(true);

      // Implement your verification logic here
      // For now, we'll just simulate success
      setTimeout(() => {
        if (purpose === 'registration') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          Alert.alert(
            'Success',
            'Your account has been verified. Please log in.'
          );
        } else {
          navigation.navigate('ForgotPassword');
        }
      }, 1000);
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <AdorableLogo width={96} height={96} />
          <Text style={styles.title}>Adorable</Text>
          <Text style={styles.subtitle}>Verify your account</Text>
        </View>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter verification code</Text>
          <Text style={styles.cardSubtitle}>
            We've sent a 6-digit code to {email}
          </Text>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={styles.otpWrapper}>
            <OTPInput length={6} value={otp} onChange={setOtp} />
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.length !== 6 || isVerifying) && styles.verifyButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {isResending ? (
              <Text style={styles.timerText}>Resend code in {timer}s</Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isVerifying}
              >
                <Text style={styles.resendButtonText}>Resend Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.indigo[950],
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 16,
    zIndex: 1,
    padding: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 24,
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.white,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.indigo[300],
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: colors.indigo[900],
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: colors.white,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.indigo[300],
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: colors.indigo[800],
    borderWidth: 1,
    borderColor: colors.indigo[700],
    borderRadius: 12,
    color: colors.white,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: fonts.bold,
  },
  otpWrapper: {
    marginBottom: 32,
  },
  verifyButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  resendContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    color: colors.indigo[300],
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  timerText: {
    color: colors.white,
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  resendButtonText: {
    color: colors.blue[400],
    marginTop: 8,
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  errorText: {
    color: colors.error,
    fontSize: fonts.sm,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default OTPVerificationScreen;
