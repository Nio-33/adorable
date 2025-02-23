import json
from typing import Any, Dict, List, Optional, Union
from firebase_admin import initialize_app, messaging, db, credentials, auth
from django.conf import settings

class FirebaseService:
    """Service for Firebase operations including real-time database and messaging"""
    
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        if not auth._apps:
            # Load credentials from settings
            cred_dict = json.loads(settings.FIREBASE_CREDENTIALS)
            cred = credentials.Certificate(cred_dict)
            initialize_app(cred)

    def verify_token(self, id_token: str) -> dict:
        """Verify Firebase ID token"""
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid Firebase token: {str(e)}")

    def send_notification(
        self,
        user_ids: Union[str, List[str]],
        title: str,
        body: str,
        data: Optional[Dict] = None
    ) -> dict:
        """Send push notification to users"""
        if isinstance(user_ids, str):
            user_ids = [user_ids]

        # Get user tokens
        tokens = []
        for uid in user_ids:
            try:
                user = auth.get_user(uid)
                if hasattr(user, 'registration_tokens'):
                    tokens.extend(user.registration_tokens)
            except auth.UserNotFoundError:
                continue

        if not tokens:
            return {'success': False, 'error': 'No valid tokens found'}

        # Create message
        message = messaging.MulticastMessage(
            tokens=tokens,
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            android=messaging.AndroidConfig(
                priority='high',
                notification=messaging.AndroidNotification(
                    sound='default',
                    click_action='FLUTTER_NOTIFICATION_CLICK'
                )
            ),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        sound='default',
                        badge=1
                    )
                )
            )
        )

        try:
            # Send message
            response = messaging.send_multicast(message)
            return {
                'success': True,
                'success_count': response.success_count,
                'failure_count': response.failure_count
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def create_custom_token(self, uid: str, claims: Optional[Dict] = None) -> str:
        """Create a custom Firebase token"""
        try:
            return auth.create_custom_token(uid, claims)
        except Exception as e:
            raise ValueError(f"Error creating custom token: {str(e)}")

    def get_user_by_email(self, email: str) -> dict:
        """Get Firebase user by email"""
        try:
            user = auth.get_user_by_email(email)
            return {
                'uid': user.uid,
                'email': user.email,
                'phone_number': user.phone_number,
                'email_verified': user.email_verified,
                'display_name': user.display_name,
                'photo_url': user.photo_url,
                'disabled': user.disabled
            }
        except auth.UserNotFoundError:
            return None

    def update_user(self, uid: str, properties: Dict) -> dict:
        """Update Firebase user properties"""
        try:
            user = auth.update_user(
                uid,
                **properties
            )
            return {
                'uid': user.uid,
                'email': user.email,
                'phone_number': user.phone_number,
                'email_verified': user.email_verified,
                'display_name': user.display_name,
                'photo_url': user.photo_url,
                'disabled': user.disabled
            }
        except auth.UserNotFoundError:
            return None

    def delete_user(self, uid: str) -> bool:
        """Delete Firebase user"""
        try:
            auth.delete_user(uid)
            return True
        except auth.UserNotFoundError:
            return False

    def send_verification_code(self, phone_number: str) -> dict:
        """Send phone verification code"""
        try:
            verification_id = auth.send_verification_code(phone_number)
            return {
                'success': True,
                'verification_id': verification_id
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def verify_phone_number(self, verification_id: str, code: str) -> dict:
        """Verify phone number with code"""
        try:
            result = auth.verify_phone_number(verification_id, code)
            return {
                'success': True,
                'phone_number': result.phone_number
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def send_push_notification(
        self,
        token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> bool:
        """Send push notification to a specific device"""
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data,
                token=token
            )
            messaging.send(message)
            return True
        except Exception as e:
            print(f"Error sending push notification: {str(e)}")
            return False

    def send_multicast_notification(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> messaging.BatchResponse:
        """Send push notification to multiple devices"""
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=data,
            tokens=tokens
        )
        return messaging.send_multicast(message)

    def save_realtime_data(self, path: str, data: Any) -> None:
        """Save data to Firebase Realtime Database"""
        ref = db.reference(path)
        ref.set(data)

    def update_realtime_data(self, path: str, data: Dict[str, Any]) -> None:
        """Update data in Firebase Realtime Database"""
        ref = db.reference(path)
        ref.update(data)

    def get_realtime_data(self, path: str) -> Any:
        """Get data from Firebase Realtime Database"""
        ref = db.reference(path)
        return ref.get()

    def delete_realtime_data(self, path: str) -> None:
        """Delete data from Firebase Realtime Database"""
        ref = db.reference(path)
        ref.delete()

    def create_user_presence(self, user_id: str) -> None:
        """Set up user presence tracking"""
        ref = db.reference(f'presence/{user_id}')
        ref.set({
            'status': 'online',
            'last_seen': {'.sv': 'timestamp'}
        })

    def update_user_status(self, user_id: str, status: str) -> None:
        """Update user's online status"""
        ref = db.reference(f'presence/{user_id}')
        ref.update({
            'status': status,
            'last_seen': {'.sv': 'timestamp'}
        })

    def save_chat_message(
        self,
        chat_id: str,
        message: Dict[str, Any]
    ) -> str:
        """Save a chat message to Firebase"""
        ref = db.reference(f'chats/{chat_id}/messages')
        message['timestamp'] = {'.sv': 'timestamp'}
        new_ref = ref.push(message)
        return new_ref.key

    def get_chat_messages(
        self,
        chat_id: str,
        limit: int = 50
    ) -> Dict[str, Any]:
        """Get recent chat messages"""
        ref = db.reference(f'chats/{chat_id}/messages')
        return ref.order_by_child('timestamp').limit_to_last(limit).get()

    def mark_message_read(
        self,
        chat_id: str,
        message_id: str,
        user_id: str
    ) -> None:
        """Mark a message as read by a user"""
        ref = db.reference(f'chats/{chat_id}/messages/{message_id}/read_by/{user_id}')
        ref.set({'.sv': 'timestamp'})

# Create singleton instance
firebase_service = FirebaseService() 