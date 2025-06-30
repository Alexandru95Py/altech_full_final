from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from custom_auth.models import EmailVerificationCode

User = get_user_model()


class VerifyEmailCodeView(APIView):
    permission_classes = []

    def post(self, request):
        print("[VERIFY EMAIL] POST called. Data:", request.data)

        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            print("[VERIFY EMAIL] Missing email or code")
            return Response({'detail': 'Email and code are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            print(f"[VERIFY EMAIL] Found user: {user.email}, is_active={user.is_active}")

            verification = EmailVerificationCode.objects.get(user=user)
            print(f"[VERIFY EMAIL] Code from DB: {verification.code}, Expired: {verification.is_expired()}")

            if verification.code == code and not verification.is_expired():
                user.is_active = True
                user.save()
                verification.delete()
                print(f"[VERIFY EMAIL] Code valid. User {user.email} activated.")
                return Response({'detail': 'Email verified successfully.'}, status=status.HTTP_200_OK)
            else:
                print(f"[VERIFY EMAIL] Invalid or expired code for user {user.email}")
                return Response({'detail': 'Invalid or expired code.'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            print(f"[VERIFY EMAIL] User not found: {email}")
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        except EmailVerificationCode.DoesNotExist:
            print(f"[VERIFY EMAIL] Verification code not found for: {email}")
            return Response({'detail': 'Verification code not found.'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(f"[VERIFY EMAIL] Unexpected error: {e}")
            return Response({'detail': 'Unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
