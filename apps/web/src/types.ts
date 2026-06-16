export type RemoteType = "remote_state_based" | "remote_open_us" | "hybrid" | "onsite";
export type EmploymentType = "contract" | "w2";

export interface Job {
  id: string;
  title: string;
  employer: string;
  location_text: string;
  state: string | null;
  latitude: number;
  longitude: number;
  description: string;
  source: string;
  source_url: string;
  posted_at: string | null;
  scraped_at: string;
  remote_type: RemoteType;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  hourly_min: number | null;
  hourly_max: number | null;
  benefits: string[];
  has_sign_on_bonus: boolean;
  has_relocation: boolean;
  license_states: string[];
  requirements: string[];
  extraction_confidence: Record<string, number>;
  saved: boolean;
  applied: boolean;
  hidden: boolean;
  notes: string | null;
  match_score: number;
  match_reasons: string[];
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  remote_type: RemoteType;
  employment_type: EmploymentType;
  state: string | null;
  count: number;
  match_score: number;
}

export interface MapViewport {
  bounds: {
    west: number;
    east: number;
    south: number;
    north: number;
  };
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  isFiltered: boolean;
}

export interface AnalyticsSummary {
  matching_roles: number;
  median_hourly: number | null;
  median_salary: number | null;
  remote_share: number;
  contract_share: number;
  benefits_average: number;
  roles_by_state: Array<{ state: string; count: number }>;
  pay_distribution: Array<{ bucket: string; count: number }>;
  trend: Array<{ date: string; count: number }>;
  benefit_completeness: number;
}

export interface SearchResponse {
  jobs: Job[];
  markers: MapMarker[];
  aggregations: AnalyticsSummary;
  query: string;
  sort: string;
  confidence: Record<string, number>;
}

export interface SearchFilters {
  location?: string;
  state?: string;
  role?: string;
  employment_type?: EmploymentType;
  remote_type?: RemoteType;
  min_hourly?: number;
  min_salary?: number;
  sign_on_bonus?: boolean;
  relocation?: boolean;
  benefits?: string[];
}

export interface JobStatusPatch {
  saved?: boolean;
  applied?: boolean;
  hidden?: boolean;
  notes?: string | null;
}
