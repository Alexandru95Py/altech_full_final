from django.urls import path
from .views import GenerateCVView

app_name = 'cv_generator'

urlpatterns = [
    path('generate/', GenerateCVView.as_view(), name='generate_cv'),
]