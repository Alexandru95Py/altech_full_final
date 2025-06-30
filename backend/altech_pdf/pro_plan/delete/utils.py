import os
import uuid
from PyPDF2 import PdfReader, PdfWriter

def delete_pages_from_pdf(file, pages_to_delete, output_path):
    reader = PdfReader(file)
    writer = PdfWriter()

    total_pages = len(reader.pages)
    # Transformăm lista în set și scădem 1 din fiecare (indexare de la 0)
    pages_to_skip = set([page - 1 for page in pages_to_delete if page - 1 < total_pages])

    for i in range(total_pages):
        if i not in pages_to_skip:
            writer.add_page(reader.pages[i])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, 'wb') as out:
        writer.write(out)

    return output_path