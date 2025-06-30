from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class PDFFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pdf_files')
    file = models.FileField(upload_to='pdfs/')
    filename = models.CharField(max_length=255)  # numele original al fișierului
    size = models.PositiveIntegerField()         # dimensiunea fișierului în bytes
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.filename} ({self.user.email})"

    class Meta:
        ordering = ['-uploaded_at']