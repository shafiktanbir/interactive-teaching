from fastapi import HTTPException

from app.models.schemas import Lesson, LessonInput
from app.repositories.lessons import LessonRepository


class LessonController:
    def __init__(self, repo: LessonRepository) -> None:
        self._repo = repo

    async def get(self, lesson_id: str) -> Lesson:
        lesson = await self._repo.get_by_id(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        return lesson

    async def put(self, lesson_id: str, data: LessonInput) -> Lesson:
        lesson = await self._repo.replace(lesson_id, data)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        return lesson
