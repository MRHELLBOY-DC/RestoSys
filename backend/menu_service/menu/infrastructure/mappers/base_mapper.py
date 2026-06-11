from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional, List

TDomain = TypeVar('TDomain')
TModel = TypeVar('TModel')


class BaseMapper(ABC, Generic[TDomain, TModel]):
    """Clase base para todos los mappers entre entidades de dominio y modelos Django"""
    
    @abstractmethod
    def to_domain(self, model: Optional[TModel]) -> Optional[TDomain]:
        """Convierte un modelo Django a entidad de dominio"""
        pass
    
    @abstractmethod
    def to_model(self, domain: TDomain) -> TModel:
        """Convierte una entidad de dominio a modelo Django"""
        pass
    
    @classmethod
    def to_domain_list(cls, models: List[TModel]) -> List[TDomain]:
        """Convierte una lista de modelos Django a entidades de dominio"""
        return [cls.to_domain(m) for m in models if m is not None]