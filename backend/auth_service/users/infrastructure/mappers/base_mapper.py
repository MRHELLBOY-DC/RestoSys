"""
Clase base para todos los mappers
Define la interfaz común para convertir entre entidades de dominio y modelos de persistencia
"""
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional

# Tipos genéricos
TDomain = TypeVar('TDomain')
TPersistence = TypeVar('TPersistence')


class BaseMapper(ABC, Generic[TDomain, TPersistence]):
    """
    Clase base para mappers entre entidades de dominio y modelos de persistencia
    """
    
    @abstractmethod
    def to_domain(self, persistence: TPersistence) -> Optional[TDomain]:
        """
        Convierte un modelo de persistencia a entidad de dominio
        """
        pass
    
    @abstractmethod
    def to_persistence(self, domain: TDomain) -> Optional[TPersistence]:
        """
        Convierte una entidad de dominio a modelo de persistencia
        """
        pass