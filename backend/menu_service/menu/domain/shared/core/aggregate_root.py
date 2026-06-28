from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

from .domain_event import DomainEvent
from .entity import Entity


@dataclass(kw_only=True)
class AggregateRoot(Entity):
    _domain_events: List[DomainEvent] = field(default_factory=list, init=False, repr=False)

    def add_domain_event(self, event_type: str, data: dict, aggregate_type: Optional[str] = None):
        event = DomainEvent(
            event_type=event_type,
            aggregate_id=self.identity,
            aggregate_type=aggregate_type or self.__class__.__name__,
            data=data,
            occurred_at=datetime.utcnow().isoformat()
        )
        self._domain_events.append(event)
        return event

    def get_domain_events(self):
        return tuple(self._domain_events)

    def pull_domain_events(self):
        events = list(self._domain_events)
        self.clear_domain_events()
        return events

    def clear_domain_events(self):
        self._domain_events.clear()