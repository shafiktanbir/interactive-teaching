from fastapi import APIRouter, Depends

from app.controllers.interactive_nodes import InteractiveNodeController
from app.dependencies import get_interactive_controller
from app.models.schemas import (
    ResolvedAudio,
    ResolvedImage,
    ResolvedText,
    ResolvedVideo,
)

router = APIRouter(prefix="/interactive-nodes", tags=["interactive-nodes"])


@router.get(
    "/{node_id}",
    response_model=ResolvedText | ResolvedImage | ResolvedAudio | ResolvedVideo,
)
async def get_interactive_node(
    node_id: str,
    controller: InteractiveNodeController = Depends(get_interactive_controller),
):
    return await controller.get_resolved(node_id)
