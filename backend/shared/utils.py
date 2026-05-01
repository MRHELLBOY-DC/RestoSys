"""
Utils - Utilidades compartidas entre servicios
"""
from datetime import datetime
import uuid
import re


def format_datetime(dt, format_str='%Y-%m-%d %H:%M:%S'):
    """Formatea un datetime a string"""
    if dt is None:
        return None
    return dt.strftime(format_str)


def format_iso_datetime(dt):
    """Formatea un datetime a ISO format"""
    if dt is None:
        return None
    return dt.isoformat()


def generate_uuid():
    """Genera un UUID como string"""
    return str(uuid.uuid4())


def get_current_timestamp():
    """Retorna timestamp actual en ISO format"""
    return datetime.utcnow().isoformat()


def truncate_string(text, max_length=100):
    """Trunca un string si es muy largo"""
    if not text:
        return text
    if len(text) <= max_length:
        return text
    return text[:max_length - 3] + "..."


def slugify(text):
    """Convierte un texto a slug (para URLs)"""
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = text.strip('-')
    return text


def validate_email(email):
    """Valida formato de email básico"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None