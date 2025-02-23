from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from firebase_admin import auth as firebase_auth
from django.conf import settings

User = get_user_model()

class FirebaseAuthenticationBackend(BaseBackend):
    """Custom authentication backend for Firebase"""

    def authenticate(self, request, firebase_token=None):
        """Authenticate a user using Firebase token"""
        if not firebase_token:
            return None

        try:
            # Verify the Firebase token
            decoded_token = firebase_auth.verify_id_token(firebase_token)
            firebase_uid = decoded_token['uid']

            try:
                # Try to get existing user
                user = User.objects.get(firebase_uid=firebase_uid)
                
                # Update user information if needed
                if decoded_token.get('email') and user.email != decoded_token['email']:
                    user.email = decoded_token['email']
                    user.save()
                
                return user

            except User.DoesNotExist:
                # Create new user if doesn't exist
                email = decoded_token.get('email', '')
                username = email.split('@')[0] if email else f"user_{firebase_uid[:8]}"
                
                user = User.objects.create(
                    username=username,
                    email=email,
                    firebase_uid=firebase_uid,
                    is_active=True
                )

                # Set additional fields if available
                if decoded_token.get('phone_number'):
                    user.phone_number = decoded_token['phone_number']
                if decoded_token.get('name'):
                    user.first_name = decoded_token['name']
                if decoded_token.get('picture'):
                    user.profile_picture = decoded_token['picture']
                
                user.save()
                return user

        except firebase_auth.InvalidIdTokenError:
            return None
        except Exception as e:
            print(f"Firebase authentication error: {str(e)}")
            return None

    def get_user(self, user_id):
        """Get user by ID"""
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def user_can_authenticate(self, user):
        """Check if user can authenticate"""
        is_active = getattr(user, 'is_active', None)
        return is_active or is_active is None 