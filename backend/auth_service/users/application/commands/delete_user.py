from users.application.ports.event_publisher_port import EventPublisherPort


def delete_user_event(user, event_publisher: EventPublisherPort):
    user.record_deleted()
    events = user.pull_domain_events()
    return event_publisher.persist_and_publish(events[-1], "UserDeleted")