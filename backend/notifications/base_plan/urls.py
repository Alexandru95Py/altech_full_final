from django.urls import path
from notifications.base_plan.free_views import (
    FreeNotificationCreateView,
    FreeNotificationListView,
    FreeNotificationUnreadListView,
    FreeNotificationMarkAsReadView,
    FreeNotificationDeleteView,
)

app_name = 'notifications_base'

urlpatterns = [
    path('free/create/', FreeNotificationCreateView.as_view(), name='notification_create'),
    path('free/list/', FreeNotificationListView.as_view(), name='notification_list'),
    path('free/unread/', FreeNotificationUnreadListView.as_view(), name='notification_unread'),
    path('free/mark-read/<int:pk>/', FreeNotificationMarkAsReadView.as_view(), name='notification_mark_read'),
    path('free/delete/<int:pk>/', FreeNotificationDeleteView.as_view(), name='notification_delete'),
]