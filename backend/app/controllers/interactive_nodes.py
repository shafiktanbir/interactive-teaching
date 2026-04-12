from typing import Any

from fastapi import HTTPException

from app.config import Settings
from app.models.schemas import (
    InteractiveNodeCreate,
    InteractiveNodePatch,
    ResolvedAudio,
    ResolvedImage,
    ResolvedText,
    ResolvedVideo,
    ResolvedWeb,
)
from app.repositories.interactive_nodes import InteractiveNodeRepository
from app.services.allowlist import is_url_allowed


def _legacy_text_to_doc(plain: str) -> dict[str, Any]:
    return {
        "type": "doc",
        "content": [
            {
                "type": "paragraph",
                "content": [{"type": "text", "text": plain}],
            }
        ],
    }


class InteractiveNodeController:
    def __init__(self, repo: InteractiveNodeRepository, settings: Settings) -> None:
        self._repo = repo
        self._settings = settings

    async def get_resolved(self, node_id: str):
        doc = await self._repo.get_raw(node_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Interactive node not found")
        kind = doc.get("kind")
        source = doc.get("source") or {}

        if kind == "text":
            if source.get("type") != "inline":
                raise HTTPException(status_code=422, detail="Invalid text source")
            rich = source.get("rich_text")
            plain = source.get("text")
            if rich is not None:
                return ResolvedText(content=rich, text=plain if isinstance(plain, str) else None)
            if plain is not None:
                return ResolvedText(content=_legacy_text_to_doc(plain), text=plain)
            return ResolvedText(content={"type": "doc", "content": []}, text="")

        if kind == "image":
            url = self._resolve_media_url(source)
            return ResolvedImage(url=url, alt=doc.get("alt"))

        if kind == "audio":
            url = self._resolve_media_url(source)
            return ResolvedAudio(url=url)

        if kind == "video":
            if doc.get("embed") == "youtube" and doc.get("embed_id"):
                return ResolvedVideo(
                    embed="youtube",
                    embed_id=doc["embed_id"],
                )
            url = self._resolve_media_url(source)
            return ResolvedVideo(url=url)

        if kind == "web":
            url = self._resolve_web_url(source)
            return ResolvedWeb(url=url)

        raise HTTPException(status_code=422, detail="Unsupported node kind")

    async def create(self, body: InteractiveNodeCreate) -> str:
        self._validate_create(body)
        doc: dict[str, Any] = {
            "label": body.label,
            "kind": body.kind,
            "source": dict(body.source),
        }
        if body.alt is not None:
            doc["alt"] = body.alt
        if body.embed is not None:
            doc["embed"] = body.embed
        if body.embed_id is not None:
            doc["embed_id"] = body.embed_id
        return await self._repo.insert(doc)

    async def patch(self, node_id: str, body: InteractiveNodePatch) -> dict:
        existing = await self._repo.get_raw(node_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Interactive node not found")
        set_fields: dict[str, Any] = {}
        if body.label is not None:
            set_fields["label"] = body.label
        if body.source is not None:
            set_fields["source"] = body.source
        if body.alt is not None:
            set_fields["alt"] = body.alt
        if body.embed is not None:
            set_fields["embed"] = body.embed
        if body.embed_id is not None:
            set_fields["embed_id"] = body.embed_id
        if not set_fields:
            raise HTTPException(status_code=422, detail="No fields to update")
        updated = await self._repo.update_merged(node_id, set_fields)
        if not updated:
            raise HTTPException(status_code=404, detail="Interactive node not found")
        return updated

    def _validate_create(self, body: InteractiveNodeCreate) -> None:
        kind = body.kind
        src = body.source
        st = src.get("type")
        if kind == "text":
            if st != "inline":
                raise HTTPException(status_code=422, detail="text requires source.type inline")
            if src.get("rich_text") is None and src.get("text") is None:
                raise HTTPException(status_code=422, detail="text requires source.text or source.rich_text")
            return
        if kind == "web":
            if st not in ("inline", "external"):
                raise HTTPException(status_code=422, detail="web requires source.type inline or external")
            url = src.get("url") or ""
            if not url:
                raise HTTPException(status_code=422, detail="web requires source.url")
            if st == "external" and not is_url_allowed(url, self._settings.allowlist_suffixes):
                raise HTTPException(status_code=422, detail="URL not allowed by policy")
            return
        if kind == "image":
            self._require_media_source(src, "image")
            return
        if kind == "audio":
            self._require_media_source(src, "audio")
            return
        if kind == "video":
            if body.embed == "youtube" and body.embed_id:
                if st != "inline":
                    raise HTTPException(status_code=422, detail="youtube expects source.type inline")
                return
            self._require_media_source(src, "video")
            return
        raise HTTPException(status_code=422, detail="Unsupported kind")

    def _require_media_source(self, src: dict[str, Any], ctx: str) -> None:
        st = src.get("type")
        if st == "inline":
            url = src.get("media_url") or ""
            if not url:
                raise HTTPException(status_code=422, detail=f"{ctx} requires source.media_url")
            return
        if st == "external":
            url = src.get("url") or ""
            if not is_url_allowed(url, self._settings.allowlist_suffixes):
                raise HTTPException(status_code=422, detail="URL not allowed by policy")
            return
        raise HTTPException(status_code=422, detail=f"Invalid source for {ctx}")

    def _resolve_media_url(self, source: dict) -> str:
        src_type = source.get("type")
        if src_type == "inline":
            url = source.get("media_url") or ""
            if not url:
                raise HTTPException(status_code=422, detail="Missing media_url")
            return url
        if src_type == "external":
            url = source.get("url") or ""
            if not is_url_allowed(url, self._settings.allowlist_suffixes):
                raise HTTPException(status_code=422, detail="URL not allowed by policy")
            return url
        raise HTTPException(status_code=422, detail="Invalid media source")

    def _resolve_web_url(self, source: dict) -> str:
        src_type = source.get("type")
        if src_type == "inline":
            url = source.get("url") or ""
            if not url:
                raise HTTPException(status_code=422, detail="Missing url")
            return url
        if src_type == "external":
            url = source.get("url") or ""
            if not is_url_allowed(url, self._settings.allowlist_suffixes):
                raise HTTPException(status_code=422, detail="URL not allowed by policy")
            return url
        raise HTTPException(status_code=422, detail="Invalid web source")
