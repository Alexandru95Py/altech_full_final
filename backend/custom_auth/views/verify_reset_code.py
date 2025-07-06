from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from custom_auth.models import PasswordResetCode
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class VerifyResetCodeView(APIView):
    """
    Verifică codul de resetare parolă.
    """
    permission_classes = []

    def post(self, request):
        print("[VERIFY RESET CODE] POST called. Data:", request.data)

        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            print("[VERIFY RESET CODE] Missing email or code")
            return Response({'detail': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            print(f"[VERIFY RESET CODE] Found user: {user.email}")

            reset_code = PasswordResetCode.objects.get(user=user)
            print(f"[VERIFY RESET CODE] Code from DB: {reset_code.code}, Expired: {reset_code.is_expired()}")

            if reset_code.code == code and not reset_code.is_expired():
                print(f"[VERIFY RESET CODE] Code valid for user {user.email}")
                return Response({
                    'detail': 'Code verified successfully.',
                    'email': user.email
                }, status=status.HTTP_200_OK)
            else:
                print(f"[VERIFY RESET CODE] Invalid or expired code for user {user.email}")
                return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            print(f"[VERIFY RESET CODE] User with email {email} not found")
            return Response({'detail': 'Invalid email or code.'}, status=status.HTTP_400_BAD_REQUEST)

        except PasswordResetCode.DoesNotExist:
            print(f"[VERIFY RESET CODE] No reset code found for user {email}")
            return Response({'detail': 'No reset code found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"[VERIFY RESET CODE] Error: {e}")
            return Response({'detail': 'An error occurred. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
