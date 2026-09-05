import uuid

from django.http import Http404


def parse_session_key(session_key: str) -> str:
    try:
        uuid.UUID(str(session_key))
    except (ValueError, AttributeError, TypeError):
        raise Http404()
    return session_key
