import type { AnalyticsSummary, Job, MapMarker, SearchFilters, SearchResponse } from "../types";
import { hourlyEquivalent, PAY_BUCKETS } from "../lib/payBuckets";
import { STATE_COORDS } from "./stateGeo";

const now = new Date("2026-06-16T12:00:00Z").toISOString();
const searchLink = (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

export const demoJobs: Job[] = [
  {
    id: "Indeed:brightsteps-remote-bcba-contract",
    title: "Remote BCBA - Contract",
    employer: "BrightSteps Behavioral Health",
    location_text: "Atlanta, GA (Remote - GA based)",
    state: "GA",
    latitude: 32.1656,
    longitude: -82.9001,
    description:
      "Remote GA based BCBA contract role supporting ABA treatment planning for children with autism. BACB credential in good standing required.",
    source: "Indeed",
    source_url: searchLink("Remote BCBA Contract BrightSteps Behavioral Health Atlanta GA jobs"),
    posted_at: "2026-06-16",
    scraped_at: now,
    remote_type: "remote_state_based",
    employment_type: "contract",
    salary_min: null,
    salary_max: null,
    hourly_min: 78,
    hourly_max: 92,
    benefits: ["Health", "Dental", "Vision", "401k", "PTO"],
    has_sign_on_bonus: true,
    has_relocation: true,
    license_states: ["GA", "FL", "NC", "TN"],
    requirements: ["Active BCBA certification for GA", "BACB credential in good standing", "ABA treatment planning experience"],
    extraction_confidence: { compensation: 0.91, remote_type: 0.9, benefits: 0.9, license_states: 0.88 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.95,
    match_reasons: ["remote match", "contract match", "bonus match", "role match"]
  },
  {
    id: "LinkedIn:autism-care-open-us-bcba",
    title: "BCBA Clinical Supervisor - Remote",
    employer: "Autism Care Collective",
    location_text: "Remote (Open to US)",
    state: "TX",
    latitude: 31.9686,
    longitude: -99.9018,
    description: "Fully remote W-2 BCBA Clinical Supervisor role with bonus structure and family support benefits.",
    source: "LinkedIn",
    source_url: searchLink("BCBA Clinical Supervisor Remote Autism Care Collective jobs"),
    posted_at: "2026-06-15",
    scraped_at: now,
    remote_type: "remote_open_us",
    employment_type: "w2",
    salary_min: 92000,
    salary_max: 118000,
    hourly_min: null,
    hourly_max: null,
    benefits: ["Health", "Dental", "Vision", "PTO", "401k", "CME"],
    has_sign_on_bonus: true,
    has_relocation: false,
    license_states: ["TX", "CA", "NY", "FL"],
    requirements: ["Active BCBA certification", "BACB credential in good standing", "ABA supervision experience"],
    extraction_confidence: { compensation: 0.9, remote_type: 0.94, benefits: 0.88, license_states: 0.86 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.91,
    match_reasons: ["remote match", "role match", "bonus match"]
  },
  {
    id: "ZipRecruiter:kinetic-kids-hybrid-bcba",
    title: "Board Certified Behavior Analyst - Hybrid",
    employer: "Kinetic Kids ABA",
    location_text: "Austin, TX (Hybrid)",
    state: "TX",
    latitude: 31.9686,
    longitude: -99.9018,
    description: "Hybrid BCBA role with contract or W-2 options, caregiver training, ABA assessment, sign-on bonus, and relocation assistance.",
    source: "ZipRecruiter",
    source_url: searchLink("Board Certified Behavior Analyst Hybrid Kinetic Kids ABA Austin TX jobs"),
    posted_at: "2026-06-14",
    scraped_at: now,
    remote_type: "hybrid",
    employment_type: "contract",
    salary_min: null,
    salary_max: null,
    hourly_min: 74,
    hourly_max: 88,
    benefits: ["Health", "Dental", "Vision", "PTO", "401k"],
    has_sign_on_bonus: true,
    has_relocation: true,
    license_states: ["TX"],
    requirements: ["Active BCBA certification for TX", "BACB credential in good standing", "ABA treatment planning experience"],
    extraction_confidence: { compensation: 0.91, remote_type: 0.78, benefits: 0.86, license_states: 0.87 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.88,
    match_reasons: ["contract match", "role match", "relocation match"]
  },
  ...createBcbaExpansion(),
  {
    id: "Indeed:mindful-telehealth-pmhnp-contract",
    title: "Telehealth PMHNP - Contract",
    employer: "Mindful Health Partners",
    location_text: "Austin, TX (Remote - TX based)",
    state: "TX",
    latitude: 31.9686,
    longitude: -99.9018,
    description:
      "Join Mindful Health Partners as a Telehealth PMHNP providing psychiatric medication management and supportive care to adults across Texas.",
    source: "Indeed",
    source_url: searchLink("Telehealth PMHNP Contract Mindful Health Partners Austin TX jobs"),
    posted_at: "2026-06-15",
    scraped_at: now,
    remote_type: "remote_state_based",
    employment_type: "contract",
    salary_min: null,
    salary_max: null,
    hourly_min: 95,
    hourly_max: 95,
    benefits: ["Health", "Dental", "Vision", "401k", "PTO"],
    has_sign_on_bonus: true,
    has_relocation: true,
    license_states: ["TX", "NY", "CA", "FL"],
    requirements: [
      "Active PMHNP license in TX",
      "APRN certification (ANCC or AANP)",
      "2+ years of independent psychiatric practice",
      "Comfortable managing 18+ patient visits/week"
    ],
    extraction_confidence: { compensation: 0.92, remote_type: 0.92, benefits: 0.9, license_states: 0.9 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.95,
    match_reasons: ["remote match", "contract match", "bonus match", "role match"]
  },
  {
    id: "LinkedIn:clearview-open-us-pmhnp",
    title: "PMHNP - Remote (Open to US)",
    employer: "ClearView Behavioral Health",
    location_text: "Remote (Open to US)",
    state: "NY",
    latitude: 43.2994,
    longitude: -74.2179,
    description: "Fully remote nationwide PMHNP contract role with sign-on bonus and relocation support.",
    source: "LinkedIn",
    source_url: searchLink("PMHNP Remote Open to US ClearView Behavioral Health jobs"),
    posted_at: "2026-06-14",
    scraped_at: now,
    remote_type: "remote_open_us",
    employment_type: "contract",
    salary_min: 165000,
    salary_max: 190000,
    hourly_min: null,
    hourly_max: null,
    benefits: ["Health", "Dental", "Vision", "Malpractice"],
    has_sign_on_bonus: true,
    has_relocation: true,
    license_states: ["NY", "CA", "FL", "TX"],
    requirements: ["Active PMHNP license", "Multi-state license preferred"],
    extraction_confidence: { compensation: 0.92, remote_type: 0.95, benefits: 0.83, license_states: 0.86 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.93,
    match_reasons: ["remote match", "contract match", "bonus match"]
  },
  {
    id: "ZipRecruiter:wellness-connect-denver",
    title: "PMHNP - Contract",
    employer: "Wellness Connect",
    location_text: "Denver, CO (Remote - CO based)",
    state: "CO",
    latitude: 39.5501,
    longitude: -105.7821,
    description: "Remote state based PMHNP contract role licensed in CO with PTO and 401k.",
    source: "ZipRecruiter",
    source_url: searchLink("PMHNP Contract Wellness Connect Denver CO remote jobs"),
    posted_at: "2026-06-13",
    scraped_at: now,
    remote_type: "remote_state_based",
    employment_type: "contract",
    salary_min: null,
    salary_max: null,
    hourly_min: 92,
    hourly_max: 92,
    benefits: ["401k", "PTO"],
    has_sign_on_bonus: true,
    has_relocation: false,
    license_states: ["CO"],
    requirements: ["Active PMHNP license in CO", "2+ years of psychiatric practice"],
    extraction_confidence: { compensation: 0.9, remote_type: 0.9, benefits: 0.72, license_states: 0.9 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.9,
    match_reasons: ["remote match", "contract match", "bonus match"]
  },
  {
    id: "Indeed:lifestance-charlotte",
    title: "Telehealth PMHNP",
    employer: "LifeStance Health",
    location_text: "Charlotte, NC (Hybrid)",
    state: "NC",
    latitude: 35.7596,
    longitude: -79.0193,
    description: "Hybrid PMHNP contract role with relocation assistance and full benefits.",
    source: "Indeed",
    source_url: searchLink("Telehealth PMHNP LifeStance Health Charlotte NC hybrid jobs"),
    posted_at: "2026-06-12",
    scraped_at: now,
    remote_type: "hybrid",
    employment_type: "contract",
    salary_min: null,
    salary_max: null,
    hourly_min: 100,
    hourly_max: 100,
    benefits: ["Health", "Dental", "Vision", "401k"],
    has_sign_on_bonus: true,
    has_relocation: true,
    license_states: ["NC"],
    requirements: ["Active PMHNP license in NC"],
    extraction_confidence: { compensation: 0.9, remote_type: 0.78, benefits: 0.81, license_states: 0.88 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.88,
    match_reasons: ["contract match", "relocation match"]
  },
  {
    id: "Indeed:harborview-ny",
    title: "Psychiatric Nurse Practitioner",
    employer: "HarborView Mental Health",
    location_text: "New York, NY (Onsite)",
    state: "NY",
    latitude: 43.2994,
    longitude: -74.2179,
    description: "Onsite W-2 psychiatric nurse practitioner role with relocation assistance.",
    source: "Company Site",
    source_url: searchLink("Psychiatric Nurse Practitioner HarborView Mental Health New York NY jobs"),
    posted_at: "2026-06-10",
    scraped_at: now,
    remote_type: "onsite",
    employment_type: "w2",
    salary_min: 155000,
    salary_max: 172000,
    hourly_min: null,
    hourly_max: null,
    benefits: ["Health", "Dental", "Vision", "PTO", "401k"],
    has_sign_on_bonus: false,
    has_relocation: true,
    license_states: ["NY"],
    requirements: ["Active PMHNP license in NY"],
    extraction_confidence: { compensation: 0.88, remote_type: 0.8, benefits: 0.86, license_states: 0.86 },
    saved: false,
    applied: false,
    hidden: false,
    notes: null,
    match_score: 0.76,
    match_reasons: ["salary match"]
  }
];

interface BcbaSeed {
  id: string;
  source: string;
  title: string;
  employer: string;
  city: string;
  state: string;
  remote_type: Job["remote_type"];
  employment_type: Job["employment_type"];
  hourly?: [number, number];
  salary?: [number, number];
  benefits: string[];
  signOn: boolean;
  relocation: boolean;
  posted_at: string;
  match_score: number;
}

function createBcbaExpansion(): Job[] {
  const seeds: BcbaSeed[] = [
    {
      id: "Indeed:applied-abc-phoenix",
      source: "Indeed",
      title: "Remote BCBA Consultant - Contract",
      employer: "Applied ABC Behavior",
      city: "Phoenix",
      state: "AZ",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [76, 90],
      benefits: ["Health", "Dental", "Vision", "401k", "PTO"],
      signOn: true,
      relocation: true,
      posted_at: "2026-06-16",
      match_score: 0.9
    },
    {
      id: "LinkedIn:spectrum-aba-orlando",
      source: "LinkedIn",
      title: "BCBA Telehealth Supervisor",
      employer: "Spectrum ABA Partners",
      city: "Orlando",
      state: "FL",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [80, 96],
      benefits: ["Health", "Dental", "Vision", "PTO", "CME"],
      signOn: true,
      relocation: false,
      posted_at: "2026-06-15",
      match_score: 0.89
    },
    {
      id: "ZipRecruiter:keystone-autism-pa",
      source: "ZipRecruiter",
      title: "Board Certified Behavior Analyst - Hybrid",
      employer: "Keystone Autism Services",
      city: "Philadelphia",
      state: "PA",
      remote_type: "hybrid",
      employment_type: "contract",
      hourly: [72, 86],
      benefits: ["Health", "Dental", "Vision", "401k"],
      signOn: true,
      relocation: false,
      posted_at: "2026-06-15",
      match_score: 0.87
    },
    {
      id: "Indeed:evergreen-behavior-wa",
      source: "Indeed",
      title: "Remote BCBA - Washington Based",
      employer: "Evergreen Behavior Network",
      city: "Seattle",
      state: "WA",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [82, 98],
      benefits: ["Health", "Dental", "Vision", "401k", "PTO", "CME"],
      signOn: true,
      relocation: true,
      posted_at: "2026-06-14",
      match_score: 0.9
    },
    {
      id: "LinkedIn:midwest-aba-il",
      source: "LinkedIn",
      title: "BCBA Contract Supervisor",
      employer: "Midwest ABA Collective",
      city: "Chicago",
      state: "IL",
      remote_type: "hybrid",
      employment_type: "contract",
      hourly: [75, 87],
      benefits: ["Health", "Dental", "401k", "PTO"],
      signOn: true,
      relocation: false,
      posted_at: "2026-06-14",
      match_score: 0.86
    },
    {
      id: "Company:carolina-autism-raleigh",
      source: "Company Site",
      title: "BCBA Clinical Lead - Remote NC",
      employer: "Carolina Autism Therapy",
      city: "Raleigh",
      state: "NC",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [78, 91],
      benefits: ["Health", "Dental", "Vision", "PTO", "401k"],
      signOn: true,
      relocation: true,
      posted_at: "2026-06-13",
      match_score: 0.88
    },
    {
      id: "Indeed:bay-area-behavior-ca",
      source: "Indeed",
      title: "BCBA Telehealth Case Supervisor",
      employer: "Bay Area Behavioral Care",
      city: "San Francisco",
      state: "CA",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [88, 105],
      benefits: ["Health", "Dental", "Vision", "Malpractice", "PTO"],
      signOn: true,
      relocation: true,
      posted_at: "2026-06-13",
      match_score: 0.92
    },
    {
      id: "ZipRecruiter:boston-behavior-ma",
      source: "ZipRecruiter",
      title: "Remote BCBA Treatment Planner",
      employer: "Boston Behavior Health",
      city: "Boston",
      state: "MA",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [79, 94],
      benefits: ["Health", "Dental", "Vision", "401k", "PTO"],
      signOn: true,
      relocation: false,
      posted_at: "2026-06-12",
      match_score: 0.88
    },
    {
      id: "Indeed:ohio-behavior-columbus",
      source: "Indeed",
      title: "BCBA Remote Contract - Ohio",
      employer: "Ohio Behavior Group",
      city: "Columbus",
      state: "OH",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [73, 89],
      benefits: ["Health", "Dental", "Vision", "PTO"],
      signOn: true,
      relocation: false,
      posted_at: "2026-06-12",
      match_score: 0.86
    },
    {
      id: "LinkedIn:tennessee-aba-nashville",
      source: "LinkedIn",
      title: "BCBA Hybrid Consultant",
      employer: "Tennessee ABA Consultants",
      city: "Nashville",
      state: "TN",
      remote_type: "hybrid",
      employment_type: "contract",
      hourly: [74, 86],
      benefits: ["Health", "Dental", "401k", "PTO"],
      signOn: true,
      relocation: true,
      posted_at: "2026-06-11",
      match_score: 0.85
    },
    {
      id: "Company:new-jersey-autism-care",
      source: "Company Site",
      title: "BCBA Remote Supervisor",
      employer: "New Jersey Autism Care",
      city: "Newark",
      state: "NJ",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [80, 93],
      benefits: ["Health", "Dental", "Vision", "401k", "PTO"],
      signOn: true,
      relocation: false,
      posted_at: "2026-06-11",
      match_score: 0.88
    },
    {
      id: "Indeed:virginia-behavior-richmond",
      source: "Indeed",
      title: "Remote BCBA - Contract",
      employer: "Virginia Behavior Services",
      city: "Richmond",
      state: "VA",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [76, 90],
      benefits: ["Health", "Dental", "Vision", "PTO", "CME"],
      signOn: true,
      relocation: true,
      posted_at: "2026-06-10",
      match_score: 0.87
    },
    {
      id: "LinkedIn:michigan-autism-detroit",
      source: "LinkedIn",
      title: "BCBA Telehealth Program Consultant",
      employer: "Michigan Autism Partners",
      city: "Detroit",
      state: "MI",
      remote_type: "remote_state_based",
      employment_type: "contract",
      hourly: [75, 88],
      benefits: ["Health", "Dental", "Vision", "401k"],
      signOn: true,
      relocation: false,
      posted_at: "2026-06-10",
      match_score: 0.85
    },
    {
      id: "Company:rocky-mountain-aba-denver",
      source: "Company Site",
      title: "BCBA Clinical Manager",
      employer: "Rocky Mountain ABA",
      city: "Denver",
      state: "CO",
      remote_type: "remote_state_based",
      employment_type: "w2",
      salary: [110000, 128000],
      benefits: ["Health", "Dental", "Vision", "401k", "PTO", "CME"],
      signOn: true,
      relocation: true,
      posted_at: "2026-06-09",
      match_score: 0.82
    },
    {
      id: "Indeed:northeast-bcba-program",
      source: "Indeed",
      title: "BCBA Program Director",
      employer: "Northeast Autism Services",
      city: "New York",
      state: "NY",
      remote_type: "onsite",
      employment_type: "w2",
      salary: [112000, 135000],
      benefits: ["Health", "Dental", "Vision", "PTO", "401k"],
      signOn: false,
      relocation: true,
      posted_at: "2026-06-09",
      match_score: 0.78
    }
  ];

  return seeds.map((seed) => {
    const coords = STATE_COORDS[seed.state] ?? { latitude: 39.5, longitude: -98.35 };
    const payPhrase = seed.hourly ? `$${seed.hourly[0]}-$${seed.hourly[1]}/hr` : `$${Math.round((seed.salary?.[0] ?? 0) / 1000)}k-$${Math.round((seed.salary?.[1] ?? 0) / 1000)}k annually`;
    return {
      id: seed.id,
      title: seed.title,
      employer: seed.employer,
      location_text: `${seed.city}, ${seed.state} (${remoteText(seed.remote_type, seed.state)})`,
      state: seed.state,
      latitude: coords.latitude,
      longitude: coords.longitude,
      description: `${remoteText(seed.remote_type, seed.state)} BCBA role. ${payPhrase}. Board Certified Behavior Analyst credential and BACB good standing required. ABA treatment planning, caregiver coaching, autism program design, ${seed.benefits.join(", ")}.${seed.signOn ? " Sign-on bonus available." : ""}${seed.relocation ? " Relocation assistance available." : ""}`,
      source: seed.source,
      source_url: searchLink(`${seed.title} ${seed.employer} ${seed.city} ${seed.state} jobs`),
      posted_at: seed.posted_at,
      scraped_at: now,
      remote_type: seed.remote_type,
      employment_type: seed.employment_type,
      salary_min: seed.salary?.[0] ?? null,
      salary_max: seed.salary?.[1] ?? null,
      hourly_min: seed.hourly?.[0] ?? null,
      hourly_max: seed.hourly?.[1] ?? null,
      benefits: seed.benefits,
      has_sign_on_bonus: seed.signOn,
      has_relocation: seed.relocation,
      license_states: [seed.state],
      requirements: [`Active BCBA certification for ${seed.state}`, "BACB credential in good standing", "ABA treatment planning experience"],
      extraction_confidence: { compensation: 0.9, remote_type: 0.88, benefits: 0.86, license_states: 0.88 },
      saved: false,
      applied: false,
      hidden: false,
      notes: null,
      match_score: seed.match_score,
      match_reasons: ["role match", seed.employment_type === "contract" ? "contract match" : "salary match", seed.signOn ? "bonus match" : "benefit match"]
    };
  });
}

function remoteText(remoteType: Job["remote_type"], state: string): string {
  if (remoteType === "remote_open_us") {
    return "Remote (Open to US)";
  }
  if (remoteType === "remote_state_based") {
    return `Remote - ${state} based`;
  }
  return remoteType === "hybrid" ? "Hybrid" : "Onsite";
}

export function buildDemoSearchResponse(
  jobs = demoJobs,
  query = "Find remote BCBA contract roles over $70/hr with sign-on bonus",
  filters: SearchFilters = { role: "BCBA", min_hourly: 70, sign_on_bonus: true }
): SearchResponse {
  const filteredJobs = filterDemoJobs(jobs, query, filters);
  return {
    query,
    sort: "best_match",
    confidence: { query_understanding: 0.88, ranking: 0.84, extraction: 0.86 },
    jobs: filteredJobs,
    markers: filteredJobs.map<MapMarker>((job) => ({
      id: job.id,
      latitude: job.latitude,
      longitude: job.longitude,
      remote_type: job.remote_type,
      employment_type: job.employment_type,
      state: job.state,
      count: 1,
      match_score: job.match_score
    })),
    aggregations: buildAnalytics(filteredJobs)
  };
}

export function buildAnalytics(jobs: Job[]): AnalyticsSummary {
  const hourly = jobs.filter((job) => job.hourly_max).map((job) => job.hourly_max ?? 0);
  const salary = jobs.filter((job) => job.salary_max).map((job) => job.salary_max ?? 0);
  const count = jobs.length || 1;
  const rolesByState = [...jobs.reduce((states, job) => {
    if (job.state) {
      states.set(job.state, (states.get(job.state) ?? 0) + 1);
    }
    return states;
  }, new Map<string, number>())]
    .map(([state, stateCount]) => ({ state, count: stateCount }))
    .sort((left, right) => right.count - left.count || left.state.localeCompare(right.state));
  const payDistribution = buildPayDistribution(jobs);
  return {
    matching_roles: jobs.length,
    median_hourly: median(hourly),
    median_salary: median(salary),
    remote_share: jobs.filter((job) => job.remote_type.startsWith("remote")).length / count,
    contract_share: jobs.filter((job) => job.employment_type === "contract").length / count,
    benefits_average: jobs.length ? Number((jobs.reduce((sum, job) => sum + job.benefits.length, 0) / jobs.length).toFixed(1)) : 0,
    roles_by_state: rolesByState.length ? rolesByState : [{ state: "-", count: 0 }],
    pay_distribution: payDistribution,
    trend: [
      { date: "May 16", count: 210 },
      { date: "May 17", count: 320 },
      { date: "May 18", count: 570 },
      { date: "May 19", count: 430 },
      { date: "May 20", count: 390 },
      { date: "May 21", count: 480 },
      { date: "May 22", count: 620 }
    ],
    benefit_completeness: 0.85
  };
}

function median(values: number[]): number | null {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[middle - 1] + sorted[middle]) / 2) : sorted[middle];
}

function buildPayDistribution(jobs: Job[]): Array<{ bucket: string; count: number }> {
  const buckets = PAY_BUCKETS.map((bucket) => ({ ...bucket, count: 0 }));
  for (const job of jobs) {
    const hourly = hourlyEquivalent(job);
    const bucket = hourly ? buckets.find((item) => hourly >= item.min && hourly <= item.max) : null;
    if (bucket) {
      bucket.count += 1;
    }
  }
  return buckets.map(({ bucket, count }) => ({ bucket, count }));
}

function filterDemoJobs(jobs: Job[], query: string, filters: SearchFilters): Job[] {
  const role = filters.role ?? inferRoleFromQuery(query);
  return jobs
    .filter((job) => {
      if (role && !roleMatches(job, role)) {
        return false;
      }
      if (filters.employment_type && job.employment_type !== filters.employment_type) {
        return false;
      }
      if (filters.state && job.state !== filters.state) {
        return false;
      }
      if (filters.remote_type && job.remote_type !== filters.remote_type) {
        return false;
      }
      const hourlyEquivalent = job.hourly_max ?? (job.salary_max ? Math.round(job.salary_max / 2080) : 0);
      if (filters.min_hourly && hourlyEquivalent < filters.min_hourly) {
        return false;
      }
      if (filters.sign_on_bonus === true && !job.has_sign_on_bonus) {
        return false;
      }
      if (filters.relocation === true && !job.has_relocation) {
        return false;
      }
      const requiredBenefits = new Set(filters.benefits ?? []);
      if (requiredBenefits.size && ![...requiredBenefits].every((benefit) => job.benefits.includes(benefit))) {
        return false;
      }
      return true;
    })
    .sort((left, right) => right.match_score - left.match_score);
}

function roleMatches(job: Job, role: string): boolean {
  const text = `${job.title} ${job.description}`.toLowerCase();
  const normalizedRole = role.toLowerCase();
  if (normalizedRole === "bcba") {
    return text.includes("bcba") || text.includes("board certified behavior analyst");
  }
  if (normalizedRole === "pmhnp") {
    return text.includes("pmhnp") || text.includes("psychiatric nurse practitioner");
  }
  return text.includes(normalizedRole);
}

function inferRoleFromQuery(query: string): string | undefined {
  if (/\bbcba\b|board certified behavior analyst/i.test(query)) {
    return "BCBA";
  }
  if (/\bpmhnp\b|psychiatric nurse practitioner/i.test(query)) {
    return "PMHNP";
  }
  return undefined;
}
