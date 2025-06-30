from PyPDF2 import PdfReader, PdfWriter

def rotate_pdf(file, pages_to_rotate, rotation_angle):
    reader = PdfReader(file)
    writer = PdfWriter()

    total_pages = len(reader.pages)
    pages_set = set(p - 1 for p in pages_to_rotate if 1 <= p <= total_pages)

    for index, page in enumerate(reader.pages):
        if index in pages_set:
            page.rotate(rotation_angle)
        writer.add_page(page)

    return writer