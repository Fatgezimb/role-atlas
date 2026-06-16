from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Job(SQLModel, table=True):
    id: str = Field(primary_key=True)
    external_id: str
    fingerprint: str = Field(index=True)
    source: str = Field(index=True)
    source_url: str
    title: str = Field(index=True)
    employer: str
    location_text: str
    state: str | None = Field(default=None, index=True)
    latitude: float
    longitude: float
    description: str
    posted_at: str | None = None
    scraped_at: datetime = Field(default_factory=utc_now)
    remote_type: str = Field(index=True)
    employment_type: str = Field(index=True)
    salary_min: float | None = None
    salary_max: float | None = None
    hourly_min: float | None = None
    hourly_max: float | None = None
    benefits: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    has_sign_on_bonus: bool = Field(default=False, index=True)
    has_relocation: bool = Field(default=False, index=True)
    license_states: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    requirements: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    extraction_confidence: dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    embedding: dict[str, float] = Field(default_factory=dict, sa_column=Column(JSON))
    raw_payload: dict = Field(default_factory=dict, sa_column=Column(JSON))
    saved: bool = Field(default=False, index=True)
    applied: bool = Field(default=False, index=True)
    hidden: bool = Field(default=False, index=True)
    notes: str | None = None
    updated_at: datetime = Field(default_factory=utc_now)


class ScrapeRun(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    source: str = Field(index=True)
    status: str = Field(default="queued", index=True)
    started_at: datetime = Field(default_factory=utc_now)
    finished_at: datetime | None = None
    discovered_count: int = 0
    inserted_count: int = 0
    updated_count: int = 0
    errors: list[str] = Field(default_factory=list, sa_column=Column(JSON))

