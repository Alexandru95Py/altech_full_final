from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
import os
from django.core.files.storage import default_storage
from django.conf import settings
from reportlab.lib.units import inch
import uuid


# ========== FREE PLAN ==========


def generate_basic_pdf(title, content):
    tmp_dir = os.path.join(os.getcwd(), "tmp")  # folder tmp în proiect
    os.makedirs(tmp_dir, exist_ok=True)         # creează folderul dacă nu există

    path = os.path.join(tmp_dir, f"{title.replace(' ', '_')}.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 80, title)

    c.setFont("Helvetica", 12)
    y = height - 120
    for line in content.splitlines():
        c.drawString(100, y, line)
        y -= 20
        if y < 50:
            c.showPage()
            y = height - 50

    c.save()
    return path

def generate_pdf_with_image(title, content, image):
    # Creăm directorul unde salvăm PDF-ul
    output_dir = os.path.join(settings.BASE_DIR, 'media', 'temp')
    os.makedirs(output_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}_{title.replace(' ', '_')}_img.pdf"
    path = os.path.join(output_dir, filename)

    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 80, title)

    c.setFont("Helvetica", 12)
    y = height - 120
    for line in content.splitlines():
        c.drawString(100, y, line)
        y -= 20

    try:
        # Salvăm imaginea într-un fișier temporar
        image_path = default_storage.save(f"temp/{image.name}", image)
        full_image_path = os.path.join(settings.MEDIA_ROOT, image_path)

        c.drawImage(
            ImageReader(full_image_path),
            100, y - 150,
            width=300,
            preserveAspectRatio=True,
            mask='auto'
        )
    except Exception as e:
        c.drawString(100, y - 160, f"Eroare la încărcarea imaginii: {e}")

    c.save()
    return path

def generate_pdf_with_table(title, headers, rows):
    # Creează folderul tmp dacă nu există
    tmp_dir = os.path.join(os.getcwd(), "tmp")
    os.makedirs(tmp_dir, exist_ok=True)

    # Creează calea către fișier
    path = os.path.join(tmp_dir, f"{title.replace(' ', '_')}_table.pdf")
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 80, title)

    data = [headers] + rows

    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.gray),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ])

    table = Table(data, repeatRows=1, colWidths=[1.5 * inch] * len(headers))
    table.setStyle(style)

    table.wrapOn(c, width, height)
    table.drawOn(c, 100, height - 300)

    c.save()
    return path

# ========== PRO PLAN ==========

def generate_advanced_table_pdf(title, headers, rows, styles):
    # Creează folderul tmp dacă nu există
    tmp_dir = os.path.join(settings.BASE_DIR, 'tmp')
    os.makedirs(tmp_dir, exist_ok=True)

    # Construiește calea completă
    safe_title = title.replace(' ', '_')
    path = os.path.join(tmp_dir, f"{safe_title}_advtable.pdf")

    # Creează PDF
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 80, title)

    data = [headers] + rows
    table = Table(data, repeatRows=1, colWidths=[1.5 * inch] * len(headers))
    table.setStyle(TableStyle(styles))
    table.wrapOn(c, width, height)
    table.drawOn(c, 100, height - 300)

    c.save()
    return path

def generate_pdf_with_multiple_images(title, content, image_paths):
    path = f"/tmp/{title.replace(' ', '_')}_multiimg.pdf"
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 80, title)

    c.setFont("Helvetica", 12)
    y = height - 120
    for line in content.splitlines():
        c.drawString(100, y, line)
        y -= 20

    for img_path in image_paths:
        try:
            c.drawImage(ImageReader(img_path), 100, y - 150, width=300, preserveAspectRatio=True, mask='auto')
        except Exception as e:
            c.drawString(100, y - 160, f"Eroare: {e}")
        y -= 200

    c.save()
    return path

def generate_contract_pdf(data):
    path = f"/tmp/{data.get('title', 'contract').replace(' ', '_')}_contract.pdf"
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica", 12)
    y = height - 80
    for section in data.get("sections", []):
        c.drawString(100, y, section)
        y -= 20

    c.save()
    return path

def generate_invoice_pdf(data):
    
    output_dir = os.path.join(settings.BASE_DIR, 'temp')
    os.makedirs(output_dir, exist_ok=True)

    filename = f"{data.get('title', 'invoice').replace(' ', '_')}_invoice.pdf"
    path = os.path.join(output_dir, filename)

    
    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica", 12)
    y = height - 80
    for key, value in data.items():
        c.drawString(100, y, f"{key}: {value}")
        y -= 20

    c.save()
    return path

def generate_signed_pdf(pdf_path, signature_path, position):
    from reportlab.pdfgen.canvas import Canvas
    temp_signature = "/tmp/signed_overlay.pdf"
    c = canvas.Canvas(temp_signature, pagesize=A4)
    c.drawImage(signature_path, position["x"], position["y"], width=100, preserveAspectRatio=True)
    c.save()
    return pdf_path  # Placeholder logic - Ã®nlocuieÈte cu versiunea finalÄ semnatÄ