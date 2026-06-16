from __future__ import annotations

import re
from dataclasses import asdict

from .adapters.base import RawJobPosting
from .dedupe import job_fingerprint


STATE_CODES = {
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC",
}

STATE_COORDS = {
    "AL": (32.8067, -86.7911),
    "AZ": (33.7298, -111.4312),
    "AR": (34.9697, -92.3731),
    "CA": (36.7783, -119.4179),
    "CO": (39.5501, -105.7821),
    "CT": (41.6032, -73.0877),
    "DE": (38.9108, -75.5277),
    "FL": (27.6648, -81.5158),
    "GA": (32.1656, -82.9001),
    "IA": (41.878, -93.0977),
    "ID": (44.0682, -114.742),
    "IL": (40.6331, -89.3985),
    "IN": (40.2672, -86.1349),
    "KS": (39.0119, -98.4842),
    "KY": (37.8393, -84.27),
    "LA": (30.9843, -91.9623),
    "MA": (42.4072, -71.3824),
    "MD": (39.0458, -76.6413),
    "ME": (45.2538, -69.4455),
    "MI": (44.3148, -85.6024),
    "MN": (46.7296, -94.6859),
    "MO": (37.9643, -91.8318),
    "MS": (32.3547, -89.3985),
    "MT": (46.8797, -110.3626),
    "NC": (35.7596, -79.0193),
    "ND": (47.5515, -101.002),
    "NE": (41.4925, -99.9018),
    "NH": (43.1939, -71.5724),
    "NJ": (40.0583, -74.4057),
    "NM": (34.5199, -105.8701),
    "NV": (38.8026, -116.4194),
    "NY": (43.2994, -74.2179),
    "OH": (40.4173, -82.9071),
    "OK": (35.0078, -97.0929),
    "OR": (43.8041, -120.5542),
    "PA": (41.2033, -77.1945),
    "RI": (41.5801, -71.4774),
    "SC": (33.8361, -81.1637),
    "SD": (43.9695, -99.9018),
    "TN": (35.5175, -86.5804),
    "TX": (31.9686, -99.9018),
    "UT": (39.321, -111.0937),
    "VA": (37.4316, -78.6569),
    "VT": (44.5588, -72.5778),
    "WA": (47.7511, -120.7401),
    "WI": (43.7844, -88.7879),
    "WV": (38.5976, -80.4549),
    "WY": (43.076, -107.2903),
    "DC": (38.9072, -77.0369),
}

BENEFIT_PATTERNS = {
    "Health": r"\bhealth(?:care)?\b|medical",
    "Dental": r"\bdental\b",
    "Vision": r"\bvision\b",
    "401k": r"401\s?\(?k\)?|retirement",
    "PTO": r"\bpto\b|paid time off|vacation",
    "Malpractice": r"malpractice",
    "CME": r"\bcme\b|continuing education",
}

LICENSE_REGEX = re.compile(r"\b(?:license|licensed|compact|eligible|state[s]?)[:\s,-]*(?P<states>(?:[A-Z]{2}[\s,/&+-]*){1,8})")
MONEY_REGEX = re.compile(r"\$(?P<amount>\d{2,3})(?:,\d{3})?(?:k|K)?(?:\s?-\s?\$(?P<upper>\d{2,3})(?:,\d{3})?(?:k|K)?)?\s*/?\s?(?P<unit>hr|hour|year|yr|annually)?")


def normalize_posting(posting: RawJobPosting) -> dict:
    """Convert raw source text into the canonical Role Atlas job shape.

    The confidence fields identify values inferred from messy job text instead
    of values explicitly supplied by a source API. They drive UI warnings and
    allow later model evaluation without changing the public API.
    """

    text = " ".join([posting.title, posting.location_text, posting.description])
    state = extract_primary_state(posting.location_text, posting.description)
    latitude, longitude = STATE_COORDS.get(state or "TX", (39.5, -98.35))
    pay = extract_compensation(text)
    remote_type = classify_remote(text, posting.location_text)
    benefits = extract_benefits(text)
    bonus = has_bonus(text)
    relocation = has_relocation(text)
    employment_type = classify_employment(text)
    eligible_states = extract_license_states(text, fallback=state)
    raw = asdict(posting)
    raw["scraped_at"] = posting.scraped_at.isoformat()

    return {
        "id": f"{posting.source}:{posting.external_id}",
        "external_id": posting.external_id,
        "fingerprint": job_fingerprint(posting.title, posting.employer, posting.location_text),
        "source": posting.source,
        "source_url": posting.source_url,
        "title": posting.title,
        "employer": posting.employer,
        "location_text": posting.location_text,
        "state": state,
        "latitude": latitude,
        "longitude": longitude,
        "description": posting.description,
        "posted_at": posting.posted_at,
        "scraped_at": posting.scraped_at,
        "remote_type": remote_type,
        "employment_type": employment_type,
        "salary_min": pay["salary_min"],
        "salary_max": pay["salary_max"],
        "hourly_min": pay["hourly_min"],
        "hourly_max": pay["hourly_max"],
        "benefits": benefits,
        "has_sign_on_bonus": bonus,
        "has_relocation": relocation,
        "license_states": eligible_states,
        "requirements": extract_requirements(text, eligible_states),
        "extraction_confidence": {
            "compensation": pay["confidence"],
            "remote_type": 0.92 if "remote" in text.lower() else 0.78,
            "benefits": min(0.98, 0.55 + len(benefits) * 0.07),
            "license_states": 0.9 if eligible_states else 0.45,
        },
        "raw_payload": raw,
    }


