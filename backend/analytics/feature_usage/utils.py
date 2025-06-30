from analytics.models import FeatureUsage
from django.utils.timezone import now

def log_feature_usage(feature_name):
    """
    Înregistrează utilizarea unei funcții. Dacă există deja, crește contorul și actualizează data.
    """
    usage, created = FeatureUsage.objects.get_or_create(feature_name=feature_name)
    usage.usage_count += 1
    usage.last_used = now()
    usage.save()
    return usage
