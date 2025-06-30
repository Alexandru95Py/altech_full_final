from rest_framework.exceptions import ValidationError
from myfiles.models import PDFFile
from myfiles.permissions.storage_limit import get_limits_by_plan

def validate_pdf_limits(user, file, plan='free'):
    """
    Validează dimensiunea fișierului și numărul maxim de fișiere încărcate,
    în funcție de planul utilizatorului: 'free' sau 'pro'.
    """
    max_file_count, max_file_size_mb = get_limits_by_plan(plan)

    # 1. Verificăm numărul de fișiere
    current_count = PDFFile.objects.filter(user=user).count()
    if current_count >= max_file_count:
        raise ValidationError({'detail': f'Limită atinsă: maxim {max_file_count} fișiere.'})

    # 2. Verificăm dimensiunea fișierului
    max_size_bytes = max_file_size_mb * 1024 * 1024
    if file.size > max_size_bytes:
        raise ValidationError({'detail': f'Fișierul este prea mare (max {max_file_size_mb}MB).'})