from fastapi import APIRouter

from app.api.deps import GenerationDep
from app.schemas.generation import GenerationPreviewResponse, GenerationRequest

router = APIRouter(prefix="/generations", tags=["generations"])


@router.post(
    "/preview",
    response_model=GenerationPreviewResponse,
    summary="Validate a generation configuration (execution disabled)",
    description=(
        "Validates the request against the model catalog and returns a cost estimate. "
        "No content is generated: AI execution is disabled in this release, and the "
        "response always reports `executed: false`."
    ),
    responses={422: {"description": "Invalid or unsupported configuration"}},
)
def preview_generation(service: GenerationDep, request: GenerationRequest) -> GenerationPreviewResponse:
    return service.preview(request)
