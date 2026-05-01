from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings


class JWTAuthenticationCustom(BaseAuthentication):
    """Autenticador JWT que no requiere base de datos"""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        try:
            # Extraer token
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return None
            
            token = parts[1]
            
            # Decodificar token
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            
            # Crear un objeto user dummy con la información del token
            from django.contrib.auth.models import AnonymousUser
            from types import SimpleNamespace
            
            user = SimpleNamespace()
            user.id = payload.get('user_id')
            user.username = payload.get('username', '')
            user.role = payload.get('role', 'cliente')
            user.restaurant_id = payload.get('restaurant_id')
            user.is_authenticated = True
            
            # Guardar payload en request para usarlo después
            request.jwt_payload = payload
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            raise AuthenticationFailed(f'Authentication error: {str(e)}')