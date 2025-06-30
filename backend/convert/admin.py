from django.contrib import admin
from .models import ConvertedFile

@admin.register(ConvertedFile)
class ConvertedFileAdmin(admin.ModelAdmin):
    list_display = ('file_name', 'user', 'target_format', 'created_at')
    list_filter = ('target_format', 'created_at')
    search_fields = ('file_name', 'user__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)