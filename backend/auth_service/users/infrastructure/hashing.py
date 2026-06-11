from django.contrib.auth.hashers import make_password, check_password
from users.application.ports.hashing_port import HashingPort


class DjangoHashingService(HashingPort):
    """Implementación de hashing con Django"""
    
    def hash(self, password: str) -> str:
        return make_password(password)
    
    def verify(self, password: str, hashed: str) -> bool:
        return check_password(password, hashed)