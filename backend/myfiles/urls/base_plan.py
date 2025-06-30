from django.urls import path
from myfiles.views.base_plan import (
    MyFilesListCreateView,
    MyFilesDeleteView,
    MyFilesDownloadView,
)

urlpatterns = [
    path('', MyFilesListCreateView.as_view(), name='myfiles-list'),
    path('upload/', MyFilesListCreateView.as_view(), name='myfiles-list-upload'),
    path('<int:pk>/', MyFilesDeleteView.as_view(), name='myfiles-delete'),
    path('<int:pk>/download/', MyFilesDownloadView.as_view(), name='myfiles-download'),
]