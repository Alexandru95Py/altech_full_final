from django.urls import path
from .views.register import RegisterView
from .views import MeView
from .views.change_password import ChangePasswordView
from .views.login import LoginView
from custom_auth.views.verify_code import VerifyEmailCodeView

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
]
