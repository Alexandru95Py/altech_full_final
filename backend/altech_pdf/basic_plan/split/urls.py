from django.urls import path
from altech_pdf.basic_plan.split.views import SplitPDFView  # Asigură-te că importă din views-ul corect (APIView)

urlpatterns = [
    path('', SplitPDFView.as_view(), name='split_pdf'),
]