from app.services.allowlist import is_url_allowed


def test_allowlist_exact_host():
    assert is_url_allowed("https://youtube.com/watch?v=1", ["youtube.com"]) is True


def test_allowlist_subdomain():
    assert is_url_allowed("https://www.youtube.com/foo", ["youtube.com"]) is True


def test_allowlist_blocked():
    assert is_url_allowed("https://evil.com", ["youtube.com"]) is False


def test_allowlist_empty_suffixes():
    assert is_url_allowed("https://example.com", []) is False
