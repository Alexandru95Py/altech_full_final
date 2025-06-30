from django.urls import path
from create_pdf.views import free_view

app_name = 'free'

urlpatterns = [
    path('basic/', free_view.CreateBasicPDFView.as_view()),
    path('image/', free_view.CreatePDFWithImageView.as_view()),
    path('table/', free_view.CreatePDFWithTableView.as_view()),
]