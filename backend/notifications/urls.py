from django.urls import path, include

urlpatterns = [
    path('free/', include('notifications.base_plan.urls')),
    path('pro/', include('notifications.pro_plan.urls')),
]
