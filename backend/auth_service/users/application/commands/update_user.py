from users.application.ports.event_publisher_port import EventPublisherPort


def update_user_event(user, old_data, new_data, event_publisher: EventPublisherPort):
    user.record_updated(old_data, new_data)
    events = user.pull_domain_events()
    return event_publisher.persist_and_publish(events[-1], "UserUpdated")