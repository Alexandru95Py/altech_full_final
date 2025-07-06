from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from custom_auth.utils.email_verification import send_password_reset_email
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class ForgotPasswordView(APIView):
    """
    Trimite cod de resetare parolă către email-ul utilizatorului.
    """
    permission_classes = []

    def post(self, request):
        print("[FORGOT PASSWORD] POST called. Data:", request.data)

        email = request.data.get('email')

        if not email:
            print("[FORGOT PASSWORD] Missing email")
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            print(f"[FORGOT PASSWORD] Found user: {user.email}")

            # Trimite codul de resetare
            send_password_reset_email(user)
            print(f"[FORGOT PASSWORD] Reset code sent to {user.email}")

            return Response({
                'detail': 'Password reset code sent successfully.',
                'email': user.email
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            print(f"[FORGOT PASSWORD] User with email {email} not found")
            # Pentru securitate, nu dezvăluim că user-ul nu există
            return Response({
                'detail': 'Password reset code sent successfully.',
                'email': email
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"[FORGOT PASSWORD] Error: {e}")
            return Response({'detail': 'An error occurred. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
