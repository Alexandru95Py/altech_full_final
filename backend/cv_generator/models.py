from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class GeneratedCV(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cv_list')
    full_name = models.CharField(max_length=100)
    about = models.TextField()
    education = models.TextField()
    experience = models.TextField()
    skills = models.TextField()
    languages = models.TextField()
    links = models.TextField(blank=True)
    photo = models.ImageField(upload_to='cv_photos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"CV - {self.full_name} ({self.created_at.date()})"