from analytics.models import UserSession, DailyStatistics, PDFAction
from django.utils.timezone import now
from datetime import date

def update_last_active(session):
    """
    Actualizează câmpul last_active al unei sesiuni.
    """
    session.last_active = now()
    session.save()
    return session

def collect_daily_statistics():
    """
    Colectează date statistice pentru ziua curentă: total acțiuni și utilizatori unici.
    """
    today = date.today()
    total_actions = PDFAction.objects.filter(timestamp__date=today).count()
    total_users = UserSession.objects.filter(created_at__date=today).count()

    stats, created = DailyStatistics.objects.get_or_create(date=today)
    stats.total_actions = total_actions
    stats.total_users = total_users
    stats.save()
    return stats