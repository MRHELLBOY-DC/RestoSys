from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class DomainEvent:
    event_type: str
    aggregate_id: Any
    aggregate_type: str
    data: dict
    occurred_at: str
