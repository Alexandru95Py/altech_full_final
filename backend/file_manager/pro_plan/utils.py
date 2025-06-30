import os
import uuid
from django.core.exceptions import ValidationError

# Extensii permise pentru Free Plan (limitate față de Pro)
ALLOWED_EXTENSIONS = ['.pdf', '.docx']

# Dimensiune maximă a fișierului în bytes (ex: 5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

def get_unique_filename(filename):
    """
    Generează un nume unic pentru fișier, păstrând extensia.
    """
    ext = os.path.splitext(filename)[1]
    return f"{uuid.uuid4().hex}{ext}"

def validate_file_extension(file):
    """
    Verifică dacă extensia fișierului este permisă în planul FREE.
    """
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(f"Extensia {ext} nu este permisă în planul gratuit.")

def validate_file_size(file):
    """
    Verifică dacă fișierul nu depășește dimensiunea maximă pentru planul FREE.
    """
    if file.size > MAX_FILE_SIZE:
        raise ValidationError("Fișierul depășește limita de 5MB pentru planul gratuit.")

def get_readable_file_size(file):
    """
    Returnează dimensiunea fișierului într-un format KB/MB prietenos.
    """
    size = file.size
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{round(size / 1024, 2)} KB"
    else:
        return f"{round(size / (1024 * 1024), 2)} MB"