"""Integration points for accounts, billing and tokens. Interfaces only."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class Identity:
    user_id: str
    email: str | None
    display_name: str | None
    provider: str  # "email", "google", "github", "telegram", ...


class AuthenticationProvider(ABC):
    """Resolves a request credential (session cookie, bearer token) to an identity."""

    @abstractmethod
    async def authenticate(self, credential: str) -> Identity | None: ...

    @abstractmethod
    async def revoke(self, credential: str) -> None: ...


@dataclass(frozen=True)
class TokenReservation:
    reservation_id: str
    user_id: str
    amount: int


class TokenWalletService(ABC):
    """Two-phase token accounting: reserve before a job, then commit or release."""

    @abstractmethod
    async def get_balance(self, user_id: str) -> int: ...

    @abstractmethod
    async def reserve(self, user_id: str, amount: int, reason: str) -> TokenReservation: ...

    @abstractmethod
    async def commit(self, reservation_id: str) -> None: ...

    @abstractmethod
    async def release(self, reservation_id: str) -> None: ...

    @abstractmethod
    async def credit(self, user_id: str, amount: int, reason: str) -> None: ...


@dataclass(frozen=True)
class CheckoutSession:
    session_id: str
    redirect_url: str


class PaymentProvider(ABC):
    """Subscription checkout and webhook handling (e.g. Stripe, Paddle)."""

    @abstractmethod
    async def create_checkout(self, user_id: str, plan_id: str, interval: str) -> CheckoutSession: ...

    @abstractmethod
    async def create_portal_link(self, user_id: str) -> str: ...

    @abstractmethod
    async def handle_webhook(self, payload: bytes, signature: str) -> None: ...
