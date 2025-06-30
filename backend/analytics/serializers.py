from rest_framework import serializers
from .models import UserSession, PDFAction, FeatureUsage, DailyStatistics

class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = '__all__'

class PDFActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFAction
        fields = '__all__'

class FeatureUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureUsage
        fields = '__all__'

class DailyStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStatistics
        fields = '__all__'

class EndSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = '__all__'