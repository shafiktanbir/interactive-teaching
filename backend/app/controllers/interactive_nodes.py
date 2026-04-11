from fastapi import HTTPException

from app.config import Settings
from app.models.schemas import (
    ResolvedAudio,
    ResolvedImage,
    ResolvedText,
    ResolvedVideo,
)
from app.repositories.interactive_nodes import InteractiveNodeRepository
from app.services.allowlist import is_url_allowed


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
        src_type = source.get("type")

        if kind == "text":
            if src_type != "inline":
                raise HTTPException(status_code=422, detail="Invalid text source")
            return ResolvedText(text=source.get("text") or "")

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

        raise HTTPException(status_code=422, detail="Unsupported node kind")

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
