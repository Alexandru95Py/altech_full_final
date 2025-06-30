import os
from PyPDF2 import PdfMerger
from PyPDF2.errors import PdfReadError

def merge_pdfs(files, output_path, preserve_bookmarks=True, start_new_page=False):
    merger = PdfMerger()

    for file in files:
        try:
            merger.append(file, import_bookmarks=preserve_bookmarks)
            if start_new_page:
                merger.add_outline_item("New Document", page_number=len(merger.pages) - 1)
        except PdfReadError as e:
            raise PdfReadError(f"Cannot read PDF {getattr(file, 'name', 'unknown')}: {str(e)}")

    with open(output_path, "wb") as f:
        merger.write(f)
    merger.close()

    return output_path