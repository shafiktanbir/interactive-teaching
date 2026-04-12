from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

from app.models.schemas import Lesson, LessonInput, LessonPatch, MultimediaStripItem, TOCItem


def _toc_from_doc(items: list[dict[str, Any]] | None) -> list[TOCItem]:
    out: list[TOCItem] = []
    for raw in items or []:
        children_raw = raw.get("children") or []
        out.append(
            TOCItem(
                id=raw["id"],
                label=raw["label"],
                children=_toc_from_doc(children_raw) if isinstance(children_raw, list) else [],
            )
        )
    return out


def _strip_from_doc(raw: list[dict[str, Any]] | None) -> list[MultimediaStripItem]:
    out: list[MultimediaStripItem] = []
    for row in raw or []:
        out.append(
            MultimediaStripItem(
                node_id=row["node_id"],
                label=row.get("label"),
                kind=row.get("kind"),
            )
        )
    return out


class LessonRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["lessons"]
        self._db = db

    def _doc_to_lesson(self, doc: dict[str, Any]) -> Lesson:
        updated = doc.get("updated_at")
        if isinstance(updated, datetime) and updated.tzinfo is None:
            updated = updated.replace(tzinfo=timezone.utc)
        return Lesson(
            id=str(doc["_id"]),
            title=doc["title"],
            toc=_toc_from_doc(doc.get("toc")),
            content=doc["content"],
            multimedia_strip=_strip_from_doc(doc.get("multimedia_strip")),
            updated_at=updated,
        )

    async def get_by_id(self, lesson_id: str) -> Lesson | None:
        try:
            oid = ObjectId(lesson_id)
        except InvalidId:
            return None
        doc = await self._col.find_one({"_id": oid})
        if not doc:
            return None
        lesson = self._doc_to_lesson(doc)
        return await self._enrich_strip_kinds(lesson)

    async def _enrich_strip_kinds(self, lesson: Lesson) -> Lesson:
        nodes = self._db["interactive_nodes"]
        enriched: list[MultimediaStripItem] = []
        for item in lesson.multimedia_strip:
            kind_val: str | None = item.kind
            try:
                nid = ObjectId(item.node_id)
            except InvalidId:
                enriched.append(item)
                continue
            node = await nodes.find_one({"_id": nid})
            if node:
                kind_val = node.get("kind")
            enriched.append(
                MultimediaStripItem(
                    node_id=item.node_id,
                    label=item.label,
                    kind=kind_val,
                )
            )
        return lesson.model_copy(update={"multimedia_strip": enriched})

    async def replace(self, lesson_id: str, data: LessonInput) -> Lesson | None:
        try:
            oid = ObjectId(lesson_id)
        except InvalidId:
            return None
        now = datetime.now(timezone.utc)
        toc_dump = [t.model_dump() for t in data.toc]
        strip_dump = [
            {"node_id": s.node_id, "label": s.label} for s in data.multimedia_strip
        ]
        result = await self._col.find_one_and_update(
            {"_id": oid},
            {
                "$set": {
                    "title": data.title,
                    "toc": toc_dump,
                    "content": data.content,
                    "multimedia_strip": strip_dump,
                    "updated_at": now,
                }
            },
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            return None
        return self._doc_to_lesson(result)

    async def patch(self, lesson_id: str, data: LessonPatch) -> Lesson | None:
        try:
            oid = ObjectId(lesson_id)
        except InvalidId:
            return None
        existing = await self._col.find_one({"_id": oid})
        if not existing:
            return None
        now = datetime.now(timezone.utc)
        updates: dict[str, Any] = {"updated_at": now}
        if data.title is not None:
            updates["title"] = data.title
        if data.toc is not None:
            updates["toc"] = [t.model_dump() for t in data.toc]
        if data.content is not None:
            updates["content"] = data.content
        if data.multimedia_strip is not None:
            updates["multimedia_strip"] = [
                {"node_id": s.node_id, "label": s.label} for s in data.multimedia_strip
            ]
        result = await self._col.find_one_and_update(
            {"_id": oid},
            {"$set": updates},
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            return None
        return self._doc_to_lesson(result)
