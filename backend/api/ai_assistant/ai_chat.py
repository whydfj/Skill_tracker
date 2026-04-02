from fastapi import APIRouter

from backend.schemas.tasks import Task_AI_Request_Schema
from backend.schemas.users import AI_Request_Schema
from backend.api.ai_assistant.template import template, template_for_creating_task

from gigachat import GigaChat


router = APIRouter(tags=["AI Assistant"])


@router.post("/ai_request")
async def request_to_ai(user_request: AI_Request_Schema) -> str:
    giga = GigaChat(
        credentials="MDE5YTk3NGUtZDVmYS03ZmJiLWFkM2UtODk0Y2Q2MDQyNzU4OmJkMTkxMWVjLTdhOTAtNGMyMC1hNWUzLTkxOTE0NTAyZjA4ZQ==",
        verify_ssl_certs=False
    )

    response = giga.chat(f"{template}\n{user_request.question}")
    return response.choices[0].message.content


@router.post("/ai_task_autocomplete")
async def ai_task_autocomplete(payload: Task_AI_Request_Schema):
    giga = GigaChat(
        credentials="MDE5YTk3NGUtZDVmYS03ZmJiLWFkM2UtODk0Y2Q2MDQyNzU4OmJkMTkxMWVjLTdhOTAtNGMyMC1hNWUzLTkxOTE0NTAyZjA4ZQ==",
        verify_ssl_certs=False
    )

    response = giga.chat(f"{template_for_creating_task}\n{payload.draft_description}")
    return {"suggested_description": str(response.choices[0].message.content)}

