from django.urls import path
from .views import ReorderPDFView

urlpatterns = [
    path('', ReorderPDFView.as_view(), name='reorder-pdf'),
]