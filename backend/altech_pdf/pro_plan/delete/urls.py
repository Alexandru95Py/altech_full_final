from django.urls import path
from .views import DeletePagesView

urlpatterns = [
    path('', DeletePagesView.as_view(), name='delete-pages'),
]