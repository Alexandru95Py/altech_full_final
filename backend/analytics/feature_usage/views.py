from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from analytics.models import FeatureUsage
from analytics.feature_usage.serializers import FeatureUsageSerializer

class FeatureUsageView(APIView):
    def post(self, request):
        serializer = FeatureUsageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
