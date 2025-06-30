from rest_framework.permissions import IsAuthenticated
from .base import BaseNotificationView
from notifications.pro_plan.pro_serializers import ProNotificationSerializer

class ProNotificationListView(BaseNotificationView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProNotificationSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user, plan_type='pro').order_by('-created_at')
