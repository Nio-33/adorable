from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    LogoutView,
    ProfileView,
    PasswordResetView,
    EmailVerificationView,
)

app_name = 'users'

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/reset-password/', PasswordResetView.as_view(), name='reset_password'),
    path('auth/verify-email/', EmailVerificationView.as_view(), name='verify_email'),
] 