from django.urls import path
from notifications.pro_plan.pro_views import (
    ProNotificationCreateView,
    ProNotificationListView,
    ProNotificationUnreadListView,
    ProNotificationMarkAsReadView,
    ProNotificationDeleteView,
    ImportantOnlyView,
)

app_name = 'notifications_pro'

urlpatterns = [
    path('pro/create/', ProNotificationCreateView.as_view(), name='pro_notification_create'),
    path('pro/list/', ProNotificationListView.as_view(), name='pro_notification_list'),
    path('pro/unread/', ProNotificationUnreadListView.as_view(), name='pro_notification_unread'),
    path('pro/mark-read/<int:pk>/', ProNotificationMarkAsReadView.as_view(), name='pro_notification_mark_read'),
    path('pro/delete/<int:pk>/', ProNotificationDeleteView.as_view(), name='pro_notification_delete'),
    path('pro/important/', ImportantOnlyView.as_view(), name='pro_important'),
]