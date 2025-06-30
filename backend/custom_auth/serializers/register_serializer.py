from rest_framework import serializers
from django.contrib.auth import get_user_model
from custom_auth.utils.email_verification import send_verification_email 

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer pentru înregistrare utilizatori ALTech PDF.
    Gestionează utilizatori existenți, trimite email cu cod și loghează detalii utile pentru debugging.
    """
    email = serializers.EmailField(validators=[])  # Dezactivează validatorul unic implicit

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def to_internal_value(self, data):
        print("[REGISTER] Incoming data:", data)
        data = data.copy()
        for field in ["first_name", "last_name"]:
            if data.get(field) is None:
                data[field] = ""
        try:
            internal = super().to_internal_value(data)
            print("[REGISTER] Internal value:", internal)
            return internal
        except Exception as e:
            print("[REGISTER] Validation error in to_internal_value:", e)
            raise

    def validate_email(self, value):
        print(f"[REGISTER] Validating email: {value}")
        user = User.objects.filter(email=value).first()
        if user:
            print(f"[REGISTER] User with email {value} exists. is_active={user.is_active}")
            if not user.is_active:
                self.instance = user  # folosim contul existent
            else:
                print(f"[REGISTER] Email {value} already registered and active.")
                raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        print("[REGISTER] Validated attrs:", attrs)
        return super().validate(attrs)

    def create(self, validated_data):
        print("[REGISTER] Creating user with data:", validated_data)
        password = validated_data.pop("password")
        user = getattr(self, 'instance', None)

        if user:
            print(f"[REGISTER] Updating user {user.email}. is_active={user.is_active}")
            user.first_name = validated_data.get("first_name", "")
            user.last_name = validated_data.get("last_name", "")
            user.set_password(password)
            user.is_active = False  # 🔥 asigurăm că va primi codul
            user.save()
            print("[DEBUG] send_verification_email() a fost apelată pentru user existent")
            send_verification_email(user)
            return user

        print(f"[REGISTER] Creating new inactive user {validated_data.get('email')}")
        user = User(is_active=False, **validated_data)
        user.set_password(password)
        user.save()
        print("[DEBUG] send_verification_email() a fost apelată pentru user nou")
        send_verification_email(user)
        return user
