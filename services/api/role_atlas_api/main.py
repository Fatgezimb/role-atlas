from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from role_atlas_worker.scraper import run_scrape

from .database import get_session, init_db, upsert_jobs
from .models import Job, ScrapeRun
from .schemas import (
    AnalyticsSummary,
    JobOut,
    JobStatusPatch,
    ScrapeRunOut,
    ScrapeRunRequest,
    SearchRequest,
    SearchResponse,
)
from .search_service import default_summary, get_job_detail, search


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db(seed=True)
    yield


app = FastAPI(title="Role Atlas API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/search", response_model=SearchResponse)
def search_jobs(request: SearchRequest, session: Session = Depends(get_session)) -> SearchResponse:
    return search(session, request)


@app.post("/scrape-runs", response_model=ScrapeRunOut)
def create_scrape_run(request: ScrapeRunRequest, session: Session = Depends(get_session)) -> ScrapeRunOut:
    run = ScrapeRun(source=request.source, status="running")
    session.add(run)
    session.commit()
    session.refresh(run)

    result = run_scrape(request.source)
    inserted, updated = upsert_jobs(session, result.postings)
    run.status = "failed" if result.errors else "completed"
    run.finished_at = datetime.now(timezone.utc)
    run.discovered_count = len(result.postings)
    run.inserted_count = inserted
    run.updated_count = updated
    run.errors = result.errors
    session.add(run)
    session.commit()
    session.refresh(run)
    return ScrapeRunOut.model_validate(run)


@app.get("/scrape-runs/{run_id}", response_model=ScrapeRunOut)
def get_scrape_run(run_id: str, session: Session = Depends(get_session)) -> ScrapeRunOut:
    run = session.get(ScrapeRun, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Scrape run not found")
    return ScrapeRunOut.model_validate(run)


@app.get("/jobs/{job_id}", response_model=JobOut)
def get_job(job_id: str, session: Session = Depends(get_session)) -> JobOut:
    job = get_job_detail(session, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.patch("/jobs/{job_id}/status", response_model=JobOut)
def update_job_status(job_id: str, patch: JobStatusPatch, session: Session = Depends(get_session)) -> JobOut:
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    updates = patch.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(job, key, value)
    job.updated_at = datetime.now(timezone.utc)
    session.add(job)
    session.commit()
    session.refresh(job)
    return get_job_detail(session, job_id)  # type: ignore[return-value]


@app.get("/analytics/summary", response_model=AnalyticsSummary)
def analytics_summary(session: Session = Depends(get_session)) -> AnalyticsSummary:
    return default_summary(session)

