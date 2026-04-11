from fastapi import APIRouter, Depends

from app.controllers.lessons import LessonController
from app.dependencies import get_lesson_controller
from app.models.schemas import Lesson, LessonInput

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/{lesson_id}", response_model=Lesson)
async def get_lesson(
    lesson_id: str,
    controller: LessonController = Depends(get_lesson_controller),
) -> Lesson:
    return await controller.get(lesson_id)


@router.put("/{lesson_id}", response_model=Lesson)
async def put_lesson(
    lesson_id: str,
    body: LessonInput,
    controller: LessonController = Depends(get_lesson_controller),
) -> Lesson:
    return await controller.put(lesson_id, body)
