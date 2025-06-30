from PyPDF2 import PdfReader
from django.core.files.uploadedfile import InMemoryUploadedFile

def get_pdf_page_count(file: InMemoryUploadedFile) -> int:
    try:
        reader = PdfReader(file)
        return len(reader.pages)
    except Exception as e:
        print(f"Error counting pages: {e}")
        return 0