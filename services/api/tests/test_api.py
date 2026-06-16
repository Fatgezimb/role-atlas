from __future__ import annotations

from fastapi.testclient import TestClient

from role_atlas_api.database import configure_engine, init_db
from role_atlas_api.main import app


def client_for(tmp_path):
    configure_engine(f"sqlite:///{tmp_path}/role-atlas-test.sqlite3")
    init_db(seed=True)
    return TestClient(app)


def test_search_returns_ranked_jobs_and_markers(tmp_path):
    client = client_for(tmp_path)
    response = client.post(
        "/search",
        json={
            "query": "Find remote PMHNP contract roles over $90/hr with sign-on bonus",
            "filters": {"employment_type": "contract", "min_hourly": 90, "sign_on_bonus": True},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["jobs"][0]["title"] == "Telehealth PMHNP - Contract"
    assert payload["markers"][0]["remote_type"] == "remote_state_based"
    assert payload["aggregations"]["matching_roles"] >= 1


def test_search_filters_bcba_roles(tmp_path):
    client = client_for(tmp_path)
    response = client.post(
        "/search",
        json={
            "query": "Find remote BCBA contract roles over $70/hr with sign-on bonus",
            "filters": {"role": "BCBA", "employment_type": "contract", "min_hourly": 70, "sign_on_bonus": True},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["jobs"]
    assert payload["jobs"][0]["title"] == "Remote BCBA - Contract"
    assert all("BCBA" in job["title"] or "Behavior Analyst" in job["title"] for job in payload["jobs"])


def test_scrape_run_lifecycle(tmp_path):
    client = client_for(tmp_path)
    created = client.post("/scrape-runs", json={"source": "fixture"})

    assert created.status_code == 200
    run = created.json()
    assert run["status"] == "completed"
    assert run["discovered_count"] >= 8

    fetched = client.get(f"/scrape-runs/{run['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == run["id"]


def test_status_patch_updates_job_feedback_fields(tmp_path):
    client = client_for(tmp_path)
    search = client.post("/search", json={"query": "remote PMHNP"})
    job_id = search.json()["jobs"][0]["id"]

    response = client.patch(f"/jobs/{job_id}/status", json={"saved": True, "applied": True, "notes": "Strong fit"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["saved"] is True
    assert payload["applied"] is True
    assert payload["notes"] == "Strong fit"


def test_analytics_summary(tmp_path):
    client = client_for(tmp_path)
    response = client.get("/analytics/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["matching_roles"] >= 12
    assert payload["remote_share"] > 0
