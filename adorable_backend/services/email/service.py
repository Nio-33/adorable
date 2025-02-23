from typing import List, Dict, Optional
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.core.mail import get_connection
from django.core.mail.backends.smtp import EmailBackend

class EmailService:
    """Service for handling email operations"""

    def __init__(self):
        """Initialize email service"""
        self.from_email = settings.EMAIL_FROM
        self.connection = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True
        )

    def send_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict,
        attachments: Optional[List[Dict]] = None
    ) -> bool:
        """Send a single email"""
        try:
            # Render HTML content
            html_content = render_to_string(template_name, context)
            text_content = strip_tags(html_content)

            # Create message
            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=self.from_email,
                to=[to_email],
                connection=self.connection
            )

            # Attach HTML content
            msg.attach_alternative(html_content, "text/html")

            # Add attachments if any
            if attachments:
                for attachment in attachments:
                    msg.attach(
                        filename=attachment['filename'],
                        content=attachment['content'],
                        mimetype=attachment['mimetype']
                    )

            # Send email
            return msg.send() > 0

        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    def send_bulk_email(
        self,
        recipients: List[Dict],
        subject: str,
        template_name: str,
        default_context: Dict = None,
        attachments: Optional[List[Dict]] = None
    ) -> Dict:
        """Send bulk emails"""
        try:
            messages = []
            default_context = default_context or {}

            for recipient in recipients:
                # Merge default context with recipient-specific context
                context = {**default_context, **recipient.get('context', {})}
                
                # Render content
                html_content = render_to_string(template_name, context)
                text_content = strip_tags(html_content)

                # Create message
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=self.from_email,
                    to=[recipient['email']],
                    connection=self.connection
                )

                # Attach HTML content
                msg.attach_alternative(html_content, "text/html")

                # Add attachments if any
                if attachments:
                    for attachment in attachments:
                        msg.attach(
                            filename=attachment['filename'],
                            content=attachment['content'],
                            mimetype=attachment['mimetype']
                        )

                messages.append(msg)

            # Send all emails
            sent_count = sum(1 for msg in messages if msg.send() > 0)
            
            return {
                'total': len(messages),
                'sent': sent_count,
                'failed': len(messages) - sent_count
            }

        except Exception as e:
            print(f"Error sending bulk email: {str(e)}")
            return {
                'total': len(recipients),
                'sent': 0,
                'failed': len(recipients),
                'error': str(e)
            }

    def send_welcome_email(self, user_email: str, username: str) -> bool:
        """Send welcome email to new user"""
        return self.send_email(
            to_email=user_email,
            subject="Welcome to Adorable!",
            template_name="emails/welcome.html",
            context={
                'username': username,
                'login_url': settings.FRONTEND_URL + '/login',
                'help_url': settings.FRONTEND_URL + '/help'
            }
        )

    def send_password_reset(self, user_email: str, reset_url: str) -> bool:
        """Send password reset email"""
        return self.send_email(
            to_email=user_email,
            subject="Reset Your Password",
            template_name="emails/password_reset.html",
            context={
                'reset_url': reset_url,
                'valid_hours': 24
            }
        )

    def send_verification_email(self, user_email: str, verify_url: str) -> bool:
        """Send email verification"""
        return self.send_email(
            to_email=user_email,
            subject="Verify Your Email",
            template_name="emails/verify_email.html",
            context={
                'verify_url': verify_url,
                'valid_hours': 48
            }
        )

    def send_notification_email(
        self,
        user_email: str,
        notification_type: str,
        context: Dict
    ) -> bool:
        """Send notification email"""
        template_map = {
            'new_message': 'emails/notifications/new_message.html',
            'new_connection': 'emails/notifications/new_connection.html',
            'place_review': 'emails/notifications/place_review.html',
            'nearby_event': 'emails/notifications/nearby_event.html'
        }

        template_name = template_map.get(notification_type)
        if not template_name:
            raise ValueError(f"Unknown notification type: {notification_type}")

        return self.send_email(
            to_email=user_email,
            subject=context.get('subject', 'New Notification'),
            template_name=template_name,
            context=context
        )

# Create singleton instance
email_service = EmailService() 