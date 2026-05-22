"""
Constants - Constantes compartidas entre servicios
"""

# ============================================
# User Roles
# ============================================
USER_ROLES = {
    'CLIENTE': 'cliente',
    'RESTAURANTE': 'restaurante',
    'ADMIN': 'admin',
}

USER_ROLES_LIST = ['cliente', 'restaurante', 'admin']

# ============================================
# Order Status (para orders_service)
# ============================================
ORDER_STATUS = {
    'PENDING': 'pendiente',
    'RECEIVED': 'recibido',
    'PREPARING': 'preparando',
    'READY': 'listo',
    'DELIVERED': 'entregado',
    'CANCELLED': 'cancelado',
}

ORDER_STATUS_CHOICES = [
    ('pendiente', 'Pendiente'),
    ('recibido', 'Recibido'),
    ('preparando', 'Preparando'),
    ('listo', 'Listo'),
    ('entregado', 'Entregado'),
    ('cancelado', 'Cancelado'),
]

# ============================================
# Payment Status
# ============================================
PAYMENT_STATUS = {
    'PENDING': 'pendiente',
    'COMPLETED': 'completado',
    'FAILED': 'fallido',
    'REFUNDED': 'reembolsado',
}

PAYMENT_STATUS_CHOICES = [
    ('pendiente', 'Pendiente'),
    ('completado', 'Completado'),
    ('fallido', 'Fallido'),
    ('reembolsado', 'Reembolsado'),
]

# ============================================
# General
# ============================================
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100