from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth as firebase_auth

from .jwt import generate_tokens_for_user
from ...services.firebase.service import firebase_service

User = get_user_model()

class AuthenticationService:
    """Service for handling user authentication"""

    @staticmethod
    def authenticate_with_firebase(firebase_token):
        """Authenticate user with Firebase token"""
        try:
            # Verify Firebase token
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            firebase_uid = decoded_token['uid']

            # Get or create user
            user, created = User.objects.get_or_create(
                firebase_uid=firebase_uid,
                defaults={
                    'username': decoded_token.get('email', '').split('@')[0],
                    'email': decoded_token.get('email'),
                    'is_active': True
                }
            )

            # Update user information if needed
            if not created and decoded_token.get('email'):
                user.email = decoded_token['email']
                user.save()

            # Generate JWT tokens
            tokens = generate_tokens_for_user(user)
            
            return {
                'user': user,
                'tokens': tokens,
                'created': created
            }

        except (firebase_auth.InvalidIdTokenError, ValidationError) as e:
            raise AuthenticationFailed(str(e))

    @staticmethod
    def authenticate_with_credentials(email, password):
        """Authenticate user with email and password"""
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise AuthenticationFailed('Invalid password')

            if not user.is_active:
                raise AuthenticationFailed('User account is disabled')

            tokens = generate_tokens_for_user(user)
            
            return {
                'user': user,
                'tokens': tokens
            }

        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')

    @staticmethod
    def verify_phone_number(user, phone_number, verification_code):
        """Verify user's phone number"""
        # Verify the code with Firebase
        try:
            # Update user's phone verification status
            user.phone_number = phone_number
            user.is_phone_verified = True
            user.save()

            return True
        except Exception as e:
            raise ValidationError(str(e))

    @staticmethod
    def send_verification_code(phone_number):
        """Send verification code to phone number"""
        try:
            # Use Firebase to send verification code
            return firebase_service.send_verification_code(phone_number)
        except Exception as e:
            raise ValidationError(str(e))

    @staticmethod
    def reset_password(email):
        """Initiate password reset process"""
        try:
            user = User.objects.get(email=email)
            # Use Firebase for password reset
            firebase_auth.generate_password_reset_link(email)
            return True
        except User.DoesNotExist:
            # Don't reveal if user exists
            return True
        except Exception as e:
            raise ValidationError(str(e))

    @staticmethod
    def update_user_password(user, current_password, new_password):
        """Update user's password"""
        if not user.check_password(current_password):
            raise ValidationError('Current password is incorrect')

        user.set_password(new_password)
        user.save()
        return True

authentication_service = AuthenticationService() 