import os
import uuid
from PyPDF2 import PdfReader, PdfWriter

def reorder_pdf(file, new_order=None, reverse=False, output_path=None):
    reader = PdfReader(file)
    writer = PdfWriter()

    total_pages = len(reader.pages)

    if reverse:
        page_indices = list(reversed(range(total_pages)))
    elif new_order:
        # Convertim din pagini 1-based în index 0-based
        page_indices = [i - 1 for i in new_order if 0 < i <= total_pages]
    else:
        raise ValueError("Trebuie specificat fie reverse=True, fie new_order.")

    for i in page_indices:
        writer.add_page(reader.pages[i])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'wb') as out:
        writer.write(out)

    return output_path
