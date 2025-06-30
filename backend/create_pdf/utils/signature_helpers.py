from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PyPDF2 import PdfReader, PdfWriter
import tempfile

def sign_pdf_file(pdf_file, signature_file, position):
    # Citim PDF-ul original
    reader = PdfReader(pdf_file)
    page = reader.pages[0]

    # Pregătim imaginea din semnătură
    signature_image = ImageReader(BytesIO(signature_file.read()))

    # Pregătim un overlay PDF cu semnătura
    overlay_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    c = canvas.Canvas(overlay_temp.name, pagesize=page.mediabox)
    c.drawImage(signature_image, position["x"], position["y"], width=100, height=50)
    c.save()

    # Îmbinăm semnătura cu PDF-ul original
    overlay_reader = PdfReader(overlay_temp.name)
    page.merge_page(overlay_reader.pages[0])

    writer = PdfWriter()
    writer.add_page(page)

    final_temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    with open(final_temp.name, "wb") as f_out:
        writer.write(f_out)

    return final_temp.name  # vei returna calea către PDF-ul final semnat