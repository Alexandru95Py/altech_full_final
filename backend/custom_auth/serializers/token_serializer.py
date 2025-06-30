# auth/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        print("DEBUG validate() called with", email, password)

        user = authenticate(email=email, password=password)

        if user is None:
            raise serializers.ValidationError(_("Invalid email or password"))

        attrs["username"] = user.username  # IMPORTANT pentru JWT
        data = super().validate(attrs)

        data["user"] = {
            "id": user.id,
            "email": user.email,
        }
        return data
