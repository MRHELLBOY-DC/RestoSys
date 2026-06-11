"""
Excepciones de dominio - Específicas del negocio
"""

from typing import Optional


class DomainException(Exception):
    """Excepción base para todas las excepciones de dominio"""
    pass


# ============================================
# Excepciones de Usuario
# ============================================

class UserException(DomainException):
    """Excepción base para errores de usuario"""
    pass


class UserAlreadyExistsException(UserException):
    """El usuario ya existe (email o username duplicado)"""
    def __init__(self, field: str, value: str):
        self.field = field
        self.value = value
        super().__init__(f"{field} '{value}' ya está registrado.")


class UserNotFoundException(UserException):
    """Usuario no encontrado"""
    def __init__(self, user_id: int):
        self.user_id = user_id
        super().__init__(f"Usuario con ID '{user_id}' no encontrado.")


class InvalidEmailException(UserException):
    """Email inválido"""
    def __init__(self, email: str):
        self.email = email
        super().__init__(f"'{email}' no es un email válido.")


class InvalidCredentialsException(UserException):
    """Credenciales inválidas"""
    def __init__(self):
        super().__init__("Credenciales inválidas.")


class InvalidUsernameException(UserException):
    """Username inválido"""
    def __init__(self, username: str, reason: str):
        self.username = username
        super().__init__(f"'{username}' no es válido: {reason}")


class UserNotActiveException(UserException):
    """Usuario inactivo"""
    def __init__(self, username: str):
        self.username = username
        super().__init__(f"Usuario '{username}' está inactivo.")


class InvalidPasswordException(UserException):
    """Contraseña inválida"""
    def __init__(self, reason: str = "La contraseña no cumple los requisitos"):
        self.reason = reason
        super().__init__(reason)


# ============================================
# Excepciones de Restaurante
# ============================================

class RestaurantException(DomainException):
    """Excepción base para errores de restaurante"""
    pass


class RestaurantNotFoundException(RestaurantException):
    """Restaurante no encontrado"""
    def __init__(self, restaurant_id: int):
        self.restaurant_id = restaurant_id
        super().__init__(f"Restaurante con ID '{restaurant_id}' no encontrado.")


class RestaurantAlreadyExistsException(RestaurantException):
    """Restaurante ya existe"""
    def __init__(self, name: str):
        self.name = name
        super().__init__(f"Restaurante con nombre '{name}' ya existe.")


class InvalidRestaurantNameException(RestaurantException):
    """Nombre de restaurante inválido"""
    def __init__(self, name: str, reason: str):
        self.name = name
        super().__init__(f"'{name}' no es válido: {reason}")


# ============================================
# Excepciones de Asignación Usuario-Restaurante
# ============================================

class UserRestaurantException(DomainException):
    """Excepción base para errores de asignación"""
    pass


class UserRestaurantAssignmentException(UserRestaurantException):
    """Error al asignar restaurante a usuario"""
    def __init__(self, user_id: int, restaurant_id: int, reason: str):
        self.user_id = user_id
        self.restaurant_id = restaurant_id
        super().__init__(f"No se pudo asignar restaurante {restaurant_id} al usuario {user_id}: {reason}")


class UserAlreadyHasRestaurantException(UserRestaurantException):
    """Usuario ya tiene un restaurante asignado"""
    def __init__(self, user_id: int, restaurant_id: int):
        self.user_id = user_id
        self.restaurant_id = restaurant_id
        super().__init__(f"Usuario {user_id} ya tiene el restaurante {restaurant_id} asignado.")


class UserNoRestaurantException(UserRestaurantException):
    """Usuario no tiene restaurante asignado"""
    def __init__(self, user_id: int):
        self.user_id = user_id
        super().__init__(f"Usuario {user_id} no tiene un restaurante asignado.")


# users/domain/exceptions.py

class EventException(DomainException):
    """Excepción base para errores de eventos"""
    pass


class EventNotFoundException(EventException):
    """Evento no encontrado"""
    def __init__(self, event_id: Optional[int] = None, aggregate_id: Optional[str] = None):
        self.event_id = event_id
        self.aggregate_id = aggregate_id
        if event_id:
            super().__init__(f"Evento con ID '{event_id}' no encontrado.")
        elif aggregate_id:
            super().__init__(f"No se encontraron eventos para el agregado '{aggregate_id}'.")
        else:
            super().__init__("Evento no encontrado.")