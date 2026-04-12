from datetime import UTC, datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

# Deterministic ids for docs and API
N_TEXT = ObjectId("507f1f77bcf86cd799439011")
N_IMAGE = ObjectId("507f1f77bcf86cd799439012")
N_AUDIO = ObjectId("507f1f77bcf86cd799439013")
N_VIDEO = ObjectId("507f1f77bcf86cd799439014")
N_YOUTUBE = ObjectId("507f1f77bcf86cd799439015")
LESSON_ID = ObjectId("507f1f77bcf86cd799439020")


def _toc_bodies_demo() -> dict[str, dict]:
    """TipTap JSON documents for sidebar expandable panels."""
    return {
        "intro": {
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": "This introduction summarizes what you will find in the lesson. ",
                        },
                        {"type": "text", "marks": [{"type": "bold"}], "text": "Key ideas"},
                        {"type": "text", "text": " are highlighted for quick scanning."},
                    ],
                },
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Use the main article for full context; expand these sections for "
                                "short notes and resources."
                            ),
                        }
                    ],
                },
            ],
        },
        "detail": {
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": (
                                "Here is a deeper walkthrough of the concepts. You can edit this text "
                                "from the sidebar using the same rich formatting as the article."
                            ),
                        }
                    ],
                },
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Try "},
                        {"type": "text", "marks": [{"type": "italic"}], "text": "italic"},
                        {"type": "text", "text": ", "},
                        {"type": "text", "marks": [{"type": "underline"}], "text": "underline"},
                        {"type": "text", "text": ", and links to supporting material."},
                    ],
                },
            ],
        },
        "resources": {
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": "Additional reading, downloads, and external references can be listed here.",
                        }
                    ],
                },
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Example: "},
                        {
                            "type": "text",
                            "marks": [
                                {
                                    "type": "link",
                                    "attrs": {"href": "https://example.com", "target": "_blank"},
                                }
                            ],
                            "text": "Example resource link",
                        },
                        {"type": "text", "text": " (dummy URL)."},
                    ],
                },
            ],
        },
    }


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
                        "text": (
                            "This section shows how lessons combine ordinary rich text—"
                        ),
                    },
                    {
                        "type": "text",
                        "text": "bold",
                        "marks": [{"type": "bold"}],
                    },
                    {"type": "text", "text": ", "},
                    {
                        "type": "text",
                        "text": "italic",
                        "marks": [{"type": "italic"}],
                    },
                    {"type": "text", "text": ", and "},
                    {
                        "type": "text",
                        "text": "links",
                        "marks": [
                            {
                                "type": "link",
                                "attrs": {
                                    "href": "https://developer.mozilla.org/",
                                    "target": "_blank",
                                    "rel": "noopener noreferrer nofollow",
                                },
                            }
                        ],
                    },
                    {
                        "type": "text",
                        "text": (
                            "—with interactive hotspots. Read the paragraphs below, "
                            "then tap any red term with the magnifying glass to open media or notes."
                        ),
                    },
                ],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "নিচের অনুচ্ছেগুলো শিক্ষকদের জন্য একটি নমুনা সংবাদের অংশ। "
                            "শিক্ষার্থীরা মূল পাঠের মধ্যেই অডিও, ভিডিও বা সংজ্ঞা খুলতে পারে—"
                            "আলাদা ট্যাব বা অ্যাপ ছাড়াই। দীর্ঘ পাঠ হলে বিভাগ শিরোনাম ও "
                            "সাইডবারের সূচিপত্র নেভিগেশন সহজ করে।"
                        ),
                    },
                ],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Teachers can extend this block with more context: background on the topic, "
                            "discussion prompts, or a short summary. The layout stays the same whether "
                            "the body is two lines or two screens long."
                        ),
                    },
                ],
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
        now = datetime.now(UTC)
        demo_bodies = _toc_bodies_demo()
        await lessons.insert_one(
            {
                "_id": LESSON_ID,
                "title": "Interactive Teaching Platform",
                "toc": [
                    {
                        "id": "intro",
                        "label": "Introduction",
                        "children": [],
                        "body": demo_bodies["intro"],
                    },
                    {
                        "id": "detail",
                        "label": "Detailed Explanation",
                        "children": [],
                        "body": demo_bodies["detail"],
                    },
                    {
                        "id": "resources",
                        "label": "Additional Resources",
                        "children": [],
                        "body": demo_bodies["resources"],
                    },
                ],
                "content": _sample_content(),
                "multimedia_strip": [
                    {"node_id": str(N_TEXT), "label": "A Text"},
                    {"node_id": str(N_IMAGE), "label": "Image"},
                    {"node_id": str(N_AUDIO), "label": "Audio"},
                    {"node_id": str(N_VIDEO), "label": "MyVid"},
                    {"node_id": str(N_YOUTUBE), "label": "YouTube"},
                ],
                "updated_at": now,
            }
        )

    # Backfill multimedia_strip on demo lesson if DB was created before this field existed
    demo = await lessons.find_one({"_id": LESSON_ID})
    if demo and not demo.get("multimedia_strip"):
        await lessons.update_one(
            {"_id": LESSON_ID},
            {
                "$set": {
                    "multimedia_strip": [
                        {"node_id": str(N_TEXT), "label": "A Text"},
                        {"node_id": str(N_IMAGE), "label": "Image"},
                        {"node_id": str(N_AUDIO), "label": "Audio"},
                        {"node_id": str(N_VIDEO), "label": "MyVid"},
                        {"node_id": str(N_YOUTUBE), "label": "YouTube"},
                    ]
                }
            },
        )

    # Backfill TOC bodies on demo lesson if created before body field existed
    demo2 = await lessons.find_one({"_id": LESSON_ID})
    if demo2 and demo2.get("toc"):
        toc_raw = demo2["toc"]
        needs_body = isinstance(toc_raw, list) and (
            not toc_raw or not isinstance(toc_raw[0], dict) or toc_raw[0].get("body") is None
        )
        if needs_body:
            bodies = _toc_bodies_demo()
            id_to_body = {
                "intro": bodies["intro"],
                "detail": bodies["detail"],
                "resources": bodies["resources"],
            }
            patched: list[dict] = []
            for row in toc_raw:
                if not isinstance(row, dict):
                    continue
                rid = row.get("id")
                copy = {**row, "body": id_to_body.get(str(rid), bodies["intro"])}
                patched.append(copy)
            await lessons.update_one({"_id": LESSON_ID}, {"$set": {"toc": patched}})
