from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class ConvertedFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='converted_files')
    
    original_file = models.FileField(upload_to='converted/originals/')
    converted_file = models.FileField(upload_to='converted/results/')
    
    target_format = models.CharField(max_length=10, choices=[
        ('docx', 'DOCX'),
        ('pptx', 'PPTX'),
        ('jpg', 'JPG'),
        ('png', 'PNG'),
        ('txt', 'TXT'),
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)
    file_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.user.email} - {self.file_name} ({self.target_format})"