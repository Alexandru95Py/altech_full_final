from rest_framework import generics, status
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ..serializers.register_serializer import RegisterSerializer
from custom_auth.utils.email_verification import send_verification_email

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        print(f"[REGISTER] User created with email: {user.email}")
        try:
            print("[REGISTER] Calling send_verification_email()")
            send_verification_email(user)
        except Exception as e:
            print(f"[REGISTER] Failed to send verification email: {e}")

    def post(self, request, *args, **kwargs):
        print("[REGISTER VIEW] POST called. Data:", request.data)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        self.perform_create(serializer)
        user = serializer.instance  # ca să accesăm userul în response

        response_data = {
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "message": "Registration successful. Please check your email for the verification code."
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
