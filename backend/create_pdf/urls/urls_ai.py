from django.urls import path
from create_pdf.views.ai_view import AIAssistantView

app_name = 'ai'

urlpatterns = [
    path('assistant/', AIAssistantView.as_view(), name='ai_assistant'),
]