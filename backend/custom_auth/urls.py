from django.urls import path
from .views.register import RegisterView
from .views import MeView
from .views.change_password import ChangePasswordView
from .views.login import LoginView
from custom_auth.views.verify_code import VerifyEmailCodeView
from custom_auth.views.forgot_password import ForgotPasswordView
from custom_auth.views.verify_reset_code import VerifyResetCodeView
from custom_auth.views.reset_password import ResetPasswordView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    path('verify-email/', VerifyEmailCodeView.as_view(), name='verify-email'),
    
    # Forgot Password endpoints
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-reset-code/', VerifyResetCodeView.as_view(), name='verify-reset-code'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
]
