from datetime import datetime
from typing import Any, Literal, Union

from pydantic import BaseModel, Field


class TOCItem(BaseModel):
    id: str
    label: str
    children: list["TOCItem"] = Field(default_factory=list)


class Lesson(BaseModel):
    id: str
    title: str
    toc: list[TOCItem]
    content: dict[str, Any]
    updated_at: datetime | None = None


class LessonInput(BaseModel):
    title: str
    toc: list[TOCItem]
    content: dict[str, Any]


class ResolvedText(BaseModel):
    kind: Literal["text"] = "text"
    text: str


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


InteractiveNodeResolved = Union[ResolvedText, ResolvedImage, ResolvedAudio, ResolvedVideo]


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
