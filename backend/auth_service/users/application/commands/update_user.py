from users.infrastructure.event_utils import persist_and_publish
from shared import USER_UPDATED


def update_user_event(user, old_data, new_data):
    user.record_updated(old_data, new_data)
    events = user.pull_domain_events()
    return persist_and_publish(events[-1], USER_UPDATED)