from django.urls import path
from file_manager.basic_plan.views import (
    FileUploadView,
    FileListView,
    FileDeleteView,
    FileDownloadView
)

app_name = 'file_manager_basic_plan'

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file_upload'),
    path('list/', FileListView.as_view(), name='file_list'),
    path('delete/<int:pk>/', FileDeleteView.as_view(), name='file_delete'),
    path('download/<int:pk>/', FileDownloadView.as_view(), name='file_download'),
]