"""
Query: List Users
CQRS - Query para listar todos los usuarios
"""
from dataclasses import dataclass
from typing import Optional, List
from users.application.ports.user_repository_port import UserRepositoryPort
from users.application.dtos import UserListDTO
from .base_query import Query, QueryHandler


@dataclass
class ListUsersQuery(Query):
    """Query to list users"""
    role: Optional[str] = None
    restaurant_id: Optional[int] = None


class ListUsersQueryHandler(QueryHandler):
    """Handler for ListUsersQuery"""
    
    def __init__(self, user_repo: UserRepositoryPort):
        self.user_repo = user_repo
    
    def handle(self, query: ListUsersQuery) -> List[UserListDTO]:
        """Execute the query"""
        users = self.user_repo.list_active(query.role, query.restaurant_id)
        
        return [
            UserListDTO(
                id=u.id,
                username=u.username,
                email=u.email,
                role=u.role,
                full_name=u.full_name,
                date_joined=u.date_joined,      
            )
            for u in users
        ]