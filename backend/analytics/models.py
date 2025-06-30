from django.db import models
from django.utils import timezone
import uuid

timestrap = models.DateTimeField(auto_now_add=True, default=timezone.now)

class FeatureUsage(models.Model):
    feature_name = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.feature_name} - {self.timestamp}"


class UserSession(models.Model):
    session_id = models.CharField(
        max_length=255,
        unique=True,
        default=uuid.uuid4,
        editable=False,
    )
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.session_id


class PDFAction(models.Model):
    session = models.ForeignKey(UserSession, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action_type} - {self.timestamp}"


class DailyStatistics(models.Model):
    date = models.DateField(auto_now_add=True)
    total_sessions = models.IntegerField(default=0)
    total_actions = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.date} - S:{self.total_sessions} A:{self.total_actions}"
