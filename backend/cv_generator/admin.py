from django.contrib import admin
from .models import GeneratedCV

@admin.register(GeneratedCV)
class GeneratedCVAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'created_at')
    search_fields = ('full_name', 'user__username')
    list_filter = ('created_at',)