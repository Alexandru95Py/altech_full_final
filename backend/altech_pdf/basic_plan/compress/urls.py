from django.urls import path
from .views import CompressPDFView

urlpatterns = [
    path('api/compress/', CompressPDFView.as_view(), name='compress-pdf'),
]
