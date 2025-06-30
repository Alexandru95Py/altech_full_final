from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    PLAN_CHOICES = (
        ('free', 'Free'),
        ('pro', 'Pro'),
    )

    TYPE_CHOICES = (
        ('info', 'Informare'),
        ('success', 'Succes'),
        ('warning', 'Avertisment'),
        ('error', 'Eroare'),
        ('system', 'Sistem'),
        ('upgrade', 'Upgrade'),
    )

    ACTION_TYPE_CHOICES = (
        ('upload', 'Fișier încărcat'),
        ('split', 'PDF împărțit'),
        ('merge', 'PDF unit'),
        ('delete', 'Fișier șters'),
        ('download', 'Fișier descărcat'),
        ('account', 'Cont'),
        ('subscription', 'Abonament'),
        ('system', 'Sistem general'),
        ('custom', 'Personalizată'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    plan_type = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='info')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPE_CHOICES, default='custom')
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.get_type_display()}] {self.title} - {self.user.email}"