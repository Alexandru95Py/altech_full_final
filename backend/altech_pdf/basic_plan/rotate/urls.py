from django.urls import path
from .view import RotatePDFView

urlpatterns = [
    path("", RotatePDFView.as_view(), name="rotate-pdf"),
]