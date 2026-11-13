"""Integration points for persistence, file storage and job queues. Interfaces only.

Planned implementations: PostgreSQL (DatabaseRepository), S3-compatible
object storage (FileStorageProvider) and Redis/arq or a managed queue
(GenerationQueueProvider). None are installed in this release.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

T = TypeVar("T")


class DatabaseRepository(ABC, Generic[T]):
    """Generic repository so services never depend on a specific ORM."""

    @abstractmethod
    async def get(self, entity_id: str) -> T | None: ...

    @abstractmethod
    async def list(self, *, owner_id: str, limit: int = 50, cursor: str | None = None) -> list[T]: ...

    @abstractmethod
    async def create(self, entity: T) -> T: ...

    @abstractmethod
    async def update(self, entity_id: str, changes: dict[str, Any]) -> T: ...

    @abstractmethod
    async def delete(self, entity_id: str) -> None: ...


class FileStorageProvider(ABC):
    """Stores uploads and generated outputs; returns opaque keys and signed URLs."""

    @abstractmethod
    async def create_upload_url(self, *, owner_id: str, filename: str, mime_type: str, size_bytes: int) -> dict[str, str]: ...

    @abstractmethod
    async def get_download_url(self, key: str, *, expires_in: int = 3600) -> str: ...

    @abstractmethod
    async def delete(self, key: str) -> None: ...


class GenerationQueueProvider(ABC):
    """Background execution for long-running generation jobs."""

    @abstractmethod
    async def enqueue(self, job_type: str, payload: dict[str, Any]) -> str: ...

    @abstractmethod
    async def status(self, job_id: str) -> str: ...

    @abstractmethod
    async def cancel(self, job_id: str) -> None: ...
