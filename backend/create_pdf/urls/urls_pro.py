from django.urls import path
from create_pdf.views import pro_view
from create_pdf.views.pro_view import (
    CreateAdvancedTablePDFView,
    CreatePDFWithMultipleImagesView,
    ContractPDFView,
    CreateInvoicePDFView,
    FillAndSignPDFView
)

app_name = 'create_pdf'

urlpatterns = [
    path('advanced-table/', pro_view.CreateAdvancedTablePDFView.as_view(), name='advanced_table_pdf'),
    path('multi-image/', pro_view.CreatePDFWithMultipleImagesView.as_view(), name='multi_image_pdf'),
    path('contract/', pro_view.ContractPDFView.as_view(), name='contract_generate'),
    path('invoice/', pro_view.CreateInvoicePDFView.as_view(), name='invoice_generate'),
    path('sign/', pro_view.FillAndSignPDFView.as_view(), name='sign_pdf'),
]