def get_profile(user):
    return {
        "user": user.username,
        "role": user.role
    }