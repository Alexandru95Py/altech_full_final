from django.contrib import admin
from analytics.models import FeatureUsage, UserSession, PDFAction, DailyStatistics

@admin.register(FeatureUsage)
class FeatureUsageAdmin(admin.ModelAdmin):
    list_display = ("id", "feature_name", "timestamp")
    search_fields = ("feature_name",)
    list_filter = ("feature_name", "timestamp")
    ordering = ("-timestamp",)

@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "session_id", "start_time", "end_time")
    search_fields = ("session_id",)
    list_filter = ("start_time",)
    ordering = ("-start_time",)

@admin.register(PDFAction)
class PDFActionAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "action_type", "timestamp")
    list_filter = ("action_type", "timestamp")
    ordering = ("-timestamp",)

@admin.register(DailyStatistics)
class DailyStatisticsAdmin(admin.ModelAdmin):
    list_display = ("id", "date", "total_sessions", "total_actions")
    list_filter = ("date",)
    ordering = ("-date",)

# Register your models here.
