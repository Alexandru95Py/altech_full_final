from django.urls import path
from .views.protect_advanced import protect_advanced

app_name = 'pro'

urlpatterns = [
    path ('protect_advanced/', protect_advanced, name='protect_advanced'),
]
