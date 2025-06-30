from django.urls import path
from .views import SupportTicketView

urlpatterns = [
    path("submit/", SupportTicketView.as_view(), name="submit_support_ticket"),
]