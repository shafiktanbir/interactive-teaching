from typing import Any

from fastapi import APIRouter, Depends

from app.controllers.interactive_nodes import InteractiveNodeController
from app.dependencies import get_interactive_controller
from app.models.schemas import (
    InteractiveNodeCreate,
    InteractiveNodePatch,
    ResolvedAudio,
    ResolvedImage,
    ResolvedText,
    ResolvedVideo,
    ResolvedWeb,
)

router = APIRouter(prefix="/interactive-nodes", tags=["interactive-nodes"])


def _serialize_node(doc: dict[str, Any]) -> dict[str, Any]:
    out = dict(doc)
    out["id"] = str(out.pop("_id"))
    return out


@router.post("", status_code=201)
async def create_interactive_node(
    body: InteractiveNodeCreate,
    controller: InteractiveNodeController = Depends(get_interactive_controller),
) -> dict[str, str]:
    node_id = await controller.create(body)
    return {"id": node_id}


@router.get(
    "/{node_id}",
    response_model=ResolvedText | ResolvedImage | ResolvedAudio | ResolvedVideo | ResolvedWeb,
)
async def get_interactive_node(
    node_id: str,
    controller: InteractiveNodeController = Depends(get_interactive_controller),
):
    return await controller.get_resolved(node_id)


@router.patch("/{node_id}")
async def patch_interactive_node(
    node_id: str,
    body: InteractiveNodePatch,
    controller: InteractiveNodeController = Depends(get_interactive_controller),
) -> dict[str, Any]:
    doc = await controller.patch(node_id, body)
    return _serialize_node(doc)
