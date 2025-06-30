from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'type', 'action_type', 'plan_type', 'is_read', 'timestamp')
    list_filter = ('type', 'action_type', 'plan_type', 'is_read', 'timestamp')
    search_fields = ('title', 'message', 'user__email')
    ordering = ('-timestamp',)
    readonly_fields = ('timestamp',)