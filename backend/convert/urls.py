from django.urls import path
from .views import ConvertPDFView

urlpatterns = [
    path("api/convert/", ConvertPDFView.as_view(), name="convert-pdf"),
]