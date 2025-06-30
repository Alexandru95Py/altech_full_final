from notifications.models import Notification

def create_free_notification(user, title, message, action_type='custom', type='info'):
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        plan_type='free',
        type=type,
        action_type=action_type
    )