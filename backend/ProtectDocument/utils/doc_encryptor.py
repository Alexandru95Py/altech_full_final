import io
import os
import zipfile
from PyPDF2 import PdfReader, PdfWriter

def encrypt_document(file_path: str, password: str, file_type: str = 'pdf') -> io.BytesIO:
    file_type = file_type.lower()

    if file_type == 'pdf':
        # Criptare PDF (cu pagini, via PyPDF2)
        reader = PdfReader(file_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(password)

        output = io.BytesIO()
        writer.write(output)
        output.seek(0)
        return output

    else:
        # Criptare generică pentru orice tip de fișier → ZIP protejat cu parolă
        buffer = io.BytesIO()

        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.setpassword(password.encode('utf-8'))
            filename = os.path.basename(file_path)

            with open(file_path, 'rb') as f:
                zf.writestr(filename, f.read())

        buffer.seek(0)
        return buffer