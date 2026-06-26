from dataclasses import dataclass
from typing import Any, Optional


@dataclass(frozen=True)
class DomainEvent:
    event_type: str
    aggregate_id: Optional[Any]
    aggregate_type: str
    data: dict
    occurred_at: str
    
    def __post_init__(self):
        """Asegura que aggregate_id no sea None"""
        if self.aggregate_id is None:
            object.__setattr__(self, 'aggregate_id', 'unknown')