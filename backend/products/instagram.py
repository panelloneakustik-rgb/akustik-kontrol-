"""Pull Instagram Graph API media into Story rows. No scraping — token required."""

from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings
from django.core.files.base import ContentFile
from django.utils.text import slugify

from .models import Story

MAX_BYTES = 20 * 1024 * 1024
GRAPH_HOST = "https://graph.facebook.com"


class InstagramConfigError(Exception):
    pass


class InstagramApiError(Exception):
    pass


def _token() -> str:
    token = (getattr(settings, "INSTAGRAM_ACCESS_TOKEN", "") or "").strip()
    user_id = (getattr(settings, "INSTAGRAM_USER_ID", "") or "").strip()
    if not token or not user_id:
        raise InstagramConfigError(
            "INSTAGRAM_ACCESS_TOKEN ve INSTAGRAM_USER_ID .env içinde olmalı "
            "(Instagram profesyonel hesap + Graph API)."
        )
    return token


def _version() -> str:
    return (getattr(settings, "INSTAGRAM_GRAPH_VERSION", "v21.0") or "v21.0").lstrip("/")


def graph_get(path: str, extra: dict | None = None) -> dict:
    token = _token()
    params = {"access_token": token}
    if extra:
        params.update(extra)
    url = f"{GRAPH_HOST}/{_version()}/{path.lstrip('/')}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": "akustik-kontrol"})
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            payload = json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "replace")[:400]
        raise InstagramApiError(f"Instagram API {exc.code}: {body}") from exc
    except urllib.error.URLError as exc:
        raise InstagramApiError(f"Instagram API’ye ulaşılamadı: {exc.reason}") from exc
    if isinstance(payload, dict) and payload.get("error"):
        raise InstagramApiError(str(payload["error"]))
    return payload


def download_bytes(url: str) -> bytes | None:
    if not url:
        return None
    req = urllib.request.Request(url, headers={"User-Agent": "akustik-kontrol"})
    try:
        with urllib.request.urlopen(req, timeout=45) as res:
            data = res.read(MAX_BYTES + 1)
    except (urllib.error.URLError, TimeoutError, ValueError):
        return None
    if len(data) > MAX_BYTES:
        return None
    return data


def _title_from_caption(caption: str, fallback: str) -> str:
    line = (caption or "").strip().split("\n")[0].strip()
    line = line[:80] if line else fallback
    return line or fallback


def _flatten_media(item: dict) -> list[dict]:
    media_type = (item.get("media_type") or "").upper()
    if media_type == "CAROUSEL_ALBUM":
        children = (item.get("children") or {}).get("data") or []
        out = []
        for child in children:
            row = dict(child)
            row.setdefault("caption", item.get("caption"))
            row.setdefault("permalink", item.get("permalink"))
            row.setdefault("timestamp", item.get("timestamp"))
            out.append(row)
        return out or [item]
    return [item]


def fetch_instagram_items(limit: int) -> list[dict]:
    user_id = settings.INSTAGRAM_USER_ID.strip()
    fields = (
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,"
        "children{id,media_type,media_url,thumbnail_url}"
    )
    items: list[dict] = []
    try:
        stories = graph_get(f"{user_id}/stories", {"fields": "id,media_type,media_url,thumbnail_url,timestamp,permalink", "limit": str(limit)})
        items.extend(stories.get("data") or [])
    except InstagramApiError:
        pass
    feed = graph_get(f"{user_id}/media", {"fields": fields, "limit": str(max(limit, 12))})
    for row in feed.get("data") or []:
        items.extend(_flatten_media(row))
    seen = set()
    unique = []
    for row in items:
        mid = str(row.get("id") or "")
        if not mid or mid in seen:
            continue
        seen.add(mid)
        unique.append(row)
        if len(unique) >= limit * 2:
            break
    return unique


def _file_ext(url: str, video: bool) -> str:
    path = urllib.parse.urlparse(url).path.lower()
    for ext in (".mp4", ".mov", ".m4v", ".webm", ".jpg", ".jpeg", ".png", ".webp"):
        if path.endswith(ext):
            return ext
    return ".mp4" if video else ".jpg"


def upsert_story(item: dict, order: int) -> Story | None:
    ig_id = str(item.get("id") or "").strip()
    if not ig_id:
        return None
    media_type = (item.get("media_type") or "").upper()
    is_video = media_type == "VIDEO"
    media_url = item.get("media_url") or ""
    thumb_url = item.get("thumbnail_url") or ("" if is_video else media_url)
    title = _title_from_caption(item.get("caption") or "", "Instagram")
    permalink = (item.get("permalink") or "")[:200]

    video_bytes = download_bytes(media_url) if is_video else None
    image_bytes = download_bytes(thumb_url or media_url)
    if not video_bytes and not image_bytes:
        return None

    story = Story.objects.filter(instagram_id=ig_id).first()
    if not story:
        story = Story(instagram_id=ig_id, source="instagram")
    story.title = title
    story.link_url = permalink
    story.order = order
    story.source = "instagram"
    story.save()

    slug = slugify(ig_id) or ig_id
    if image_bytes:
        story.image.save(f"{slug}{_file_ext(thumb_url or media_url, False)}", ContentFile(image_bytes), save=False)
    if video_bytes:
        story.video.save(f"{slug}{_file_ext(media_url, True)}", ContentFile(video_bytes), save=False)
    story.save()
    return story


def sync_instagram_stories(limit: int | None = None) -> dict:
    limit = int(limit or getattr(settings, "INSTAGRAM_SYNC_LIMIT", 8) or 8)
    items = fetch_instagram_items(limit)
    created = updated = skipped = 0
    order = 0
    for item in items:
        if order >= limit:
            break
        existing = Story.objects.filter(instagram_id=str(item.get("id") or "")).exists()
        story = upsert_story(item, order)
        if not story:
            skipped += 1
            continue
        if existing:
            updated += 1
        else:
            created += 1
        order += 1
    return {"created": created, "updated": updated, "skipped": skipped, "seen": len(items)}
