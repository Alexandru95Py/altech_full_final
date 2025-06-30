import django
django.setup()

from custom_auth.models import CustomUser  # Asigură-te că modelul e corect importat
from io import BytesIO
from PyPDF2 import PdfWriter
from django.core.files.uploadedfile import SimpleUploadedFile
from reportlab.pdfgen import canvas
import uuid
from django.contrib.auth import get_user_model



def create_test_user(email=None, password="testpass", plan="pro", is_active=True):
    User = get_user_model()
    
    if email is None:
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"  # email unic
    
    user = User.objects.create_user(email=email, password=password, is_active=is_active)
    
    # Planul e direct pe user
    if hasattr(user, 'plan'):
        user.plan = plan
        user.save()

    return user

def generate_test_pdf(filename="test.pdf"):
    buffer = BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    writer.write(buffer)
    buffer.seek(0)
    return SimpleUploadedFile(filename, buffer.read(), content_type="application/pdf")


def generate_valid_pdf(name="test.pdf"):
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 750, "Hello PDF")  # Text minimal pentru a crea un PDF valid
    p.showPage()
    p.save()
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type='application/pdf')
