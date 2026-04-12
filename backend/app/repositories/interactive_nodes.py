from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from bson.errors import InvalidId


class InteractiveNodeRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db["interactive_nodes"]

    async def get_raw(self, node_id: str) -> dict | None:
        try:
            oid = ObjectId(node_id)
        except InvalidId:
            return None
        return await self._col.find_one({"_id": oid})

    async def insert(self, doc: dict[str, Any]) -> str:
        result = await self._col.insert_one(doc)
        return str(result.inserted_id)

    async def replace_one(self, node_id: str, doc: dict[str, Any]) -> dict | None:
        try:
            oid = ObjectId(node_id)
        except InvalidId:
            return None
        doc = {**doc, "_id": oid}
        await self._col.replace_one({"_id": oid}, doc)
        return await self.get_raw(node_id)

    async def update_merged(self, node_id: str, set_fields: dict[str, Any]) -> dict | None:
        """Merge nested source if set_fields contains source dict."""
        try:
            oid = ObjectId(node_id)
        except InvalidId:
            return None
        existing = await self._col.find_one({"_id": oid})
        if not existing:
            return None
        updates: dict[str, Any] = {}
        for key, val in set_fields.items():
            if key == "source" and isinstance(val, dict):
                merged = {**(existing.get("source") or {}), **val}
                updates["source"] = merged
            else:
                updates[key] = val
        await self._col.update_one({"_id": oid}, {"$set": updates})
        return await self.get_raw(node_id)
