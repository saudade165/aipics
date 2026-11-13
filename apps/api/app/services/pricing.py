from functools import lru_cache

from app.schemas.platform import PricingResponse

from .catalog import load_json


def build_pricing(billing_enabled: bool) -> PricingResponse:
    data = load_json("pricing.json")
    factor = 1 - data["annual_discount_percent"] / 100
    for plan in data["plans"]:
        plan["annual_monthly_price"] = round(plan["monthly_price"] * factor, 2)
    return PricingResponse.model_validate({**data, "billing_enabled": billing_enabled})


@lru_cache
def get_pricing(billing_enabled: bool) -> PricingResponse:
    return build_pricing(billing_enabled)
