from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from .adapters.base import RawJobPosting, ScrapeAdapter
from .adapters.fixture import FixtureAdapter
from .normalization import normalize_posting


@dataclass(slots=True)
class ScrapeResult:
    source: str
    started_at: datetime
    finished_at: datetime
    postings: list[dict]
    errors: list[str]


def adapter_for_source(source: str) -> ScrapeAdapter:
    if source in {"fixture", "indeed-demo", "linkedin-demo", "ziprecruiter-demo"}:
        return FixtureAdapter()
    raise ValueError(f"Unsupported source adapter: {source}")


def run_scrape(source: str = "fixture") -> ScrapeResult:
    """Run a configured source adapter and normalize all returned postings."""

    started_at = datetime.now(timezone.utc)
    adapter = adapter_for_source(source)
    errors: list[str] = []
    raw_postings: list[RawJobPosting] = []
    try:
        raw_postings = adapter.fetch()
    except Exception as exc:  # pragma: no cover - retained for live adapters.
        errors.append(str(exc))
    postings = [normalize_posting(posting) for posting in raw_postings]
    return ScrapeResult(
        source=adapter.source_name,
        started_at=started_at,
        finished_at=datetime.now(timezone.utc),
        postings=postings,
        errors=errors,
    )

