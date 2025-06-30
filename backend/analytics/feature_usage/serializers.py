from rest_framework import serializers
from analytics.models import FeatureUsage

class FeatureUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureUsage
        fields = '_all_'
