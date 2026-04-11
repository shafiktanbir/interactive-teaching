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
