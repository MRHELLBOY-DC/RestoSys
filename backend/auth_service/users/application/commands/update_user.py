from users.infrastructure.event_store import event_store
from shared import publish_event, USER_UPDATED


def _persist_and_publish(event, routing_key):
    event_data = {
        **event.data,
        'timestamp': event.occurred_at,
    }
    event_store.append_event(
        aggregate_id=event.aggregate_id,
        event_type=event.event_type,
        data=event_data,
        aggregate_type=event.aggregate_type,
    )
    publish_event(routing_key, event_data)
    return event_data


def update_user_event(user, old_data, new_data):
    user.record_updated(old_data, new_data)
    events = user.pull_domain_events()
    return _persist_and_publish(events[-1], USER_UPDATED)
