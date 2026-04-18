"""
Query: List Users
CQRS - Query para listar todos los usuarios
"""
from users.models import User


def list_users():
    """
    Retorna lista de usuarios activos
    Solo devuelve campos necesarios para la query
    """
    users = User.objects.filter(is_active=True).values(
        'id', 'username', 'email', 'role', 'date_joined'
    )
    return list(users)


def list_users_by_role(role):
    """
    Retorna lista de usuarios filtrados por rol
    """
    users = User.objects.filter(
        is_active=True,
        role=role
    ).values('id', 'username', 'email', 'role')
    return list(users)