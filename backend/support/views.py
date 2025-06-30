from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging

from .serializers import SupportTicketSerializer
from .utils import send_support_email

logger = logging.getLogger(__name__)

class SupportTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SupportTicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket = serializer.save(user=request.user)

            # Trimitere email din utils
            send_support_email(
                user_email=request.user.email,
                subject=ticket.subject,
                message=ticket.message
            )

            logger.info(f"Support ticket submitted by {request.user.email}")
            return Response(
                {"message": "Cererea ta a fost trimisă cu succes."},
                status=status.HTTP_201_CREATED
            )

        logger.warning("Support ticket failed validation.")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)