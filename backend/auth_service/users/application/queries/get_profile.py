"""
Query: Get Profile
Retorna el perfil de un usuario a partir de una entidad de dominio pura
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any
from users.domain.entities.user import User as DomainUser
from users.application.dtos import UserProfileDTO
from .base_query import Query, QueryHandler


@dataclass
class GetProfileQuery(Query):
    """Query to get user profile"""
    user: DomainUser
    restaurant_data: Optional[Dict[str, Any]] = None


class GetProfileQueryHandler(QueryHandler):
    """Handler for GetProfileQuery"""
    
    def handle(self, query: GetProfileQuery) -> UserProfileDTO:
        """Execute the query"""
        return UserProfileDTO(
            id=query.user.id,
            username=query.user.username,
            email=query.user.email,
            role=query.user.role,
            full_name=query.user.full_name,
            restaurant=query.restaurant_data,
            date_joined=query.user.date_joined,
            last_login=query.user.last_login,
        )