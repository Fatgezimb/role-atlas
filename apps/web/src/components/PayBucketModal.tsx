import { ExternalLink, MapPin, X } from "lucide-react";
import type { Job } from "../types";
import { formatCompensation, remoteLabel } from "../lib/format";
import { hourlyEquivalent, payBucketByLabel } from "../lib/payBuckets";

interface PayBucketModalProps {
  bucket: string;
  jobs: Job[];
  totalVisibleJobs: number;
  onClose: () => void;
  onSelectJob: (job: Job) => void;
}

export function PayBucketModal({ bucket, jobs, totalVisibleJobs, onClose, onSelectJob }: PayBucketModalProps) {
  const payBucket = payBucketByLabel(bucket);
  const title = payBucket ? `Roles in ${payBucket.label}` : `Roles in ${bucket}`;
  const strongestMatch = jobs[0] ? Math.round(jobs[0].match_score * 100) : null;

  return (
    <div className="detail-layer pay-modal-layer" role="dialog" aria-modal="true" aria-labelledby="pay-bucket-title">
      <div className="detail-backdrop" onClick={onClose} />
      <article className="pay-modal">
        <header className="pay-modal-top">
          <div>
            <span>Pay distribution</span>
            <h2 id="pay-bucket-title">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close pay bucket roles">
            <X size={19} />
            Close
          </button>
        </header>

        <section className="pay-modal-summary" aria-label="Pay bucket summary">
          <div>
            <strong>{jobs.length}</strong>
            <span>{jobs.length === 1 ? "role" : "roles"} in this bucket</span>
          </div>
          <div>
            <strong>{totalVisibleJobs}</strong>
            <span>roles currently visible</span>
          </div>
          <div>
            <strong>{strongestMatch ? `${strongestMatch}%` : "-"}</strong>
            <span>top match</span>
          </div>
        </section>

        <div className="pay-role-list">
          {jobs.length ? (
            jobs.map((job) => (
              <article className="pay-role-card" key={job.id}>
                <div className="pay-role-main">
                  <button type="button" onClick={() => onSelectJob(job)}>
                    <strong>{job.title}</strong>
                    <span>{job.employer}</span>
                  </button>
                  <p>
                    <MapPin size={14} />
                    {job.location_text}
                  </p>
                </div>
                <div className="pay-role-meta">
                  <strong>{formatCompensation(job)}</strong>
                  <span>{hourlyEquivalent(job) ? `~$${hourlyEquivalent(job)}/hr equivalent` : "pay inferred"}</span>
                </div>
                <div className="pay-role-tags">
                  <span>{remoteLabel(job.remote_type)}</span>
                  <span>{job.employment_type === "contract" ? "Contract" : "W-2"}</span>
                  {job.has_sign_on_bonus ? <span>Sign-on bonus</span> : null}
                </div>
                <div className="pay-role-actions">
                  <button type="button" onClick={() => onSelectJob(job)}>
                    Open role
                  </button>
                  <a href={job.source_url} target="_blank" rel="noreferrer">
                    Source <ExternalLink size={13} />
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-results">
              <strong>No roles in this pay bucket</strong>
              <p>Try a different pay band or broaden the current filters.</p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

