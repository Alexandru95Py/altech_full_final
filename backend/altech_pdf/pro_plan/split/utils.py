import os
from PyPDF2 import PdfReader, PdfWriter

def split_pdf(file, start_page, end_page, output_path):
    reader = PdfReader(file)
    writer = PdfWriter()

    for page_num in range(start_page - 1, end_page):
        writer.add_page(reader.pages[page_num])

    with open(output_path, 'wb') as output_file:
        writer.write(output_file)

    return output_path
 