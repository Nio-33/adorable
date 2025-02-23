import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Google from 'expo-auth-session/providers/google';
import * as FacebookAuth from 'expo-auth-session/providers/facebook';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import Svg, { Circle, Path } from 'react-native-svg';
import { getGoogleLoginConfig } from '@/config/auth';
import { getFacebookLoginConfig } from '@/config/facebook';
import { AuthScreenProps } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const AdorableLogo = () => (
  <Svg width={80} height={80} viewBox="0 0 200 200">
    <Circle cx="100" cy="100" r="90" fill="#000080"/>
    <Circle cx="70" cy="85" r="8" fill="white" />
    <Circle cx="130" cy="85" r="8" fill="white" />
    <Path d="M70 130 Q100 160 130 130" stroke="white" strokeWidth="8" fill="none" />
    <Path d="M100 40 C60 40, 40 70, 40 100 C40 140, 100 160, 100 180 C100 160, 160 140, 160 100 C160 70, 140 40, 100 40"
          fill="none"
          stroke="white"
          strokeWidth="8"/>
  </Svg>
);

const RegisterScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationDigits, setVerificationDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const inputRefs = useRef<Array<TextInput | null>>(new Array(6).fill(null));
  const [request, response, promptAsync] = Google.useAuthRequest(getGoogleLoginConfig());
  const [fbRequest, fbResponse, fbPromptAsync] = FacebookAuth.useAuthRequest(getFacebookLoginConfig());
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  // Add refs for TextInputs
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Handle return key press
  const handleNameSubmitEditing = () => {
    emailInputRef.current?.focus();
  };

  const handleEmailSubmitEditing = () => {
    phoneInputRef.current?.focus();
  };

  const handlePhoneSubmitEditing = () => {
    passwordInputRef.current?.focus();
  };

  const handlePasswordSubmitEditing = () => {
    confirmPasswordInputRef.current?.focus();
  };

  const handleConfirmPasswordSubmitEditing = () => {
    Keyboard.dismiss();
    handleRegister();
  };

  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    try {
      setIsVerifying(true);
      // Temporarily commented out for testing UI
      // const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      // const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
      // setVerificationId(confirmation.verificationId);
      setVerificationId('dummy-id'); // Temporary for UI testing
      Alert.alert('Success', 'Verification code has been sent to your phone');
    } catch (error: any) {
      console.error('Phone verification error:', error);
      Alert.alert('Error', error.message || 'Failed to send verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      setIsVerifying(true);
      // Temporarily commented out for testing UI
      // const credential = auth.PhoneAuthProvider.credential(verificationId, verificationCode);
      // await auth().currentUser?.linkWithCredential(credential);
      setIsPhoneVerified(true);
      Alert.alert('Success', 'Phone number verified successfully');
    } catch (error: any) {
      console.error('Code verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify code');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerificationDigitChange = (index: number, value: string) => {
    if (value.length > 1) {return;} // Only allow single digits

    const newDigits = [...verificationDigits];
    newDigits[index] = value;
    setVerificationDigits(newDigits);

    // Combine digits for the verification code
    setVerificationCode(newDigits.join(''));

    // Auto-focus next input or previous if deleting
    if (value !== '') {
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRegister = async () => {
    try {
      // Validate inputs
      if (!name || !email || !password || !confirmPassword || !phoneNumber) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (!isPhoneVerified) {
        Alert.alert('Error', 'Please verify your phone number');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      // Create user
      setUser({
        id: String(Date.now()),
        email,
        name,
        phoneNumber,
      });

      // Navigate to login screen
      navigation.navigate('Login');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Error',
        'Failed to create account. Please try again.'
      );
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      const result = await promptAsync();

      if (result.type === 'success' && result.authentication?.idToken) {
        const credential = auth.GoogleAuthProvider.credential(result.authentication.idToken);
        const userCredential = await auth().signInWithCredential(credential);
        const firebaseUser = userCredential.user;

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
          hasCompletedSetup: false,
        });

        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Google sign-up error:', error);
      Alert.alert('Error', 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    try {
      setLoading(true);
      const result = await fbPromptAsync();

      if (result.type === 'success' && result.authentication?.accessToken) {
        const credential = auth.FacebookAuthProvider.credential(result.authentication.accessToken);
        const userCredential = await auth().signInWithCredential(credential);
        const firebaseUser = userCredential.user;

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
          hasCompletedSetup: false,
        });

        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Facebook sign-up error:', error);
      Alert.alert('Error', 'Failed to sign up with Facebook');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <AdorableLogo />
              <Text style={styles.title}>Adorable</Text>
              <Text style={styles.subtitle}>Discover Lagos, together.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  ref={nameInputRef}
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#6b7280"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={handleNameSubmitEditing}
                  blurOnSubmit={false}
                  autoFocus={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  ref={emailInputRef}
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#6b7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={handleEmailSubmitEditing}
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneContainer}>
                  <TextInput
                    ref={phoneInputRef}
                    style={styles.phoneInput}
                    placeholder="Enter phone number (e.g., +2348012345678)"
                    placeholderTextColor="#6b7280"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onSubmitEditing={handlePhoneSubmitEditing}
                    blurOnSubmit={false}
                    editable={!isPhoneVerified}
                  />
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      (isVerifying || isPhoneVerified) && styles.verifyButtonDisabled,
                    ]}
                    onPress={handleSendVerificationCode}
                    disabled={isVerifying || isPhoneVerified}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.verifyButtonText}>
                        {isPhoneVerified ? 'Verified' : 'Verify'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {verificationId && !isPhoneVerified && (
                <View style={styles.verificationContainer}>
                  <View style={styles.verificationIconContainer}>
                    <View style={styles.verificationIcon}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  </View>

                  <Text style={styles.verificationTitle}>Verification Code</Text>
                  <Text style={styles.verificationSubtitle}>
                    We've sent a verification code to{'\n'}
                    {phoneNumber}
                  </Text>

                  <View style={styles.codeInputContainer}>
                    {verificationDigits.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={ref => inputRefs.current[index] = ref}
                        style={styles.codeInput}
                        value={digit}
                        onChangeText={(value) => handleVerificationDigitChange(index, value)}
                        keyboardType="number-pad"
                        maxLength={1}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                    onPress={handleVerifyCode}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleSendVerificationCode}
                    disabled={isVerifying}
                  >
                    <Text style={styles.resendButtonText}>Resend Code</Text>
                  </TouchableOpacity>

                  <View style={styles.helpContainer}>
                    <Text style={styles.helpText}>Didn't receive the code? </Text>
                    <TouchableOpacity>
                      <Text style={styles.helpLink}>Get Help</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    placeholderTextColor="#6b7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    onSubmitEditing={handlePasswordSubmitEditing}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={confirmPasswordInputRef}
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#6b7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmPasswordSubmitEditing}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#6b7280" />
                    ) : (
                      <Eye size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleSignUp}
                >
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleFacebookSignUp}
                >
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.signInText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms and Privacy Text */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink} onPress={() => Alert.alert('Terms', 'Terms of Service will be available soon.')}>
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text style={styles.termsLink} onPress={() => Alert.alert('Privacy', 'Privacy Policy will be available soon.')}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    width: '100%',
    backgroundColor: '#312e81',
    padding: 20,
    borderRadius: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4338ca',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#1e1b4b',
    color: '#ffffff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 10,
    backgroundColor: '#1e1b4b',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#ffffff',
  },
  eyeIcon: {
    padding: 15,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#4338ca',
  },
  dividerText: {
    color: '#94a3b8',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1b4b',
    borderWidth: 1,
    borderColor: '#4338ca',
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  signInText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4338ca',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#1e1b4b',
    color: '#ffffff',
  },
  verifyButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  verificationContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    marginBottom: 20,
  },
  verificationIconContainer: {
    marginBottom: 24,
  },
  verificationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#312e81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#3b82f6',
    fontSize: 32,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  codeInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 8,
    backgroundColor: '#312e81',
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 16,
    padding: 12,
  },
  resendButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  helpContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  helpText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  helpLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  termsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  termsText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
  },
  termsLink: {
    color: '#000080',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
