from datetime import datetime

from .domain_event import DomainEvent
from .entity import EntityMixin


class AggregateRootMixin(EntityMixin):
    def add_domain_event(self, event_type, data, aggregate_type=None):
        if not hasattr(self, '_domain_events'):
            self._domain_events = []

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
        if not hasattr(self, '_domain_events'):
            self._domain_events = []
        return tuple(self._domain_events)

    def pull_domain_events(self):
        events = list(self.get_domain_events())
        self.clear_domain_events()
        return events

    def clear_domain_events(self):
        self._domain_events = []
