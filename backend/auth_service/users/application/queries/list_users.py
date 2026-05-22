"""
Query: List Users
CQRS - Query para listar todos los usuarios
"""
from users.infrastructure.repositories import UserRepository


def list_users(role=None):
    """
    Retorna lista de usuarios activos
    Solo devuelve campos necesarios para la query
    """
    users = UserRepository.list_active_users(role=role)
    return list(users.values('id', 'username', 'email', 'role', 'date_joined'))


def list_users_by_role(role):
    """
    Retorna lista de usuarios filtrados por rol
    """
    users = UserRepository.list_active_users(role=role)
    return list(users.values('id', 'username', 'email', 'role'))