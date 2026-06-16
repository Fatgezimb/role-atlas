from __future__ import annotations

import math
import re
from collections import Counter


TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9+#.-]{1,}")
STOP_WORDS = {
    "and",
    "the",
    "for",
    "with",
    "role",
    "roles",
    "job",
    "jobs",
    "from",
    "over",
    "under",
    "based",
    "remote",
}


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text) if token.lower() not in STOP_WORDS]


def embed_text(text: str) -> dict[str, float]:
    """Build a lightweight local embedding from weighted token frequencies.

    This intentionally avoids a cloud model for the first implementation while
    still giving query matching, ranking, and feedback a numeric vector surface.
    A later deployment can swap this for sentence-transformer embeddings without
    changing the API contract.
    """

    counts = Counter(tokenize(text))
    total = sum(counts.values()) or 1
    return {token: count / total for token, count in counts.items()}


def cosine_similarity(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    overlap = set(left).intersection(right)
    dot = sum(left[token] * right[token] for token in overlap)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if not left_norm or not right_norm:
        return 0.0
    return dot / (left_norm * right_norm)

