import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyticsStrip } from "./components/AnalyticsStrip";
import { FilterBar } from "./components/FilterBar";
import { JobDetailModal } from "./components/JobDetailModal";
import { JobMap } from "./components/JobMap";
import { ResultsPanel } from "./components/ResultsPanel";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { searchJobs, startScrapeRun, updateJobStatus } from "./lib/api";
import { buildAnalytics, buildDemoSearchResponse } from "./data/demoJobs";
import type { Job, MapViewport, SearchFilters, SearchResponse } from "./types";

const DEFAULT_QUERY = "Find remote BCBA contract roles over $70/hr with sign-on bonus";

export function App() {
  const initialParams = new URLSearchParams(window.location.search);
  const initialQuery = initialParams.get("q") ?? DEFAULT_QUERY;
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    location: "All states",
    role: inferRoleFromQuery(initialQuery) ?? "BCBA",
    employment_type: "contract",
    min_hourly: inferRoleFromQuery(initialQuery) === "PMHNP" ? 90 : 70,
    sign_on_bonus: true
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialParams.get("job"));
  const [searchResponse, setSearchResponse] = useState<SearchResponse>(() => buildDemoSearchResponse());
  const [isSearching, setIsSearching] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [mapViewport, setMapViewport] = useState<MapViewport | null>(null);

  const visibleJobs = useMemo(() => {
    if (!mapViewport?.isFiltered) {
      return searchResponse.jobs;
    }
    return searchResponse.jobs.filter((job) => isJobInViewport(job, mapViewport));
  }, [mapViewport, searchResponse.jobs]);

  const visibleAnalytics = useMemo(() => buildAnalytics(visibleJobs), [visibleJobs]);

  const selectedJob = useMemo(
    () => searchResponse.jobs.find((job) => job.id === selectedJobId) ?? null,
    [searchResponse.jobs, selectedJobId]
  );
  const selectedIndex = selectedJob ? visibleJobs.findIndex((job) => job.id === selectedJob.id) : -1;
  const jobsById = useMemo(() => new Map(searchResponse.jobs.map((job) => [job.id, job])), [searchResponse.jobs]);

  const syncUrl = useCallback((nextQuery: string, nextSelectedJobId: string | null) => {
    const params = new URLSearchParams();
    params.set("q", nextQuery);
    if (nextSelectedJobId) {
      params.set("job", nextSelectedJobId);
    }
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, []);

  const runSearch = useCallback(async (nextQuery = query, nextFilters = filters, nextSelectedJobId = selectedJobId) => {
    const inferredRole = inferRoleFromQuery(nextQuery);
    const effectiveFilters = inferredRole && nextFilters.role !== inferredRole ? { ...nextFilters, role: inferredRole } : nextFilters;
    if (effectiveFilters !== nextFilters) {
      setFilters(effectiveFilters);
    }
    setIsSearching(true);
    const response = await searchJobs({ query: nextQuery, filters: effectiveFilters, sort: "best_match" });
    setSearchResponse(response);
    setMapViewport(null);
    setIsSearching(false);
    syncUrl(nextQuery, nextSelectedJobId);
  }, [filters, query, selectedJobId, syncUrl]);

  useEffect(() => {
    void runSearch();
  }, []); // Initial hydration only; subsequent searches are explicit to keep the UI steady while typing.

  const selectJob = useCallback(
    (jobOrId: Job | string) => {
      const id = typeof jobOrId === "string" ? jobOrId : jobOrId.id;
      setSelectedJobId(id);
      syncUrl(query, id);
    },
    [query, syncUrl]
  );

  const closeDetail = useCallback(() => {
    setSelectedJobId(null);
    syncUrl(query, null);
  }, [query, syncUrl]);

  const applyFilters = useCallback(
    (nextFilters: SearchFilters, nextQuery = query) => {
      setFilters(nextFilters);
      setQuery(nextQuery);
      setSelectedJobId(null);
      void runSearch(nextQuery, nextFilters, null);
    },
    [query, runSearch]
  );

  const patchJob = useCallback(async (job: Job, patch: Partial<Pick<Job, "saved" | "applied" | "hidden">>) => {
    const updated = await updateJobStatus(job, patch);
    setSearchResponse((current) => ({
      ...current,
      jobs: patch.hidden ? current.jobs.filter((item) => item.id !== job.id) : current.jobs.map((item) => (item.id === job.id ? updated : item))
    }));
    if (patch.hidden) {
      setSelectedJobId(null);
    }
  }, []);

  const navigateModal = useCallback(
    (direction: 1 | -1) => {
      if (selectedIndex < 0) {
        return;
      }
      const next = visibleJobs[(selectedIndex + direction + visibleJobs.length) % visibleJobs.length];
      selectJob(next);
    },
    [selectJob, selectedIndex, visibleJobs]
  );

  const scrape = useCallback(async () => {
    setIsScraping(true);
    await startScrapeRun();
    await runSearch();
    setIsScraping(false);
  }, [runSearch]);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="workspace">
        <TopBar
          query={query}
          isScraping={isScraping || isSearching}
          onQueryChange={setQuery}
          onSearch={() => {
            const nextFilters = { ...filters, role: inferRoleFromQuery(query) ?? filters.role };
            setFilters(nextFilters);
            void runSearch(query, nextFilters, selectedJobId);
          }}
          onScrape={scrape}
        />
        <FilterBar filters={filters} onApply={applyFilters} />
        <div className="main-split">
          <div className="map-and-analytics">
            <JobMap
              markers={searchResponse.markers}
              jobsById={jobsById}
              selectedJobId={selectedJobId}
              onSelectJob={selectJob}
              onViewportChange={setMapViewport}
            />
            <AnalyticsStrip analytics={visibleAnalytics} />
          </div>
          <ResultsPanel
            jobs={visibleJobs}
            totalJobs={searchResponse.jobs.length}
            mapFiltered={Boolean(mapViewport?.isFiltered)}
            selectedJobId={selectedJobId}
            onSelectJob={selectJob}
            onToggleSaved={(job) => void patchJob(job, { saved: !job.saved })}
          />
        </div>
      </main>
      {selectedJob ? (
        <JobDetailModal
          job={selectedJob}
          index={Math.max(0, selectedIndex)}
          total={visibleJobs.length || searchResponse.jobs.length}
          onClose={closeDetail}
          onPatch={(job, patch) => void patchJob(job, patch)}
          onNext={() => navigateModal(1)}
          onPrev={() => navigateModal(-1)}
        />
      ) : null}
    </div>
  );
}

function isJobInViewport(job: Job, viewport: MapViewport): boolean {
  return (
    job.longitude >= viewport.bounds.west &&
    job.longitude <= viewport.bounds.east &&
    job.latitude >= viewport.bounds.south &&
    job.latitude <= viewport.bounds.north
  );
}

function inferRoleFromQuery(value: string): string | undefined {
  if (/\bbcba\b|board certified behavior analyst/i.test(value)) {
    return "BCBA";
  }
  if (/\bpmhnp\b|psychiatric nurse practitioner/i.test(value)) {
    return "PMHNP";
  }
  return undefined;
}
