import random
import logging
from django.core.mail import send_mail
from django.conf import settings
from custom_auth.models import EmailVerificationCode

# Logger pentru producție/debug
logger = logging.getLogger(__name__)


def generate_verification_code():
    """Generează un cod numeric de 6 cifre pentru verificare email."""
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])


def send_verification_email(user):
    """
    Trimite un email de verificare către utilizator, cu un cod valid 10 minute.
    Codul este salvat în baza de date. Dacă există un cod vechi, îl șterge mai întâi.
    """
    logger.info(f"[EMAIL] Generare cod pentru utilizator: {user.email}")
    code = generate_verification_code()

    # 🔥 Ștergem codurile vechi pentru a crea un obiect nou cu created_at proaspăt
    EmailVerificationCode.objects.filter(user=user).delete()

    # ✅ Cream un cod nou cu timestamp corect
    EmailVerificationCode.objects.create(user=user, code=code)

    subject = "Codul tău de verificare - ALTech PDF"
    message = (
        f"Bun venit, {user.first_name or user.email}!\n\n"
        f"Codul tău de verificare este: {code}\n"
        "Este valabil 10 minute.\n\n"
        "Echipa ALTech"
    )
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [user.email]

    # Logging complet pentru debugging
    logger.info(f"[EMAIL] Pregătit să trimită către: {user.email}")
    logger.debug(f"[EMAIL] Subiect: {subject}")
    logger.debug(f"[EMAIL] Mesaj: {message}")
    logger.debug(f"[EMAIL] Expeditor: {from_email}")
    logger.debug(f"[EMAIL] Destinatar: {recipient_list}")

    try:
        logger.info("[EMAIL] Trimitere email în curs...")
        result = send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False  # important pentru debugging
        )
        if result == 1:
            logger.info(f"[EMAIL] Email trimis cu succes către: {user.email}")
        else:
            logger.warning(f"[EMAIL] Email NU a fost trimis către: {user.email}")
    except Exception as e:
        logger.error(f"[EMAIL] Eroare la trimiterea emailului către {user.email}: {e}")
