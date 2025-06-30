# myfiles/urls/pro_plan.py
from django.urls import path
from myfiles.views.pro_plan import (
    MyFilesListCreateView,
    MyFilesDeleteView,
    MyFilesDownloadView,
)

urlpatterns = [
   
    path('upload/', MyFilesListCreateView.as_view(), name='profiles-list-load'),
    path('<int:pk>/', MyFilesDeleteView.as_view(), name='profiles-delete'),
    path('<int:pk>/download/', MyFilesDownloadView.as_view(), name='profiles-download'),
]