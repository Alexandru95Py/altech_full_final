from rest_framework import serializers
from analytics.models import UserSession, PDFAction, DailyStatistics

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = '_all_'

class PDFActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFAction
        fields = '_all_'

class DailyStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStatistics
        fields = '_all_'
