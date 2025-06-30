# ✅ altech_pdf/basic_plan/extract_pages/urls.py
from django.urls import path
from altech_pdf.basic_plan.extract_pages.views import ExtractPagesView  # Ensure you import the correct view

urlpatterns = [
    path("extract/", ExtractPagesView.as_view(), name="extract_pages"),
]

