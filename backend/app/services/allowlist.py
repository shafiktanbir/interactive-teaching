from urllib.parse import urlparse


def is_url_allowed(url: str, suffixes: list[str]) -> bool:
    if not url or not suffixes:
        return False
    try:
        parsed = urlparse(url)
    except ValueError:
        return False
    if parsed.scheme not in ("http", "https"):
        return False
    host = (parsed.hostname or "").lower()
    return any(host == s or host.endswith("." + s) for s in suffixes)
