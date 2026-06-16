import type { Job, RemoteType } from "../types";

export function formatCompensation(job: Pick<Job, "hourly_min" | "hourly_max" | "salary_min" | "salary_max">): string {
  if (job.hourly_min && job.hourly_max) {
    return job.hourly_min === job.hourly_max ? `$${job.hourly_min}/hr` : `$${job.hourly_min}-$${job.hourly_max}/hr`;
  }
  if (job.salary_min && job.salary_max) {
    return `$${Math.round(job.salary_min / 1000)}k-$${Math.round(job.salary_max / 1000)}k`;
  }
  return "Compensation inferred";
}

export function remoteLabel(remoteType: RemoteType): string {
  switch (remoteType) {
    case "remote_open_us":
      return "Remote (Open to US)";
    case "remote_state_based":
      return "Remote - state based";
    case "hybrid":
      return "Hybrid / Onsite";
    default:
      return "On-site";
  }
}

