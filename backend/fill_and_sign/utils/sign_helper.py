import fitz  # PyMuPDF
from PIL import Image
import uuid
import os

from django.core.files.uploadedfile import SimpleUploadedFile


def fill_pdf_fields(pdf_file, fields: dict):
    temp_path = f"media/filled_{uuid.uuid4().hex}.pdf"
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")

    for page in doc:
        for field, value in fields.items():
            # Poziționare simplă, sus-stânga + offset
            page.insert_text((50, 50 + 20 * list(fields.keys()).index(field)), f"{field}: {value}", fontsize=12)

    doc.save(temp_path)
    doc.close()
    return temp_path


def sign_pdf_with_image(pdf_file, image_file, page_number, x, y):
    temp_path = f"media/signed_{uuid.uuid4().hex}.pdf"
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    page = doc[page_number]  # Zero-based indexing

    # Salvează imaginea temporar pentru plasare
    img_path = f"media/sign_{uuid.uuid4().hex}.png"
    with open(img_path, "wb") as f:
        f.write(image_file.read())

    rect = fitz.Rect(x, y, x + 100, y + 50)  # Dimensiunea semnăturii
    page.insert_image(rect, filename=img_path)

    doc.save(temp_path)
    doc.close()
    os.remove(img_path)
    return temp_path