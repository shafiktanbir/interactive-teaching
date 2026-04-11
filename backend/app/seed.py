from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

# Deterministic ids for docs and API
N_TEXT = ObjectId("507f1f77bcf86cd799439011")
N_IMAGE = ObjectId("507f1f77bcf86cd799439012")
N_AUDIO = ObjectId("507f1f77bcf86cd799439013")
N_VIDEO = ObjectId("507f1f77bcf86cd799439014")
N_YOUTUBE = ObjectId("507f1f77bcf86cd799439015")
LESSON_ID = ObjectId("507f1f77bcf86cd799439020")


def _sample_content() -> dict:
    """TipTap JSON document with interactiveHotspot nodes (matches frontend extension)."""
    return {
        "type": "doc",
        "content": [
            {
                "type": "heading",
                "attrs": {"level": 2},
                "content": [{"type": "text", "text": "News Article with Interactive Elements"}],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "এটি একটি নমুনা অনুচ্ছেদ। শব্দটি দেখুন ",
                    },
                    {
                        "type": "interactiveHotspot",
                        "attrs": {
                            "nodeId": str(N_TEXT),
                            "label": "সন্দেশে",
                        },
                    },
                    {
                        "type": "text",
                        "text": " এবং আরও পাঠ্য।",
                    },
                ],
            },
            {
                "type": "paragraph",
                "content": [
                    {"type": "text", "text": "ইনলাইন অডিও: "},
                    {
                        "type": "interactiveHotspot",
                        "attrs": {"nodeId": str(N_AUDIO), "label": "Audio"},
                    },
                    {"type": "text", "text": " "},
                ],
            },
            {
                "type": "paragraph",
                "content": [
                    {"type": "text", "text": "ছবির উদাহরণ: "},
                    {
                        "type": "interactiveHotspot",
                        "attrs": {"nodeId": str(N_IMAGE), "label": "স্বর্ণ"},
                    },
                ],
            },
        ],
    }


async def seed_if_empty(db: AsyncIOMotorDatabase) -> None:
    nodes = db["interactive_nodes"]
    lessons = db["lessons"]

    if await nodes.estimated_document_count() == 0:
        await nodes.insert_many(
            [
                {
                    "_id": N_TEXT,
                    "label": "A Text",
                    "kind": "text",
                    "source": {
                        "type": "inline",
                        "text": (
                            "This is sample text content that appears in the modal when clicked. "
                            "You can add explanations, definitions, or additional information here."
                        ),
                    },
                },
                {
                    "_id": N_IMAGE,
                    "label": "Image",
                    "kind": "image",
                    "alt": "Teaching illustration",
                    "source": {
                        "type": "inline",
                        "media_url": "https://picsum.photos/seed/interactive/640/360",
                    },
                },
                {
                    "_id": N_AUDIO,
                    "label": "Audio",
                    "kind": "audio",
                    "source": {
                        "type": "inline",
                        "media_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    },
                },
                {
                    "_id": N_VIDEO,
                    "label": "MyVid",
                    "kind": "video",
                    "source": {
                        "type": "inline",
                        "media_url": (
                            "https://commondatastorage.googleapis.com/"
                            "gtv-videos-bucket/sample/BigBuckBunny.mp4"
                        ),
                    },
                },
                {
                    "_id": N_YOUTUBE,
                    "label": "YouTube",
                    "kind": "video",
                    "embed": "youtube",
                    "embed_id": "dQw4w9WgXcQ",
                    "source": {"type": "inline"},
                },
            ]
        )

    if await lessons.estimated_document_count() == 0:
        now = datetime.now(timezone.utc)
        await lessons.insert_one(
            {
                "_id": LESSON_ID,
                "title": "Interactive Teaching Platform",
                "toc": [
                    {
                        "id": "intro",
                        "label": "Introduction",
                        "children": [],
                    },
                    {
                        "id": "detail",
                        "label": "Detailed Explanation",
                        "children": [],
                    },
                    {
                        "id": "resources",
                        "label": "Additional Resources",
                        "children": [],
                    },
                ],
                "content": _sample_content(),
                "updated_at": now,
            }
        )
