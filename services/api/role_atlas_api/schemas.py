from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SearchFilters(BaseModel):
    location: str | None = None
    state: str | None = None
    role: str | None = None
    employment_type: str | None = None
    remote_type: str | None = None
    min_hourly: float | None = None
    min_salary: float | None = None
    benefits: list[str] = Field(default_factory=list)
    sign_on_bonus: bool | None = None
    relocation: bool | None = None


class SearchRequest(BaseModel):
    query: str = "Find remote PMHNP contract roles over $90/hr with sign-on bonus"
    filters: SearchFilters = Field(default_factory=SearchFilters)
    sort: str = "best_match"
    limit: int = Field(default=50, ge=1, le=250)


class JobStatusPatch(BaseModel):
    saved: bool | None = None
    applied: bool | None = None
    hidden: bool | None = None
    notes: str | None = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    employer: str
    location_text: str
    state: str | None
    latitude: float
    longitude: float
    description: str
    source: str
    source_url: str
    posted_at: str | None
    scraped_at: datetime
    remote_type: str
    employment_type: str
    salary_min: float | None
    salary_max: float | None
    hourly_min: float | None
    hourly_max: float | None
    benefits: list[str]
    has_sign_on_bonus: bool
    has_relocation: bool
    license_states: list[str]
    requirements: list[str]
    extraction_confidence: dict[str, float]
    saved: bool
    applied: bool
    hidden: bool
    notes: str | None
    match_score: float = 0.0
    match_reasons: list[str] = Field(default_factory=list)


class MapMarker(BaseModel):
    id: str
    latitude: float
    longitude: float
    remote_type: str
    employment_type: str
    state: str | None
    count: int = 1
    match_score: float


class AnalyticsSummary(BaseModel):
    matching_roles: int
    median_hourly: float | None
    median_salary: float | None
    remote_share: float
    contract_share: float
    benefits_average: float
    roles_by_state: list[dict[str, int | str]]
    pay_distribution: list[dict[str, int | str]]
    trend: list[dict[str, int | str]]
    benefit_completeness: float


class SearchResponse(BaseModel):
    jobs: list[JobOut]
    markers: list[MapMarker]
    aggregations: AnalyticsSummary
    query: str
    sort: str
    confidence: dict[str, float]


class ScrapeRunRequest(BaseModel):
    source: str = "fixture"


class ScrapeRunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source: str
    status: str
    started_at: datetime
    finished_at: datetime | None
    discovered_count: int
    inserted_count: int
    updated_count: int
    errors: list[str]

