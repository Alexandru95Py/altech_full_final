from datetime import datetime


def auto_title_fallback(user, default="Document Fără Titlu"):
    """
    Generează automat un titlu premium dacă utilizatorul nu a oferit unul.
    """
    if not user or not hasattr(user, "email"):
        return f"{default} - {datetime.now().strftime('%Y-%m-%d')}"
    name = user.email.split("@")[0]
    return f"{default} - {name} - {datetime.now().strftime('%Y-%m-%d')}"


def format_invoice_amount(value):
    """
    Formatează suma facturii în stil profesional (ex: 1.234,56 EUR).
    """
    try:
        return f"{float(value):,.2f} EUR".replace(",", "X").replace(".", ",").replace("X", ".")
    except Exception:
        return f"{value} EUR"


def normalize_headers(headers):
    """
    Curăță și stilizează headerele tabelelor pentru PDF-uri.
    """
    return [h.strip().title() for h in headers]


def stylize_contract_section(text, level="normal"):
    """
    Stilizează o secțiune de contract în funcție de importanță.
    """
    if level == "important":
        return text.upper()
    if level == "italic":
        return f"{text}"
    return text.capitalize()


def generate_document_id(prefix="DOC"):
    """
    Creează un ID unic pentru un document premium.
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    return f"{prefix}-{timestamp}"


def get_default_terms(language="ro"):
    """
    Returnează clauze predefinite pentru contracte în funcție de limbă.
    """
    if language == "en":
        return "This agreement is made between the two parties..."
    return "Acest contract este încheiat între părțile menționate..."