from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import UserSession, PDFAction, FeatureUsage, DailyStatistics
from .serializers import (
    UserSessionSerializer, PDFActionSerializer, FeatureUsageSerializer,
    DailyStatisticsSerializer, EndSessionSerializer
)


class StartSessionView(APIView):
    def post(self, request):
        session = UserSession.objects.create()
        return Response({'session_id': session.session_id}, status=status.HTTP_201_CREATED)

class EndSessionView(APIView):
    def post(self, request, session_id):
        try:
            session = UserSession.objects.get(session_id=session_id)
        except UserSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        session.last_active = timezone.now()
        session.save()
        serializer = EndSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PDFActionView(APIView):
    def post(self, request):
        serializer = PDFActionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FeatureUsageView(APIView):
    def post(self, request):
        serializer = FeatureUsageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DailyStatisticsView(APIView):
    def get(self, request):
        stats = DailyStatistics.objects.all()
        serializer = DailyStatisticsSerializer(stats, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)