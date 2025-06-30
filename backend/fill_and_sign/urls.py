from django.urls import path
from .views import FillPDFView, SignPDFView

app_name = "fill_and_sign"

urlpatterns = [
    path("fill/", FillPDFView.as_view(), name="fill_pdf"),
    path("sign/", SignPDFView.as_view(), name="sign_pdf"),
]