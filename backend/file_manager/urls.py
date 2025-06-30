# file_manager/urls.py

from django.urls import path, include

urlpatterns = [
    path('free/', include('file_manager.basic_plan.urls')),
    path('pro/', include('file_manager.pro_plan.urls')),
]