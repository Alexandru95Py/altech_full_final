from rest_framework.permissions import IsAuthenticated
from notifications.base_plan.free_serializers import FreeNotificationSerializer
from notifications.models import Notification
from rest_framework import generics, permissions
from notifications.models import Notification
from notifications.base_plan.free_serializers import FreeNotificationSerializer


class BaseNotificationView:
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)




class FreeNotificationListView(generics.ListAPIView):
    serializer_class = FreeNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user,
            plan_type='free'
        ).order_by('-created_at')


class FreeNotificationCreateView(generics.CreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = FreeNotificationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, plan_type='free')


class FreeNotificationUnreadListView(generics.ListAPIView):
    serializer_class = FreeNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False, plan_type='free')


class FreeNotificationMarkAsReadView(generics.UpdateAPIView):
    serializer_class = FreeNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, plan_type='free')

    def perform_update(self, serializer):
        serializer.save(is_read=True)


class FreeNotificationDeleteView(generics.DestroyAPIView):
    serializer_class = FreeNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, plan_type='free')
    
class BaseNotificationView(generics.ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = FreeNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

