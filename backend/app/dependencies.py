from typing import Annotated

from fastapi import Depends, Request

from app.config import Settings, get_settings
from app.controllers.interactive_nodes import InteractiveNodeController
from app.controllers.lessons import LessonController
from app.repositories.interactive_nodes import InteractiveNodeRepository
from app.repositories.lessons import LessonRepository


def get_db(request: Request):
    return request.app.state.db


def _settings_dep() -> Settings:
    return get_settings()


def get_lesson_controller(request: Request) -> LessonController:
    return LessonController(LessonRepository(get_db(request)))


def get_interactive_controller(
    request: Request,
    settings: Annotated[Settings, Depends(_settings_dep)],
) -> InteractiveNodeController:
    return InteractiveNodeController(
        InteractiveNodeRepository(get_db(request)),
        settings,
    )
