from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class FillAndSignAction(models.Model):
    ACTION_TYPE_CHOICES = (
        ("fill", "Fill Form"),
        ("sign", "Add Signature"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fill_and_sign_actions")
    action_type = models.CharField(max_length=10, choices=ACTION_TYPE_CHOICES)
    original_file = models.FileField(upload_to="fill_and_sign/originals/")
    result_file = models.FileField(upload_to="fill_and_sign/results/")  # <- corect aici
    date_performed = models.DateTimeField(auto_now_add=True)
    page = models.IntegerField(null=True, blank=True)
    position_x = models.FloatField(null=True, blank=True)
    position_y = models.FloatField(null=True, blank=True)
    details = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} - {self.action_type} - {self.date_performed.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-date_performed']

def save_fill_or_sign_action(user, action_type, original_file, result_file, page=None, x=None, y=None, details=None):
    action = FillAndSignAction.objects.create(
        user=user,
        action_type=action_type,
        original_file=original_file,
        result_file=result_file,  # <- corect aici!
        page=page,
        position_x=x,
        position_y=y,
        details=details or {}
    )
    return action