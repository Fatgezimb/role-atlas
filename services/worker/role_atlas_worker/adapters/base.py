from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Protocol


@dataclass(slots=True)
class RawJobPosting:
    """A source-neutral payload emitted by scraper adapters before normalization."""

    external_id: str
    source: str
    source_url: str
    title: str
    employer: str
    location_text: str
    description: str
    posted_at: str | None = None
    scraped_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: dict[str, str | int | float | bool] = field(default_factory=dict)


class ScrapeAdapter(Protocol):
    """Contract for safe, source-specific job collectors.

    Adapters should keep robots/terms checks, source rate limits, retries, and
    provenance close to the source implementation. The rest of the system only
    depends on the normalized RawJobPosting contract.
    """

    source_name: str

    def fetch(self) -> list[RawJobPosting]:
        """Return raw postings from the source without mutating application state."""

