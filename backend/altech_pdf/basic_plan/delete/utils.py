import os
from PyPDF2 import PdfReader, PdfWriter

def delete_pages_from_pdf(file, pages_to_delete, output_path):
    reader = PdfReader(file.file)  # 🛠 diferența esențială
    writer = PdfWriter()

    total_pages = len(reader.pages)
    pages_to_skip = set([page - 1 for page in pages_to_delete if 1 <= page <= total_pages])

    for i in range(total_pages):
        if i not in pages_to_skip:
            writer.add_page(reader.pages[i])

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "wb") as out:
        writer.write(out)

    return output_path