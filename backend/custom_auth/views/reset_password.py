from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from custom_auth.models import PasswordResetCode
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


class ResetPasswordView(APIView):
    """
    Resetează parola utilizatorului după verificarea codului.
    """
    permission_classes = []

    def post(self, request):
        print("[RESET PASSWORD] POST called. Data:", request.data)

        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not email or not code or not new_password:
            print("[RESET PASSWORD] Missing required fields")
            return Response({'detail': 'Email, code, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            print("[RESET PASSWORD] Password too short")
            return Response({'detail': 'Password must be at least 8 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            print(f"[RESET PASSWORD] Found user: {user.email}")

            reset_code = PasswordResetCode.objects.get(user=user)
            print(f"[RESET PASSWORD] Code from DB: {reset_code.code}, Expired: {reset_code.is_expired()}")

            if reset_code.code == code and not reset_code.is_expired():
                # Resetează parola
                user.set_password(new_password)
                user.save()
                
                # Șterge codul de resetare folosit
                reset_code.delete()
                
                print(f"[RESET PASSWORD] Password updated successfully for user {user.email}")
                return Response({
                    'detail': 'Password reset successfully.',
                    'email': user.email
                }, status=status.HTTP_200_OK)
            else:
                print(f"[RESET PASSWORD] Invalid or expired code for user {user.email}")
                return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            print(f"[RESET PASSWORD] User with email {email} not found")
            return Response({'detail': 'Invalid email or code.'}, status=status.HTTP_400_BAD_REQUEST)

        except PasswordResetCode.DoesNotExist:
            print(f"[RESET PASSWORD] No reset code found for user {email}")
            return Response({'detail': 'No reset code found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"[RESET PASSWORD] Error: {e}")
            return Response({'detail': 'An error occurred. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
