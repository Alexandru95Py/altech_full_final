from django.db import models
from django.contrib.auth import get_user_model
import os
import uuid

User = get_user_model()

def user_file_path(instance, filename):
    user_folder = f"{instance.user.id}"
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    return os.path.join('uploads', user_folder, unique_filename)

def encrypted_file_path(instance, filename):
    return f'encrypted/{instance.user.id}/{uuid.uuid4().hex}_{filename}'


class File(models.Model):
    """
    Fișiere încărcate de utilizatori (My Files).
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to=user_file_path)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    extension = models.CharField(max_length=10, blank=True, null=True)
    size = models.PositiveIntegerField(blank=True, null=True)  # bytes

    def save(self, *args, **kwargs):
        if self.file:
            self.name = os.path.basename(self.file.name)
            self.extension = os.path.splitext(self.file.name)[1].lower().replace('.', '')
            self.size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.user.username})"


class ProtectedDocument(models.Model):
    """
    Fișiere criptate de utilizator.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='protected_documents')
    original_filename = models.CharField(max_length=255)
    encrypted_file = models.FileField(upload_to=encrypted_file_path, blank=True, null=True)

    file_type = models.CharField(max_length=10, default='pdf')
    protection_level = models.CharField(
        max_length=50,
        choices=[('standard', 'Standard'), ('advanced', 'Advanced')],
        default='standard'
    )
    is_from_myfiles = models.BooleanField(default=False)
    was_downloaded = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.original_filename} ({self.user.username})"