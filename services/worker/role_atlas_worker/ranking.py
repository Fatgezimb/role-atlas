from __future__ import annotations

from dataclasses import dataclass

from .vector_index import cosine_similarity, embed_text


@dataclass(slots=True)
class RankedJob:
    job: dict
    score: float
    reasons: list[str]


def searchable_text(job: dict) -> str:
    parts = [
        job.get("title", ""),
        job.get("employer", ""),
        job.get("location_text", ""),
        job.get("description", ""),
        " ".join(job.get("benefits") or []),
        " ".join(job.get("license_states") or []),
        job.get("employment_type", ""),
        job.get("remote_type", ""),
    ]
    return " ".join(parts)


def rank_jobs(query: str, jobs: list[dict], filters: dict | None = None, feedback: dict[str, float] | None = None) -> list[RankedJob]:
    """Rank jobs using local semantic similarity, extracted facets, and feedback.

    Feedback is intentionally simple: saved/applied roles boost similar postings
    while hidden roles subtract weight. This creates an evaluation surface for
    future learning without making the first version dependent on cloud AI.
    """

    filters = filters or {}
    feedback = feedback or {}
    query_vec = embed_text(query)
    ranked: list[RankedJob] = []
    for job in jobs:
        if not passes_filters(job, filters):
            continue
        job_vec = job.get("embedding") or embed_text(searchable_text(job))
        semantic = cosine_similarity(query_vec, job_vec)
        facet_score, reasons = facet_match_score(job, query, filters)
        feedback_score = feedback.get(job.get("fingerprint", ""), 0.0)
        score = min(0.95, max(0.01, 0.62 + semantic * 0.18 + facet_score * 0.31 + feedback_score))
        ranked.append(RankedJob(job=job, score=round(score, 4), reasons=reasons))
    return sorted(ranked, key=lambda item: item.score, reverse=True)


def passes_filters(job: dict, filters: dict) -> bool:
    role = filters.get("role")
    if role and role != "Any" and not role_matches(job, role):
        return False
    if filters.get("employment_type") and job.get("employment_type") != filters["employment_type"]:
        return False
    if filters.get("remote_type") and job.get("remote_type") != filters["remote_type"]:
        return False
    hourly_equivalent = job.get("hourly_max") or ((job.get("salary_max") or 0) / 2080)
    if filters.get("min_hourly") and hourly_equivalent < float(filters["min_hourly"]):
        return False
    if filters.get("min_salary") and (job.get("salary_max") or 0) < float(filters["min_salary"]):
        return False
    if filters.get("state") and filters["state"] not in (job.get("license_states") or [job.get("state")]):
        return False
    required_benefits = set(filters.get("benefits") or [])
    if required_benefits and not required_benefits.issubset(set(job.get("benefits") or [])):
        return False
    if filters.get("sign_on_bonus") is True and not job.get("has_sign_on_bonus"):
        return False
    if filters.get("relocation") is True and not job.get("has_relocation"):
        return False
    return True


def facet_match_score(job: dict, query: str, filters: dict) -> tuple[float, list[str]]:
    lower_query = query.lower()
    score = 0.0
    reasons: list[str] = []
    if "remote" in lower_query and str(job.get("remote_type", "")).startswith("remote"):
        score += 0.24
        reasons.append("remote match")
    if "contract" in lower_query and job.get("employment_type") == "contract":
        score += 0.22
        reasons.append("contract match")
    if ("sign-on" in lower_query or "sign on" in lower_query or "bonus" in lower_query) and job.get("has_sign_on_bonus"):
        score += 0.18
        reasons.append("bonus match")
    if "relocation" in lower_query and job.get("has_relocation"):
        score += 0.12
        reasons.append("relocation match")
    if "pmhnp" in lower_query and "pmhnp" in job.get("title", "").lower():
        score += 0.18
        reasons.append("role match")
    if ("bcba" in lower_query or str(filters.get("role", "")).lower() == "bcba") and role_matches(job, "BCBA"):
        score += 0.2
        reasons.append("role match")
    if (job.get("hourly_max") or 0) >= 95:
        score += 0.04
        reasons.append("top hourly range")
    if len(job.get("benefits") or []) >= 5:
        score += 0.04
        reasons.append("benefit depth")
    if job.get("has_relocation"):
        score += 0.03
        reasons.append("relocation available")
    if filters:
        score += 0.08
        reasons.append("filter match")
    return min(score, 1.0), reasons


def role_matches(job: dict, role: str) -> bool:
    role_key = role.lower()
    text = searchable_text(job).lower()
    if role_key == "bcba":
        return "bcba" in text or "board certified behavior analyst" in text
    if role_key == "pmhnp":
        return "pmhnp" in text or "psychiatric nurse practitioner" in text
    return role_key in text
