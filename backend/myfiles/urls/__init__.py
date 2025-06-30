from django.urls import path
from myfiles.views.count_pages_view import CountPagesAPIView
from myfiles.views.base_plan import (
    MyFilesListCreateView,
    MyFilesDeleteView,
    MyFilesDownloadView
)
from myfiles.views.pro_plan import (
    MyFilesDeleteView as ProFilesDeleteView,
    MyFilesDownloadView as ProFilesDownloadView,
    MyFilesListCreateView as ProFilesListCreateView
)

urlpatterns = [
    # Basic Plan
    path("base/", MyFilesListCreateView.as_view(), name="myfiles-list"),
    path("base/<int:pk>/", MyFilesDeleteView.as_view(), name="myfiles-delete"),
    path("base/<int:pk>/download/", MyFilesDownloadView.as_view(), name="myfiles-download"),
    path("count-pages/", CountPagesAPIView.as_view(), name="count-pages"),  # Updated route

    # Pro Plan
    path("pro/upload/", ProFilesListCreateView.as_view(), name="profiles-list-load"),
    path("pro/<int:pk>/", ProFilesDeleteView.as_view(), name="profiles-delete"),
    path("pro/<int:pk>/download/", ProFilesDownloadView.as_view(), name="profiles-download"),
]
