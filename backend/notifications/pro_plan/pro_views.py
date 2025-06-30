from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from notifications.models import Notification
from notifications.pro_plan.pro_serializers import ProNotificationSerializer


class ProNotificationListView(generics.ListAPIView):
    queryset = Notification.objects.all()
    serializer_class = ProNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user, plan_type='pro').order_by('-created_at')


class ProNotificationCreateView(generics.CreateAPIView):
    queryset = Notification.objects.all()
    serializer_class = ProNotificationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, plan_type='pro')


class ProNotificationUnreadListView(generics.ListAPIView):
    serializer_class = ProNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False, plan_type='pro')


class ProNotificationMarkAsReadView(generics.UpdateAPIView):
    serializer_class = ProNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, plan_type='pro')

    def perform_update(self, serializer):
        serializer.save(read=True)


class ProNotificationDeleteView(generics.DestroyAPIView):
    serializer_class = ProNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, plan_type='pro')


class ImportantOnlyView(generics.ListAPIView):
    serializer_class = ProNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, plan_type='pro', is_important=True).order_by('-created_at')