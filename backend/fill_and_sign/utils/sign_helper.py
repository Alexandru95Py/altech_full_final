import os
import uuid
import json
import base64
import tempfile
from io import BytesIO

import fitz  # PyMuPDF
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile

from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader


def convert_path_to_simple_file(file_path, prefix="modified"):
    """Transformă un fișier salvat pe disc într-un SimpleUploadedFile pentru salvare în DB."""
    with open(file_path, "rb") as f:
        content = f.read()
    return SimpleUploadedFile(
        name=f"{prefix}_{uuid.uuid4().hex}.pdf",
        content=content,
        content_type="application/pdf"
    )


def fill_pdf_fields(pdf_file, fields: dict):
    temp_path = f"media/filled_{uuid.uuid4().hex}.pdf"
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")

    print(f"[DEBUG] fill_pdf_fields: Started writing to {temp_path}")
    for page in doc:
        for index, (field, value) in enumerate(fields.items()):
            y_offset = 50 + 20 * index
            page.insert_text((50, y_offset), f"{field}: {value}", fontsize=12)
            print(f"[DEBUG] Added text '{field}: {value}' at y={y_offset}")

    doc.save(temp_path)
    doc.close()
    print(f"[DEBUG] fill_pdf_fields: Saved to {temp_path}")

    return convert_path_to_simple_file(temp_path, prefix="filled")


def sign_pdf_with_image(pdf_file, image_file, page_number, x, y):
    temp_path = f"media/signed_{uuid.uuid4().hex}.pdf"
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    page = doc[page_number]

    print(f"[DEBUG] sign_pdf_with_image: Opened PDF and accessing page {page_number}")

    img_path = f"media/sign_{uuid.uuid4().hex}.png"
    with open(img_path, "wb") as f:
        content = image_file.read()
        f.write(content)
        print(f"[DEBUG] Saved temporary image to {img_path} ({len(content)} bytes)")

    rect = fitz.Rect(x, y, x + 100, y + 50)
    page.insert_image(rect, filename=img_path)
    print(f"[DEBUG] Inserted image at position x={x}, y={y}, w=100, h=50")

    doc.save(temp_path)
    doc.close()
    os.remove(img_path)
    print(f"[DEBUG] sign_pdf_with_image: Saved signed PDF to {temp_path}")

    return convert_path_to_simple_file(temp_path, prefix="signed")


def apply_elements_to_pdf(pdf_file, elements_json):
    elements = json.loads(elements_json)
    reader = PdfReader(pdf_file)
    writer = PdfWriter()

    print(f"[DEBUG] apply_elements_to_pdf: Processing {len(reader.pages)} pages")
    print(f"[DEBUG] Received {len(elements)} elements")

    for page_index, page in enumerate(reader.pages):
        # Get actual page size
        try:
            page_width = float(page.mediabox.width)
            page_height = float(page.mediabox.height)
        except Exception:
            page_width, page_height = letter  # fallback
        packet = BytesIO()
        can = canvas.Canvas(packet, pagesize=(page_width, page_height))

        for el in elements:
            if el.get("page") != page_index + 1:
                continue

            # Use ratio if present, else fallback to absolute
            if "xRatio" in el and "yRatio" in el:
                x = float(el["xRatio"]) * page_width
                y = float(el["yRatio"]) * page_height
            else:
                x = el.get("x", 100)
                y = el.get("y", 100)
            font_size = el.get("fontSize", 14)
            el_type = el.get("type")

            print(f"[DEBUG] Page {page_index+1}: Processing element type '{el_type}' at ({x},{y})")

            if el_type in ["text", "date"]:
                content = el.get("content", "")
                can.setFont("Helvetica", font_size)
                can.drawString(x, y, content)
                print(f"[DEBUG] -> Drawn text: '{content}' with fontSize={font_size}")

            elif el_type in ["signature", "initial"]:
                # Use signatureData if present, else fallback to content
                base64_data = el.get("signatureData") or el.get("content", "")
                if not (isinstance(base64_data, str) and base64_data.startswith("data:image/")):
                    print(f"[WARNING] Skipping signature/initial element with invalid base64: {base64_data!r} (element: {el})")
                    continue
                try:
                    base64_str = base64_data.split(",", 1)[1] if "," in base64_data else base64_data
                    if len(base64_str) < 32:
                        print(f"[WARNING] Skipping signature/initial element with too short base64: {base64_str!r} (element: {el})")
                        continue
                    image_data = base64.b64decode(base64_str)
                    image = ImageReader(BytesIO(image_data))
                    can.drawImage(image, x, y, width=120, height=50, mask='auto')
                    print(f"[DEBUG] -> Inserted image (signature/initial) at ({x},{y})")
                except Exception as e:
                    print(f"[ERROR] Error decoding signature image for element {el}: {e}")

        can.save()
        packet.seek(0)
        overlay_reader = PdfReader(packet)
        if overlay_reader.pages:
            overlay_page = overlay_reader.pages[0]
            page.merge_page(overlay_page)
            print(f"[DEBUG] -> Merged overlay on page {page_index + 1}")
        else:
            print(f"[DEBUG] -> No overlay content for page {page_index + 1}")

        writer.add_page(page)

    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf").name
    with open(output_path, "wb") as f_out:
        writer.write(f_out)

    print(f"[DEBUG] apply_elements_to_pdf: Saved modified PDF to {output_path}")
    return convert_path_to_simple_file(output_path, prefix="modified")