def extract_primary_state(location_text: str, description: str = "") -> str | None:
    for haystack in (location_text, description):
        match = re.search(r"\b[A-Z]{2}\b", haystack)
        if match and match.group(0) in STATE_CODES:
            return match.group(0)
    return None


def classify_remote(text: str, location_text: str) -> str:
    lower = f"{text} {location_text}".lower()
    if "open to us" in lower or "anywhere in the us" in lower or "nationwide" in lower:
        return "remote_open_us"
    if "remote" in lower and ("based" in lower or "must reside" in lower or "licensed in" in lower):
        return "remote_state_based"
    if "remote" in lower:
        return "remote_open_us"
    if "hybrid" in lower:
        return "hybrid"
    return "onsite"


def classify_employment(text: str) -> str:
    lower = text.lower()
    if "contract" in lower or "1099" in lower:
        return "contract"
    return "w2"


def extract_compensation(text: str) -> dict[str, float | None]:
    hourly: list[float] = []
    salary: list[float] = []
    for match in MONEY_REGEX.finditer(text):
        amount = float(match.group("amount"))
        upper = float(match.group("upper")) if match.group("upper") else None
        unit = (match.group("unit") or "").lower()
        is_salary = unit in {"year", "yr", "annually"} or "k" in match.group(0).lower()
        values = [amount, upper or amount]
        if is_salary:
            salary.extend([v * 1000 if v < 1000 else v for v in values])
        else:
            hourly.extend(values)

    return {
        "hourly_min": min(hourly) if hourly else None,
        "hourly_max": max(hourly) if hourly else None,
        "salary_min": min(salary) if salary else None,
        "salary_max": max(salary) if salary else None,
        "confidence": 0.92 if hourly or salary else 0.25,
    }


def extract_benefits(text: str) -> list[str]:
    found = []
    for label, pattern in BENEFIT_PATTERNS.items():
        if re.search(pattern, text, flags=re.IGNORECASE):
            found.append(label)
    return found


def has_bonus(text: str) -> bool:
    return bool(re.search(r"sign[- ]?on|bonus", text, flags=re.IGNORECASE))


def has_relocation(text: str) -> bool:
    return bool(re.search(r"relocation|moving assistance", text, flags=re.IGNORECASE))


def extract_license_states(text: str, fallback: str | None = None) -> list[str]:
    states: set[str] = set()
    for match in LICENSE_REGEX.finditer(text):
        for token in re.findall(r"\b[A-Z]{2}\b", match.group("states")):
            if token in STATE_CODES:
                states.add(token)
    if fallback:
        states.add(fallback)
    return sorted(states)


def extract_requirements(text: str, states: list[str]) -> list[str]:
    role = detect_role(text)
    requirements = ["Active PMHNP license"]
    if role == "BCBA":
        requirements = ["Active BCBA certification"]
    if states:
        if role == "BCBA":
            requirements[0] = f"Active BCBA certification for {', '.join(states[:4])}"
        else:
            requirements[0] = f"Active PMHNP license in {', '.join(states[:4])}"
    if role == "BCBA" and re.search(r"bacb|board certified behavior analyst", text, flags=re.IGNORECASE):
        requirements.append("BACB credential in good standing")
    if role == "BCBA" and re.search(r"aba|autism|behavior", text, flags=re.IGNORECASE):
        requirements.append("ABA treatment planning experience")
    if re.search(r"\baprn\b|ancc|aanp", text, flags=re.IGNORECASE):
        requirements.append("APRN certification (ANCC or AANP)")
    if re.search(r"2\+|two years|2 years", text, flags=re.IGNORECASE):
        requirements.append("2+ years of psychiatric practice")
    if re.search(r"18\+|18 patients", text, flags=re.IGNORECASE):
        requirements.append("Comfortable managing 18+ patient visits/week")
    return requirements[:5]


def detect_role(text: str) -> str:
    if re.search(r"\bbcba\b|board certified behavior analyst", text, flags=re.IGNORECASE):
        return "BCBA"
    return "PMHNP"
