"""Consistent error envelope: ``{"error": {"code", "message", "details"}}``."""

import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app.errors")


class AppError(Exception):
    status_code = status.HTTP_400_BAD_REQUEST
    code = "bad_request"

    def __init__(self, message: str, *, details: Any = None, code: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.details = details
        if code:
            self.code = code


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class ValidationProblem(AppError):
    """Request is well-formed but semantically invalid (e.g. unsupported option)."""

    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    code = "validation_failed"


def _envelope(status_code: int, code: str, message: str, details: Any = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "details": details}},
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return _envelope(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def handle_validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        # Discriminated unions prefix locations with the tag ("body", "image", "prompt");
        # drop it so clients see plain field names.
        tag = exc.body.get("kind") if isinstance(exc.body, dict) else None
        details = []
        for err in exc.errors():
            loc = [str(p) for p in err["loc"]]
            if loc and loc[0] == "body":
                loc = loc[1:]
                if tag and len(loc) > 1 and loc[0] == tag:
                    loc = loc[1:]
            details.append({"field": ".".join(loc), "message": err["msg"]})
        return _envelope(422, "validation_failed", "Request validation failed.", details)

    @app.exception_handler(StarletteHTTPException)
    async def handle_http(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = "not_found" if exc.status_code == 404 else "http_error"
        return _envelope(exc.status_code, code, str(exc.detail))

    @app.exception_handler(Exception)
    async def handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return _envelope(500, "internal_error", "An unexpected error occurred.")
