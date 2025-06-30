from django.urls import path
from .views import ReorderPDFView

urlpatterns = [
    path('', ReorderPDFView, name='reorder-pdf'),
]