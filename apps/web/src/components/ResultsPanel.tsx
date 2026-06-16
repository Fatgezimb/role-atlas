import { Bookmark, Check, ChevronDown, ExternalLink, Gift, Home, MapPin, ShieldCheck } from "lucide-react";
import type { Job } from "../types";
import { formatCompensation, remoteLabel } from "../lib/format";

interface ResultsPanelProps {
  jobs: Job[];
  totalJobs: number;
  mapFiltered: boolean;
  selectedJobId: string | null;
  onSelectJob: (job: Job) => void;
  onToggleSaved: (job: Job) => void;
}

export function ResultsPanel({ jobs, totalJobs, mapFiltered, selectedJobId, onSelectJob, onToggleSaved }: ResultsPanelProps) {
  return (
    <aside className="results-panel" aria-label="Job results">
      <div className="results-header">
        <strong>
          {jobs.length.toLocaleString()} matching roles
          {mapFiltered ? <span>{totalJobs.toLocaleString()} total in search</span> : null}
        </strong>
        <button type="button">
          Sort: <span>Best match</span>
          <ChevronDown size={15} />
        </button>
      </div>
      <div className="result-list">
        {jobs.length ? jobs.map((job) => (
          <article
            className={`job-card ${job.id === selectedJobId ? "selected" : ""}`}
            data-testid={`job-card-${job.id}`}
            key={job.id}
            onClick={() => onSelectJob(job)}
          >
            <div className="card-title-row">
              <MapPin className={`pin-icon ${job.remote_type}`} size={19} />
              <div>
                <h2>{job.title}</h2>
                <p>{job.employer}</p>
              </div>
              <span className="match-badge">{Math.round(job.match_score * 100)}% match</span>
            </div>
            <p className="location-line">{job.location_text}</p>
            <div className="pay-row">
              <strong>{formatCompensation(job)}</strong>
              <span>{job.employment_type === "contract" ? "Contract" : "W-2"}</span>
            </div>
            <div className="benefit-row">
              {job.has_sign_on_bonus ? (
                <span>
                  <Gift size={14} />
                  Sign-on bonus
                </span>
              ) : null}
              {job.has_relocation ? (
                <span>
                  <Home size={14} />
                  Relocation
                </span>
              ) : null}
              {job.benefits.slice(0, 3).map((benefit) => (
                <span key={benefit}>
                  <ShieldCheck size={14} />
                  {benefit}
                </span>
              ))}
            </div>
            <div className="source-row">
              <span>Posted {relativePosted(job.posted_at)} · {job.source}</span>
              <div>
                <button
                  type="button"
                  aria-label={job.saved ? "Unsave role" : "Save role"}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleSaved(job);
                  }}
                >
                  <Bookmark size={18} fill={job.saved ? "currentColor" : "none"} />
                </button>
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open source for ${job.title}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {job.applied ? <Check size={18} /> : <ExternalLink size={17} />}
                </a>
              </div>
            </div>
            <span className="remote-label">{remoteLabel(job.remote_type)}</span>
          </article>
        )) : (
          <div className="empty-results">
            <strong>No roles in this map view</strong>
            <p>Zoom out or drag the map to another state to bring jobs back into the list.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function relativePosted(postedAt: string | null): string {
  if (!postedAt) {
    return "recently";
  }
  const days = Math.max(1, Math.round((Date.parse("2026-06-16") - Date.parse(postedAt)) / 86_400_000));
  return `${days}d ago`;
}
