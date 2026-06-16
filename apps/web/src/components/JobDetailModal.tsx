import {
  AlertTriangle,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  EyeOff,
  HeartPulse,
  Info,
  Stethoscope,
  WalletCards,
  X
} from "lucide-react";
import type { ReactNode } from "react";
import type { Job } from "../types";
import { formatCompensation, remoteLabel } from "../lib/format";

interface JobDetailModalProps {
  job: Job;
  index: number;
  total: number;
  onClose: () => void;
  onPatch: (job: Job, patch: Partial<Pick<Job, "saved" | "applied" | "hidden">>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function JobDetailModal({ job, index, total, onClose, onPatch, onNext, onPrev }: JobDetailModalProps) {
  return (
    <div className="detail-layer" role="dialog" aria-modal="true" aria-labelledby="job-detail-title">
      <div className="detail-backdrop" onClick={onClose} />
      <article className="detail-modal">
        <header className="detail-top">
          <button type="button" onClick={onClose}>
            <X size={19} />
            Close
          </button>
          <div className="modal-nav">
            <button type="button" onClick={onPrev} aria-label="Previous role">
              <ChevronLeft size={18} />
              Prev
            </button>
            <span>
              {index + 1} of {total}
            </span>
            <button type="button" onClick={onNext} aria-label="Next role">
              Next
              <ChevronRight size={18} />
            </button>
          </div>
          <a className="open-source-icon" href={job.source_url} target="_blank" rel="noreferrer" aria-label="Open source">
            <ExternalLink size={19} />
          </a>
        </header>

        <div className="detail-grid">
          <main className="detail-main">
            <section className="detail-hero">
              <div>
                <h2 id="job-detail-title">{job.title}</h2>
                <p>{job.employer}</p>
                <span className={`status-dot ${job.remote_type}`} />
                <span>{remoteLabel(job.remote_type)}</span>
                <span>Posted 3 days ago</span>
                <span>{job.source}</span>
              </div>
              <div className="match-panel">
                <strong>{Math.round(job.match_score * 100)}% match</strong>
                <span>Excellent</span>
                <Info size={14} />
              </div>
            </section>

            <section className="fact-row">
              <Fact label="Compensation" value={formatCompensation(job)} />
              <Fact label="Employment" value={job.employment_type === "contract" ? "Contract" : "W-2"} />
              <Fact label="Schedule" value="Full-time" />
            </section>

            <section className="detail-actions">
              <button className={job.saved ? "primary active" : "primary"} type="button" onClick={() => onPatch(job, { saved: !job.saved })}>
                <Bookmark size={18} fill={job.saved ? "currentColor" : "none"} />
                Save
              </button>
              <button
                className={job.applied ? "active-state-button" : ""}
                data-testid="mark-applied-button"
                type="button"
                onClick={() => onPatch(job, { applied: !job.applied })}
              >
                <Check size={18} />
                {job.applied ? "Applied" : "Mark applied"}
              </button>
              <button type="button" onClick={() => onPatch(job, { hidden: true })}>
                <EyeOff size={18} />
                Hide
              </button>
              <a href={job.source_url} target="_blank" rel="noreferrer">
                <ExternalLink size={18} />
                Open source
              </a>
            </section>

            <section className="overview-panel">
              <h3>
                <Stethoscope size={18} />
                Overview
              </h3>
              <p>{job.description}</p>
              <h4>Requirements <span>(extracted)</span></h4>
              <ul>
                {job.requirements.map((requirement) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
              <a className="link-button" href={job.source_url} target="_blank" rel="noreferrer">
                See full job description <ExternalLink size={13} />
              </a>
            </section>

            <section className="benefits-panel">
              <h3>Benefits</h3>
              <div className="benefit-icons">
                {job.benefits.map((benefit) => (
                  <span key={benefit}>
                    <HeartPulse size={21} />
                    {benefit}
                  </span>
                ))}
              </div>
            </section>

            <section className="bonus-panel">
              <h3>Bonus & relocation</h3>
              <div>
                <Fact label="Sign-on bonus" value={job.has_sign_on_bonus ? "$2,500" : "Not listed"} />
                <Fact label="Relocation assistance" value={job.has_relocation ? "Up to $2,500" : "Not listed"} />
              </div>
            </section>

            <div className="confidence-warning">
              <AlertTriangle size={18} />
              Compensation and benefits may be inferred from job posting and similar roles.
              <a href={job.source_url} target="_blank" rel="noreferrer">
                Verify source
              </a>
            </div>
          </main>

          <aside className="detail-side">
            <section>
              <h3>
                License eligibility
                <Info size={14} />
              </h3>
              <p>Eligible with current or multi-state license</p>
              <div className="state-tags">
                {job.license_states.slice(0, 6).map((state) => (
                  <span className={state === job.state ? "active" : ""} key={state}>
                    {state}
                  </span>
                ))}
                <span>+6</span>
              </div>
              <p>Not eligible / unconfirmed</p>
              <div className="state-tags muted-tags">
                {["MA", "PA", "IL", "WA"].map((state) => (
                  <span key={state}>{state}</span>
                ))}
              </div>
              <a className="link-button" href={licenseRequirementUrl(job)} target="_blank" rel="noreferrer">
                View all state requirements <ExternalLink size={13} />
              </a>
            </section>

            <section>
              <h3>
                Remote classification
                <Info size={14} />
              </h3>
              <div className="remote-classification">
                <span><i className="remote_open_us" />Fully remote (anywhere)</span>
                <span><i className="remote_state_based" />Remote - state based (this role)</span>
                <span><i className="hybrid" />Hybrid / Onsite</span>
              </div>
              <MiniEligibilityMap activeState={job.state ?? "TX"} />
              <p>This role: {job.state ?? "US"} based {job.remote_type === "remote_state_based" ? "(must reside in state)" : ""}</p>
            </section>

            <section>
              <h3>Source & provenance</h3>
              <strong className="source-logo">{job.source}</strong>
              <p>Scraped Jun 16, 2026, 8:42 AM EDT</p>
              <a href={job.source_url} target="_blank" rel="noreferrer">
                View original job posting <ExternalLink size={13} />
              </a>
            </section>
          </aside>
        </div>

        <footer className="market-insights">
          <h3>Austin, TX market insights <Info size={14} /></h3>
          <Insight label="Salary percentile (This role)" value="78th" helper="$62/hr P25     $110/hr P75" />
          <Insight label="Hourly ↔ Salary estimate" value={formatCompensation(job)} helper="≈ $197,600/yr (40 hr/wk)" icon={<WalletCards size={19} />} />
          <Insight label="Contract vs W-2 (Est. take-home)" value="Contract $95/hr" helper="W-2 $74/hr" />
          <Insight label="Benefit completeness" value={`${Math.round(confidenceValue(job, "benefits") * 100)}%`} helper="Industry avg: 68%" />
        </footer>
      </article>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Insight({ label, value, helper, icon }: { label: string; value: string; helper: string; icon?: ReactNode }) {
  return (
    <div className="insight">
      <span>{label}</span>
      <strong>{value}</strong>
      {icon}
      <small>{helper}</small>
    </div>
  );
}

function confidenceValue(job: Job, key: string) {
  return job.extraction_confidence[key] ?? 0.85;
}

function licenseRequirementUrl(job: Job): string {
  const query = `${job.title} ${job.state ?? "US"} license certification requirements ${job.license_states.join(" ")}`;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function MiniEligibilityMap({ activeState }: { activeState: string }) {
  return (
    <svg className="mini-us-map" viewBox="0 0 240 130" aria-label={`License state map with ${activeState} highlighted`}>
      <path d="M18 42 48 24l40 4 44-7 38 10 36 10 18 22-12 34-42 17-52 4-46-13-50 4-22-30z" />
      <path className="active-state" d="M91 78h30v25H91z" />
      <path className="state-grid" d="M58 30v72M100 25v88M145 34v76M188 44v56M35 65h178M48 92h148" />
    </svg>
  );
}
