"""
Event types - Definiciones de eventos compartidos entre servicios
"""

# ============================================
# User Events (auth_service)
# ============================================
USER_CREATED = "user.created"
USER_UPDATED = "user.updated"
USER_DELETED = "user.deleted"

# ============================================
# Category Events (menu_service)
# ============================================
CATEGORY_CREATED = "category.created"
CATEGORY_UPDATED = "category.updated"
CATEGORY_DELETED = "category.deleted"

# ============================================
# Product Events (menu_service)
# ============================================
PRODUCT_CREATED = "product.created"
PRODUCT_UPDATED = "product.updated"
PRODUCT_DELETED = "product.deleted"

# ============================================
# Option Events (menu_service)
# ============================================
OPTION_CREATED = "option.created"
OPTION_UPDATED = "option.updated"
OPTION_DELETED = "option.deleted"

# ============================================
# Order Events (orders_service)
# ============================================
ORDER_CREATED = "order.created"
ORDER_UPDATED = "order.updated"
ORDER_STATUS_CHANGED = "order.status.changed"

# ============================================
# Payment Events (payments_service)
# ============================================
PAYMENT_COMPLETED = "payment.completed"
PAYMENT_FAILED = "payment.failed"

# ============================================
# Helper - Lista de todos los eventos (para validación)
# ============================================
ALL_EVENTS = [
    # User Events
    USER_CREATED, USER_UPDATED, USER_DELETED,
    # Category Events
    CATEGORY_CREATED, CATEGORY_UPDATED, CATEGORY_DELETED,
    # Product Events
    PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED,
    # Option Events
    OPTION_CREATED, OPTION_UPDATED, OPTION_DELETED,
    # Order Events
    ORDER_CREATED, ORDER_UPDATED, ORDER_STATUS_CHANGED,
    # Payment Events
    PAYMENT_COMPLETED, PAYMENT_FAILED,
]