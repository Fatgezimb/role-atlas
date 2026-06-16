from __future__ import annotations

import re


_NON_WORD = re.compile(r"[^a-z0-9]+")


def compact_text(value: str) -> str:
    return _NON_WORD.sub(" ", value.lower()).strip()


def job_fingerprint(title: str, employer: str, location_text: str) -> str:
    """Build a stable dedupe key from fields that survive source formatting drift."""

    title_key = compact_text(title)
    employer_key = compact_text(employer)
    location_key = compact_text(location_text)
    return "|".join([title_key, employer_key, location_key])


def looks_duplicate(first: dict[str, str], second: dict[str, str]) -> bool:
    return job_fingerprint(first["title"], first["employer"], first["location_text"]) == job_fingerprint(
        second["title"], second["employer"], second["location_text"]
    )

