from __future__ import annotations

import os
from collections.abc import Iterator

from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from role_atlas_worker.ranking import searchable_text
from role_atlas_worker.scraper import run_scrape
from role_atlas_worker.vector_index import embed_text

from .models import Job

_engine: Engine | None = None
_database_url = os.getenv("ROLE_ATLAS_DB_URL", "sqlite:///./role_atlas.sqlite3")


def configure_engine(database_url: str | None = None) -> Engine:
    global _engine, _database_url
    if database_url:
        _database_url = database_url
    connect_args = {"check_same_thread": False} if _database_url.startswith("sqlite") else {}
    _engine = create_engine(_database_url, connect_args=connect_args)
    return _engine


def get_engine() -> Engine:
    return _engine or configure_engine()


def get_session() -> Iterator[Session]:
    with Session(get_engine()) as session:
        yield session


def init_db(seed: bool = True) -> None:
    engine = get_engine()
    SQLModel.metadata.create_all(engine)
    if seed:
        with Session(engine) as session:
            # Keep local fixture-backed development data current without
            # dropping user status fields such as saved/applied/hidden.
            result = run_scrape("fixture")
            upsert_jobs(session, result.postings)


def upsert_jobs(session: Session, postings: list[dict]) -> tuple[int, int]:
    inserted = 0
    updated = 0
    for payload in postings:
        payload["embedding"] = embed_text(searchable_text(payload))
        existing = session.get(Job, payload["id"])
        if existing:
            for key, value in payload.items():
                setattr(existing, key, value)
            updated += 1
        else:
            session.add(Job(**payload))
            inserted += 1
    session.commit()
    return inserted, updated
