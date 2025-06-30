from django.contrib import admin
from .models import ProtectedDocument

@admin.register(ProtectedDocument)
class ProtectedDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'original_filename', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('original_filename', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)