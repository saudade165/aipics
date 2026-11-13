import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware
from app.core.settings import Settings, get_settings
from app.services.catalog import get_catalog


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)
    logger = logging.getLogger("app")

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Stateless API foundation. AI execution, auth, payments and storage are disabled in this release.",
        docs_url="/docs" if settings.docs_enabled else None,
        redoc_url="/redoc" if settings.docs_enabled else None,
        openapi_url="/openapi.json" if settings.docs_enabled else None,
    )

    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )
    register_exception_handlers(app)
    app.include_router(api_router, prefix=settings.api_prefix)

    # Fail fast on malformed catalog configuration.
    catalog = get_catalog()
    logger.info(
        "%s v%s started (%s) with %d catalog models; CORS origins: %s",
        settings.app_name,
        settings.app_version,
        settings.environment,
        len(catalog.list()),
        ", ".join(settings.cors_origin_list),
    )
    return app


app = create_app()
