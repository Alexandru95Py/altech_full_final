import io
from PyPDF2 import PdfReader, PdfWriter

def reorder_pdf(file, new_order):
    """
    Reordonează paginile unui fișier PDF pe baza unei liste de indici (1-based) primite din frontend.
    Returnează un fișier PDF reordonat în memorie.
    """
    try:
        reader = PdfReader(file)
        total_pages = len(reader.pages)
        writer = PdfWriter()

        if not isinstance(new_order, list) or not all(isinstance(i, int) for i in new_order):
            raise ValueError("new_order must be a list of integers")

        for i, page_number in enumerate(new_order):
            index = page_number - 1  # 🔁 Convertim din 1-based în 0-based
            if 0 <= index < total_pages:
                writer.add_page(reader.pages[index])
            else:
                raise IndexError(f"Invalid page index at position {i}: {page_number}")

        output_stream = io.BytesIO()
        writer.write(output_stream)
        output_stream.seek(0)
        return output_stream

    except Exception as e:
        raise Exception(f"Error in reorder_pdf: {str(e)}")
