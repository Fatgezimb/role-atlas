import { buildDemoSearchResponse, demoJobs } from "../data/demoJobs";
import type { Job, JobStatusPatch, SearchFilters, SearchResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const STATIC_MODE = import.meta.env.VITE_STATIC_MODE === "true";

export interface SearchPayload {
  query: string;
  filters: SearchFilters;
  sort: string;
}

export async function searchJobs(payload: SearchPayload): Promise<SearchResponse> {
  if (STATIC_MODE) {
    return buildDemoSearchResponse(undefined, payload.query, payload.filters);
  }

  try {
    const response = await fetch(`${API_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Search failed with ${response.status}`);
    }
    return (await response.json()) as SearchResponse;
  } catch {
    return buildDemoSearchResponse(undefined, payload.query, payload.filters);
  }
}

export async function updateJobStatus(job: Job, patch: JobStatusPatch): Promise<Job> {
  if (STATIC_MODE) {
    return { ...job, ...patch };
  }

  try {
    const response = await fetch(`${API_URL}/jobs/${encodeURIComponent(job.id)}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!response.ok) {
      throw new Error(`Status update failed with ${response.status}`);
    }
    return (await response.json()) as Job;
  } catch {
    return { ...job, ...patch };
  }
}

export async function startScrapeRun(): Promise<{ status: string; discovered_count: number }> {
  if (STATIC_MODE) {
    return { status: "completed", discovered_count: demoJobs.length };
  }

  try {
    const response = await fetch(`${API_URL}/scrape-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "fixture" })
    });
    if (!response.ok) {
      throw new Error(`Scrape run failed with ${response.status}`);
    }
    return response.json();
  } catch {
    return { status: "completed", discovered_count: demoJobs.length };
  }
}
