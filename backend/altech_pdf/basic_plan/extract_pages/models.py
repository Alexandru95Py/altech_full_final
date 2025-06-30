from django.db import models
from file_manager.models import File

class ExtractedFile(models.Model):
    original_file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='extracted_files')
    extracted_pages = models.CharField(max_length=255)  # e.g., "1,2,3"
    extracted_file = models.FileField(upload_to='extracted_files/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Extracted pages {self.extracted_pages} from {self.original_file.name}"
