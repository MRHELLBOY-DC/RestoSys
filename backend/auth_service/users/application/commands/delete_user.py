from users.infrastructure.event_utils import persist_and_publish
from shared import USER_DELETED


def delete_user_event(user):
    user.record_deleted()
    events = user.pull_domain_events()
    return persist_and_publish(events[-1], USER_DELETED)