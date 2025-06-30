from django.urls import path
from .views import (
    StartSessionView, EndSessionView,
    PDFActionView, FeatureUsageView, DailyStatisticsView
)


urlpatterns = [
    path('start-session/', StartSessionView.as_view(), name='start_session'),
    path('end-session/<uuid:session_id>/', EndSessionView.as_view(), name='end_session'),
    path('pdf-action/', PDFActionView.as_view(), name='pdf_action'),
    path('feature-usage/', FeatureUsageView.as_view(), name='feature_usage'),
    path('daily-statistics/', DailyStatisticsView.as_view(), name='daily_statistics'),
]
