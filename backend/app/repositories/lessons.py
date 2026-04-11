from datetime import datetime, timezone
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

from app.models.schemas import Lesson, LessonInput, TOCItem


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


class LessonRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["lessons"]

    async def get_by_id(self, lesson_id: str) -> Lesson | None:
        try:
            oid = ObjectId(lesson_id)
        except InvalidId:
            return None
        doc = await self._col.find_one({"_id": oid})
        if not doc:
            return None
        updated = doc.get("updated_at")
        if isinstance(updated, datetime) and updated.tzinfo is None:
            updated = updated.replace(tzinfo=timezone.utc)
        return Lesson(
            id=str(doc["_id"]),
            title=doc["title"],
            toc=_toc_from_doc(doc.get("toc")),
            content=doc["content"],
            updated_at=updated,
        )

    async def replace(self, lesson_id: str, data: LessonInput) -> Lesson | None:
        try:
            oid = ObjectId(lesson_id)
        except InvalidId:
            return None
        now = datetime.now(timezone.utc)
        toc_dump = [t.model_dump() for t in data.toc]
        result = await self._col.find_one_and_update(
            {"_id": oid},
            {
                "$set": {
                    "title": data.title,
                    "toc": toc_dump,
                    "content": data.content,
                    "updated_at": now,
                }
            },
            return_document=ReturnDocument.AFTER,
        )
        if not result:
            return None
        return Lesson(
            id=str(result["_id"]),
            title=result["title"],
            toc=_toc_from_doc(result.get("toc")),
            content=result["content"],
            updated_at=result.get("updated_at"),
        )
