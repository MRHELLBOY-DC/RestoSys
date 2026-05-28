from users.application.ports.event_publisher_port import EventPublisherPort


def create_user_event(user, event_publisher: EventPublisherPort):
    """
    Crea un evento de usuario creado usando el puerto de publicación
    """
    user.record_created()
    events = user.pull_domain_events()
    return event_publisher.persist_and_publish(events[-1], "UserCreated")