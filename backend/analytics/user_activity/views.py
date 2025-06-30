from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from analytics.models import UserSession, PDFAction, DailyStatistics
from analytics.user_activity.serializers import (UserSessionSerializer, PDFActionSerializer, DailyStatisticsSerializer)
from django.utils import timezone

class StartSessionView(APIView):
    def post(self, request):
        session = UserSession.objects.create()
        serializer = UserSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class EndSessionView(APIView):
    def post(self, request, session_id):
        try:
            session = UserSession.objects.get(session_id=session_id)
            session.last_active = timezone.now()
            session.save()
            serializer = UserSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

class PDFActionView(APIView):
    def post(self, request):
        serializer = PDFActionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DailyStatisticsView(APIView):
    def get(self, request):
        stats = DailyStatistics.objects.all()
        serializer = DailyStatisticsSerializer(stats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
