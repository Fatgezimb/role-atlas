from __future__ import annotations

import json
from pathlib import Path

from .base import RawJobPosting


class FixtureAdapter:
    """Deterministic adapter used for local development and tests.

    It exercises the same adapter contract as a live job board scraper without
    sending network traffic or depending on a third-party page layout.
    """

    source_name = "fixture"

    def __init__(self, fixture_path: Path | None = None) -> None:
        self.fixture_path = fixture_path or Path(__file__).resolve().parents[1] / "fixtures" / "sample_jobs.json"

    def fetch(self) -> list[RawJobPosting]:
        rows = json.loads(self.fixture_path.read_text())
        return [RawJobPosting(**row) for row in rows]

