"""
Shared module - Código compartido entre servicios
"""

from .events import (
    # User Events
    USER_CREATED,
    USER_UPDATED,
    USER_DELETED,
    # Category Events
    CATEGORY_CREATED,
    CATEGORY_UPDATED,
    CATEGORY_DELETED,
    # Product Events
    PRODUCT_CREATED,
    PRODUCT_UPDATED,
    PRODUCT_DELETED,
    # Option Events
    OPTION_CREATED,
    OPTION_UPDATED,
    OPTION_DELETED,
    # Order Events
    ORDER_CREATED,
    ORDER_UPDATED,
    ORDER_STATUS_CHANGED,
    # Payment Events
    PAYMENT_COMPLETED,
    PAYMENT_FAILED,
    # Helper
    ALL_EVENTS,
)

from .messaging import (
    EventPublisher,
    publish_event,
    get_event_publisher,
)

from .constants import (
    USER_ROLES,
    ORDER_STATUS,
    ORDER_STATUS_CHOICES,
    PAYMENT_STATUS,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
)

from .utils import (
    format_datetime,
    format_iso_datetime,
    generate_uuid,
    get_current_timestamp,
    truncate_string,
)

__all__ = [
    # Events
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'CATEGORY_CREATED',
    'CATEGORY_UPDATED',
    'CATEGORY_DELETED',
    'PRODUCT_CREATED',
    'PRODUCT_UPDATED',
    'PRODUCT_DELETED',
    'OPTION_CREATED',
    'OPTION_UPDATED',
    'OPTION_DELETED',
    'ORDER_CREATED',
    'ORDER_UPDATED',
    'ORDER_STATUS_CHANGED',
    'PAYMENT_COMPLETED',
    'PAYMENT_FAILED',
    'ALL_EVENTS',
    # Messaging
    'EventPublisher',
    'publish_event',
    'get_event_publisher',
    # Constants
    'USER_ROLES',
    'ORDER_STATUS',
    'ORDER_STATUS_CHOICES',
    'PAYMENT_STATUS',
    'DEFAULT_PAGE_SIZE',
    'MAX_PAGE_SIZE',
    # Utils
    'format_datetime',
    'format_iso_datetime',
    'generate_uuid',
    'get_current_timestamp',
    'truncate_string',
]