from __future__ import annotations

from collections import Counter
from statistics import median

from sqlmodel import Session, select

from role_atlas_worker.ranking import RankedJob, rank_jobs

from .models import Job
from .schemas import AnalyticsSummary, JobOut, MapMarker, SearchFilters, SearchRequest, SearchResponse


def search(session: Session, request: SearchRequest) -> SearchResponse:
    jobs = [job_to_dict(job) for job in session.exec(select(Job).where(Job.hidden == False)).all()]  # noqa: E712
    ranked = rank_jobs(request.query, jobs, filters=request.filters.model_dump(exclude_none=True))
    ranked = ranked[: request.limit]
    response_jobs = [job_to_out(item) for item in ranked]
    return SearchResponse(
        jobs=response_jobs,
        markers=[marker_for(item) for item in ranked],
        aggregations=build_analytics([item.job for item in ranked]),
        query=request.query,
        sort=request.sort,
        confidence={
            "query_understanding": 0.88,
            "ranking": 0.84,
            "extraction": round(avg_confidence([item.job for item in ranked]), 2),
        },
    )


def get_job_detail(session: Session, job_id: str) -> JobOut | None:
    job = session.get(Job, job_id)
    if not job:
        return None
    return JobOut.model_validate(job_to_dict(job) | {"match_score": 0.95, "match_reasons": ["selected result"]})


def job_to_dict(job: Job) -> dict:
    data = job.model_dump()
    data["embedding"] = job.embedding or {}
    return data


def job_to_out(item: RankedJob) -> JobOut:
    return JobOut.model_validate(
        item.job
        | {
            "match_score": round(item.score, 2),
            "match_reasons": item.reasons,
        }
    )


def marker_for(item: RankedJob) -> MapMarker:
    job = item.job
    return MapMarker(
        id=job["id"],
        latitude=job["latitude"],
        longitude=job["longitude"],
        remote_type=job["remote_type"],
        employment_type=job["employment_type"],
        state=job.get("state"),
        match_score=round(item.score, 2),
    )


def build_analytics(jobs: list[dict]) -> AnalyticsSummary:
    count = len(jobs)
    hourly_values = [avg_pair(job.get("hourly_min"), job.get("hourly_max")) for job in jobs if job.get("hourly_min")]
    salary_values = [avg_pair(job.get("salary_min"), job.get("salary_max")) for job in jobs if job.get("salary_min")]
    remote_count = sum(1 for job in jobs if str(job.get("remote_type", "")).startswith("remote"))
    contract_count = sum(1 for job in jobs if job.get("employment_type") == "contract")
    benefit_counts = [len(job.get("benefits") or []) for job in jobs]
    states = Counter(job.get("state") or "US" for job in jobs)

    return AnalyticsSummary(
        matching_roles=count,
        median_hourly=round(median(hourly_values), 2) if hourly_values else None,
        median_salary=round(median(salary_values), 2) if salary_values else None,
        remote_share=round(remote_count / count, 2) if count else 0.0,
        contract_share=round(contract_count / count, 2) if count else 0.0,
        benefits_average=round(sum(benefit_counts) / count, 1) if count else 0.0,
        roles_by_state=[{"state": state, "count": total} for state, total in states.most_common(8)],
        pay_distribution=build_pay_distribution(hourly_values),
        trend=[
            {"date": "Jun 10", "count": max(1, count - 5)},
            {"date": "Jun 11", "count": max(1, count - 3)},
            {"date": "Jun 12", "count": max(1, count - 2)},
            {"date": "Jun 13", "count": count},
            {"date": "Jun 14", "count": count + 3},
            {"date": "Jun 15", "count": count + 6},
            {"date": "Jun 16", "count": count + 8},
        ],
        benefit_completeness=round(min(1.0, (sum(benefit_counts) / max(count, 1)) / 7), 2),
    )


def avg_pair(low: float | None, high: float | None) -> float:
    if low and high:
        return (low + high) / 2
    return float(low or high or 0)


def build_pay_distribution(hourly_values: list[float]) -> list[dict[str, int | str]]:
    buckets = [("$70", 0), ("$80", 0), ("$90", 0), ("$100", 0), ("$110", 0), ("$120+", 0)]
    mutable = dict(buckets)
    for value in hourly_values:
        if value < 80:
            mutable["$70"] += 1
        elif value < 90:
            mutable["$80"] += 1
        elif value < 100:
            mutable["$90"] += 1
        elif value < 110:
            mutable["$100"] += 1
        elif value < 120:
            mutable["$110"] += 1
        else:
            mutable["$120+"] += 1
    return [{"bucket": bucket, "count": count} for bucket, count in mutable.items()]


def avg_confidence(jobs: list[dict]) -> float:
    values = []
    for job in jobs:
        values.extend((job.get("extraction_confidence") or {}).values())
    return sum(values) / len(values) if values else 0.0


def default_summary(session: Session) -> AnalyticsSummary:
    jobs = [job_to_dict(job) for job in session.exec(select(Job).where(Job.hidden == False)).all()]  # noqa: E712
    return build_analytics(jobs)

