from users.application.ports.event_publisher_port import EventPublisherPort


def update_user_event(user, old_data, new_data, event_publisher: EventPublisherPort, actor_username: str = None):
    user.record_updated(old_data, new_data)
    events = user.pull_domain_events()
    event = events[-1]
    if actor_username:
        event.data['actor_username'] = actor_username
    return event_publisher.persist_and_publish(event, "UserUpdated")