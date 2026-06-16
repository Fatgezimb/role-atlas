from __future__ import annotations

from role_atlas_worker.adapters.fixture import FixtureAdapter
from role_atlas_worker.dedupe import looks_duplicate
from role_atlas_worker.normalization import classify_remote, extract_benefits, extract_compensation, extract_license_states, extract_primary_state, normalize_posting
from role_atlas_worker.ranking import rank_jobs


def test_compensation_extracts_hourly_and_salary_ranges():
    hourly = extract_compensation("Contract role paying $92-$105/hr")
    salary = extract_compensation("W-2 role pays $165k-$190k annually")

    assert hourly["hourly_min"] == 92
    assert hourly["hourly_max"] == 105
    assert salary["salary_min"] == 165000
    assert salary["salary_max"] == 190000


def test_remote_classification_distinguishes_state_based_remote():
    assert classify_remote("Remote TX based must reside in TX", "Austin, TX") == "remote_state_based"
    assert classify_remote("Remote open to US nationwide", "Remote") == "remote_open_us"
    assert classify_remote("Hybrid schedule", "Charlotte, NC") == "hybrid"


def test_benefits_and_license_state_extraction():
    text = "Health, dental, vision, 401k, PTO. License states: TX, NY, CA."

    assert {"Health", "Dental", "Vision", "401k", "PTO"}.issubset(set(extract_benefits(text)))
    assert extract_license_states(text) == ["CA", "NY", "TX"]


def test_primary_state_prefers_location_over_license_state_list():
    state = extract_primary_state("Atlanta, GA (Remote - GA based)", "License eligible states: GA, FL, NC, TN.")

    assert state == "GA"


def test_fixture_adapter_normalizes_jobs_and_ranks_query():
    postings = FixtureAdapter().fetch()
    jobs = [normalize_posting(posting) for posting in postings]
    ranked = rank_jobs(
        "Find remote PMHNP contract roles over $90/hr with sign-on bonus",
        jobs,
        filters={"employment_type": "contract", "min_hourly": 90, "sign_on_bonus": True},
    )

    assert ranked
    assert ranked[0].job["title"] == "Telehealth PMHNP - Contract"
    assert ranked[0].score > 0.7


def test_bcba_roles_normalize_and_rank_by_role_filter():
    postings = FixtureAdapter().fetch()
    jobs = [normalize_posting(posting) for posting in postings]
    ranked = rank_jobs(
        "Find remote BCBA contract roles over $70/hr with sign-on bonus",
        jobs,
        filters={"role": "BCBA", "employment_type": "contract", "min_hourly": 70, "sign_on_bonus": True},
    )

    assert ranked
    assert ranked[0].job["title"] == "Remote BCBA - Contract"
    assert "Active BCBA certification" in ranked[0].job["requirements"][0]


def test_duplicate_fingerprint_matches_formatting_variants():
    first = {"title": "Telehealth PMHNP - Contract", "employer": "Mindful Health Partners", "location_text": "Austin, TX"}
    second = {"title": "Telehealth PMHNP Contract", "employer": "Mindful Health Partners", "location_text": "Austin TX"}

    assert looks_duplicate(first, second)
