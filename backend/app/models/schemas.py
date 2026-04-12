from datetime import datetime
from typing import Any, Literal, Union

from pydantic import BaseModel, Field


class TOCItem(BaseModel):
    id: str
    label: str
    children: list["TOCItem"] = Field(default_factory=list)
    body: dict[str, Any] | None = None  # TipTap JSON for expandable sidebar panel


class MultimediaStripItem(BaseModel):
    node_id: str
    label: str | None = None
    kind: str | None = None  # set on GET from interactive_nodes for UI chips


class MultimediaStripItemInput(BaseModel):
    node_id: str
    label: str | None = None


class Lesson(BaseModel):
    id: str
    title: str
    toc: list[TOCItem]
    content: dict[str, Any]
    multimedia_strip: list[MultimediaStripItem] = Field(default_factory=list)
    updated_at: datetime | None = None


class LessonInput(BaseModel):
    title: str
    toc: list[TOCItem]
    content: dict[str, Any]
    multimedia_strip: list[MultimediaStripItemInput] = Field(default_factory=list)


class LessonPatch(BaseModel):
    title: str | None = None
    toc: list[TOCItem] | None = None
    content: dict[str, Any] | None = None
    multimedia_strip: list[MultimediaStripItemInput] | None = None


class ResolvedText(BaseModel):
    kind: Literal["text"] = "text"
    text: str | None = None
    content: dict[str, Any] | None = None


class ResolvedImage(BaseModel):
    kind: Literal["image"] = "image"
    url: str
    alt: str | None = None


class ResolvedAudio(BaseModel):
    kind: Literal["audio"] = "audio"
    url: str


class ResolvedVideo(BaseModel):
    kind: Literal["video"] = "video"
    url: str | None = None
    embed: str | None = None
    embed_id: str | None = None


class ResolvedWeb(BaseModel):
    kind: Literal["web"] = "web"
    url: str


InteractiveNodeResolved = Union[
    ResolvedText,
    ResolvedImage,
    ResolvedAudio,
    ResolvedVideo,
    ResolvedWeb,
]


class InteractiveNodeCreate(BaseModel):
    kind: Literal["text", "image", "audio", "video", "web"]
    label: str
    source: dict[str, Any] = Field(default_factory=dict)
    alt: str | None = None
    embed: str | None = None
    embed_id: str | None = None


class InteractiveNodePatch(BaseModel):
    label: str | None = None
    source: dict[str, Any] | None = None
    alt: str | None = None
    embed: str | None = None
    embed_id: str | None = None


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
