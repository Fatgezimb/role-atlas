export interface StatePoint {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const STATE_POINTS: StatePoint[] = [
  { code: "AL", name: "Alabama", latitude: 32.8067, longitude: -86.7911 },
  { code: "AZ", name: "Arizona", latitude: 33.7298, longitude: -111.4312 },
  { code: "AR", name: "Arkansas", latitude: 34.9697, longitude: -92.3731 },
  { code: "CA", name: "California", latitude: 36.7783, longitude: -119.4179 },
  { code: "CO", name: "Colorado", latitude: 39.5501, longitude: -105.7821 },
  { code: "CT", name: "Connecticut", latitude: 41.6032, longitude: -73.0877 },
  { code: "DE", name: "Delaware", latitude: 38.9108, longitude: -75.5277 },
  { code: "FL", name: "Florida", latitude: 27.6648, longitude: -81.5158 },
  { code: "GA", name: "Georgia", latitude: 32.1656, longitude: -82.9001 },
  { code: "IA", name: "Iowa", latitude: 41.878, longitude: -93.0977 },
  { code: "ID", name: "Idaho", latitude: 44.0682, longitude: -114.742 },
  { code: "IL", name: "Illinois", latitude: 40.6331, longitude: -89.3985 },
  { code: "IN", name: "Indiana", latitude: 40.2672, longitude: -86.1349 },
  { code: "KS", name: "Kansas", latitude: 39.0119, longitude: -98.4842 },
  { code: "KY", name: "Kentucky", latitude: 37.8393, longitude: -84.27 },
  { code: "LA", name: "Louisiana", latitude: 30.9843, longitude: -91.9623 },
  { code: "MA", name: "Massachusetts", latitude: 42.4072, longitude: -71.3824 },
  { code: "MD", name: "Maryland", latitude: 39.0458, longitude: -76.6413 },
  { code: "ME", name: "Maine", latitude: 45.2538, longitude: -69.4455 },
  { code: "MI", name: "Michigan", latitude: 44.3148, longitude: -85.6024 },
  { code: "MN", name: "Minnesota", latitude: 46.7296, longitude: -94.6859 },
  { code: "MO", name: "Missouri", latitude: 37.9643, longitude: -91.8318 },
  { code: "MS", name: "Mississippi", latitude: 32.3547, longitude: -89.3985 },
  { code: "MT", name: "Montana", latitude: 46.8797, longitude: -110.3626 },
  { code: "NC", name: "North Carolina", latitude: 35.7596, longitude: -79.0193 },
  { code: "ND", name: "North Dakota", latitude: 47.5515, longitude: -101.002 },
  { code: "NE", name: "Nebraska", latitude: 41.4925, longitude: -99.9018 },
  { code: "NH", name: "New Hampshire", latitude: 43.1939, longitude: -71.5724 },
  { code: "NJ", name: "New Jersey", latitude: 40.0583, longitude: -74.4057 },
  { code: "NM", name: "New Mexico", latitude: 34.5199, longitude: -105.8701 },
  { code: "NV", name: "Nevada", latitude: 38.8026, longitude: -116.4194 },
  { code: "NY", name: "New York", latitude: 43.2994, longitude: -74.2179 },
  { code: "OH", name: "Ohio", latitude: 40.4173, longitude: -82.9071 },
  { code: "OK", name: "Oklahoma", latitude: 35.0078, longitude: -97.0929 },
  { code: "OR", name: "Oregon", latitude: 43.8041, longitude: -120.5542 },
  { code: "PA", name: "Pennsylvania", latitude: 41.2033, longitude: -77.1945 },
  { code: "RI", name: "Rhode Island", latitude: 41.5801, longitude: -71.4774 },
  { code: "SC", name: "South Carolina", latitude: 33.8361, longitude: -81.1637 },
  { code: "SD", name: "South Dakota", latitude: 43.9695, longitude: -99.9018 },
  { code: "TN", name: "Tennessee", latitude: 35.5175, longitude: -86.5804 },
  { code: "TX", name: "Texas", latitude: 31.9686, longitude: -99.9018 },
  { code: "UT", name: "Utah", latitude: 39.321, longitude: -111.0937 },
  { code: "VA", name: "Virginia", latitude: 37.4316, longitude: -78.6569 },
  { code: "VT", name: "Vermont", latitude: 44.5588, longitude: -72.5778 },
  { code: "WA", name: "Washington", latitude: 47.7511, longitude: -120.7401 },
  { code: "WI", name: "Wisconsin", latitude: 43.7844, longitude: -88.7879 },
  { code: "WV", name: "West Virginia", latitude: 38.5976, longitude: -80.4549 },
  { code: "WY", name: "Wyoming", latitude: 43.076, longitude: -107.2903 },
  { code: "DC", name: "District of Columbia", latitude: 38.9072, longitude: -77.0369 }
];

export const STATE_COORDS = Object.fromEntries(
  STATE_POINTS.map((state) => [state.code, { latitude: state.latitude, longitude: state.longitude }])
) as Record<string, { latitude: number; longitude: number }>;

export const STATE_NAMES = Object.fromEntries(STATE_POINTS.map((state) => [state.code, state.name])) as Record<string, string>;
