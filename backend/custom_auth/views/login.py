from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid email or password")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        self.user = user  # necesar pentru super().validate
        data = super().validate(attrs)

        # Creează obiectul user așa cum îl așteaptă frontendul
        user_data = {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "plan": getattr(user, "plan", "free")
        }

        return {
            "access": data["access"],
            "refresh": data["refresh"],
            "user": user_data
        }

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer