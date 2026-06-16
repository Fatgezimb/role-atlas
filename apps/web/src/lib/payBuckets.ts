import type { Job } from "../types";

export interface PayBucket {
  bucket: string;
  min: number;
  max: number;
  label: string;
}

export const PAY_BUCKETS: PayBucket[] = [
  { bucket: "$70", min: 70, max: 79, label: "$70-$79/hr" },
  { bucket: "$80", min: 80, max: 89, label: "$80-$89/hr" },
  { bucket: "$90", min: 90, max: 99, label: "$90-$99/hr" },
  { bucket: "$100", min: 100, max: 109, label: "$100-$109/hr" },
  { bucket: "$110", min: 110, max: 119, label: "$110-$119/hr" },
  { bucket: "$120+", min: 120, max: Infinity, label: "$120+/hr" }
];

export function hourlyEquivalent(job: Pick<Job, "hourly_max" | "salary_max">): number | null {
  if (job.hourly_max) {
    return job.hourly_max;
  }
  if (job.salary_max) {
    return Math.round(job.salary_max / 2080);
  }
  return null;
}

export function payBucketForJob(job: Pick<Job, "hourly_max" | "salary_max">): PayBucket | null {
  const hourly = hourlyEquivalent(job);
  return hourly ? PAY_BUCKETS.find((bucket) => hourly >= bucket.min && hourly <= bucket.max) ?? null : null;
}

export function payBucketByLabel(label: string): PayBucket | null {
  return PAY_BUCKETS.find((bucket) => bucket.bucket === label) ?? null;
}

export function jobsForPayBucket(jobs: Job[], bucketLabel: string): Job[] {
  return jobs
    .filter((job) => payBucketForJob(job)?.bucket === bucketLabel)
    .sort((left, right) => (right.match_score - left.match_score) || ((hourlyEquivalent(right) ?? 0) - (hourlyEquivalent(left) ?? 0)));
}

