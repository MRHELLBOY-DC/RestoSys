from users.infrastructure.repositories import EventRepository


def get_user_events(user_id=None, event_type=None, limit=100):
    events = EventRepository.list_events_by_user_id(user_id=user_id, event_type=event_type, limit=limit)
    return [
        {
            'id': e.id,
            'type': e.type,
            'data': e.data,
            'created_at': e.created_at.isoformat()
        }
        for e in events
    ]


def get_all_events(limit=100):
    events = EventRepository.list_events(limit=limit)
    return [
        {
            'id': e.id,
            'type': e.type,
            'data': e.data,
            'created_at': e.created_at.isoformat()
        }
        for e in events
    ]
