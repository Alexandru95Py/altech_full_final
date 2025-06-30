from django.db import models
from django.contrib.auth import get_user_model
import uuid
import os

User = get_user_model()

def user_protected_file_path(instance, filename):
    # Generează un nume de fișier unic pentru a evita coliziunile
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('protected_documents', str(instance.user.id), filename)

class ProtectedDocument(models.Model):
    PLAN_CHOICES = [
        ('free', 'Free Plan'),
        ('pro', 'Pro Plan'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='protected_documents')
    original_filename = models.CharField(max_length=255)
    protected_file = models.FileField(upload_to=user_protected_file_path)
    password_hint = models.CharField(max_length=255, blank=True, null=True)
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.original_filename} ({self.plan})"