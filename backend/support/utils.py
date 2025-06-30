from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

def send_support_email(user_email, subject, message):
    try:
        send_mail(
            subject=f"[Support] {subject}",
            message=message,
            from_email="no-reply@altechpdf.com",
            recipient_list=["support@altechpdf.com"],
            fail_silently=False,
        )
        logger.info(f"Support email sent from {user_email}")
        return True
    except Exception as e:
        logger.exception("Failed to send support email: %s", e)
        return False
