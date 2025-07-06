from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.utils.timezone import make_aware, is_naive, now as tz_now






class EmailVerificationCode(models.Model):
    from django.conf import settings

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_verification"
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        now = timezone.now().replace(microsecond=0)

        if is_naive(self.created_at):
            created = make_aware(self.created_at).replace(microsecond=0)
            print("[DEBUG] created_at era naive, a fost convertit cu make_aware()")
        else:
            created = self.created_at.replace(microsecond=0)

        expired = now > created + timedelta(minutes=10)

        print(f"[DEBUG] now: {now}, created: {created}, expired: {expired}")
        return expired

class PasswordResetCode(models.Model):
    from django.conf import settings

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset"
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        now = timezone.now().replace(microsecond=0)

        if is_naive(self.created_at):
            created = make_aware(self.created_at).replace(microsecond=0)
        else:
            created = self.created_at.replace(microsecond=0)

        expired = now > created + timedelta(minutes=10)
        return expired

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Adresa de email este necesară")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    is_premium = models.BooleanField(default=False)

    PLAN_CHOICES = [
        ('free', 'Free'),
        ('pro', 'Pro'),
    ]
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free')

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []