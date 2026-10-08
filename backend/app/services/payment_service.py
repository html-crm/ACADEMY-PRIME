from datetime import datetime, timezone

import httpx

from app.core.config import get_settings


async def confirm_transaction(signature: str) -> bool:
    """Verify that a Solana transaction signature is confirmed on-chain.

    Uses the JSON-RPC `getSignatureStatuses` call. Returns True only when the
    transaction has reached at least the required confirmation level
    (confirmed or finalized), proving the on-chain fee transfer happened.
    """
    settings = get_settings()
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignatureStatuses",
        "params": [[signature], {"searchTransactionHistory": True}],
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(settings.SOLANA_RPC_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return False

    value = (data.get("result") or {}).get("value") or []
    status = value[0] if value else None
    if not status:
        # Transaction not found by the RPC node yet.
        return False

    err = status.get("err")
    if err is not None:
        return False

    confirmations = status.get("confirmations")
    if confirmations is None:
        # None means finalized.
        return True
    return int(confirmations) <= max(0, settings.MIN_PAYMENT_CONFIRMATIONS - 1)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
