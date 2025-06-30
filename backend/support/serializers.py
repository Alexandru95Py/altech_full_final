from rest_framework import serializers
from .models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ['subject', 'message']
        extra_kwargs = {
            'subject': {'required': True},
            'message': {'required': True},
        }