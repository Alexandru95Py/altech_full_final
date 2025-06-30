from django.urls import path
from .views.protect_myfiles import protect_from_myfiles
from .views.protect_upload import protect_from_upload


app_name = 'free'

urlpatterns = [
    path('myfiles/', protect_from_myfiles, name='protect_from_myfiles'),
    path('upload/', protect_from_upload, name='protect_from_upload'),
]