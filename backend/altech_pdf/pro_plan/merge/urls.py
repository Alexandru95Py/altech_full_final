from django.urls import path
from .views import MergePDFView

urlpatterns = [
    path('', MergePDFView.as_view(), name='merge-pdf'),
]