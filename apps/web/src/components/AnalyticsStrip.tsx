import { BarChart3, CircleDollarSign, LineChart, UsersRound } from "lucide-react";
import type { ReactNode } from "react";
import { payBucketByLabel } from "../lib/payBuckets";
import type { AnalyticsSummary } from "../types";

interface AnalyticsStripProps {
  analytics: AnalyticsSummary;
  onPayBucketSelect: (bucket: string) => void;
}

export function AnalyticsStrip({ analytics, onPayBucketSelect }: AnalyticsStripProps) {
  return (
    <section className="analytics-strip" aria-label="Search analytics">
      <MetricCard label="Matching roles" value={analytics.matching_roles.toLocaleString()} delta="+128 (+11%)" />
      <MetricCard label="Median hourly" value={analytics.median_hourly ? `$${analytics.median_hourly}/hr` : "-"} delta="+$6 (+6.6%)" icon={<CircleDollarSign size={18} />} />
      <MetricCard label="Median salary" value={analytics.median_salary ? `$${Math.round(analytics.median_salary / 1000)}k` : "-"} delta="+$8k (+4.8%)" />
      <MetricCard label="Remote (Open to US)" value={`${Math.round(analytics.remote_share * 100)}%`} chart="donut" />
      <MetricCard label="Contract vs W-2" value={`${Math.round(analytics.contract_share * 100)}%`} chart="split" />
      <MetricCard label="Benefits (avg)" value={analytics.benefits_average.toFixed(1)} helper="of 10 offered" icon={<UsersRound size={18} />} />
      <TrendCard analytics={analytics} />
      <StateCard analytics={analytics} />
      <PayDistribution analytics={analytics} onPayBucketSelect={onPayBucketSelect} />
    </section>
  );
}

function MetricCard({
  label,
  value,
  delta,
  helper,
  icon,
  chart
}: {
  label: string;
  value: string;
  delta?: string;
  helper?: string;
  icon?: ReactNode;
  chart?: "donut" | "split";
}) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <div className="metric-value-row">
        <strong>{value}</strong>
        {icon}
        {chart ? <MiniDonut split={chart === "split"} /> : null}
      </div>
      {delta ? <span className="positive">{delta}</span> : null}
      {helper ? <span className="muted">{helper}</span> : null}
    </article>
  );
}

function MiniDonut({ split }: { split?: boolean }) {
  return (
    <svg className="mini-donut" viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="18" cy="18" r="14" />
      <path d="M18 4a14 14 0 1 1-9.8 24" />
      {split ? <path className="secondary" d="M8.2 28A14 14 0 0 1 18 4" /> : null}
    </svg>
  );
}

function TrendCard({ analytics }: Pick<AnalyticsStripProps, "analytics">) {
  const max = Math.max(...analytics.trend.map((point) => point.count), 1);
  const points = analytics.trend
    .map((point, index) => `${(index / Math.max(analytics.trend.length - 1, 1)) * 100},${64 - (point.count / max) * 52}`)
    .join(" ");
  return (
    <article className="chart-card trend-card">
      <h3>
        <LineChart size={16} />
        New matching roles over time
      </h3>
      <svg viewBox="0 0 100 70" preserveAspectRatio="none">
        <polyline points={points} />
      </svg>
    </article>
  );
}

function StateCard({ analytics }: Pick<AnalyticsStripProps, "analytics">) {
  const max = Math.max(...analytics.roles_by_state.map((state) => state.count), 1);
  return (
    <article className="chart-card state-card">
      <h3>
        <BarChart3 size={16} />
        Roles by state (Top 10)
      </h3>
      {analytics.roles_by_state.slice(0, 6).map((state) => (
        <div className="bar-row" key={state.state}>
          <span>{state.state}</span>
          <i style={{ width: `${(state.count / max) * 100}%` }} />
          <strong>{state.count}</strong>
        </div>
      ))}
    </article>
  );
}

function PayDistribution({ analytics, onPayBucketSelect }: AnalyticsStripProps) {
  const max = Math.max(...analytics.pay_distribution.map((bucket) => bucket.count), 1);
  return (
    <article className="chart-card pay-card">
      <h3>Pay distribution (Hourly)</h3>
      <div className="histogram">
        {analytics.pay_distribution.map((bucket) => {
          const payBucket = payBucketByLabel(String(bucket.bucket));
          const bucketLabel = payBucket?.label ?? `${bucket.bucket}/hr`;
          const count = Number(bucket.count);
          return (
            <button
              key={bucket.bucket}
              type="button"
              className="histogram-bar"
              disabled={count === 0}
              aria-label={`Open ${bucketLabel} pay bucket with ${count} ${count === 1 ? "role" : "roles"}`}
              onClick={() => onPayBucketSelect(String(bucket.bucket))}
            >
              <i style={{ height: `${Math.max(12, (count / max) * 82)}%` }} />
              <small>{bucket.bucket}</small>
              <strong>{count}</strong>
            </button>
          );
        })}
      </div>
    </article>
  );
}
