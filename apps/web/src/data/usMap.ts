import { geoAlbersUsa, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import statesAtlas from "us-atlas/states-albers-10m.json";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

interface StateProperties {
  name: string;
}

interface UsStatePath {
  code: string;
  name: string;
  path: string;
  labelX: number;
  labelY: number;
}

const MAP_MIN_X = -70;
const MAP_MIN_Y = 0;
const MAP_WIDTH = 1045;
const MAP_HEIGHT = 610;

export const US_MAP_VIEWBOX = `${MAP_MIN_X} ${MAP_MIN_Y} ${MAP_WIDTH} ${MAP_HEIGHT}`;

const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL",
  "02": "AK",
  "04": "AZ",
  "05": "AR",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  "10": "DE",
  "11": "DC",
  "12": "FL",
  "13": "GA",
  "15": "HI",
  "16": "ID",
  "17": "IL",
  "18": "IN",
  "19": "IA",
  "20": "KS",
  "21": "KY",
  "22": "LA",
  "23": "ME",
  "24": "MD",
  "25": "MA",
  "26": "MI",
  "27": "MN",
  "28": "MS",
  "29": "MO",
  "30": "MT",
  "31": "NE",
  "32": "NV",
  "33": "NH",
  "34": "NJ",
  "35": "NM",
  "36": "NY",
  "37": "NC",
  "38": "ND",
  "39": "OH",
  "40": "OK",
  "41": "OR",
  "42": "PA",
  "44": "RI",
  "45": "SC",
  "46": "SD",
  "47": "TN",
  "48": "TX",
  "49": "UT",
  "50": "VT",
  "51": "VA",
  "53": "WA",
  "54": "WV",
  "55": "WI",
  "56": "WY"
};

type AtlasObjects = {
  states: GeometryCollection<StateProperties>;
  nation: GeometryCollection<StateProperties>;
};

const topology = statesAtlas as unknown as Topology<AtlasObjects>;
const pathGenerator = geoPath();
const projectedStates = feature(topology, topology.objects.states) as FeatureCollection<Geometry, StateProperties>;
const projectedNation = feature(topology, topology.objects.nation) as FeatureCollection<Geometry, StateProperties>;
const markerProjection = geoAlbersUsa().scale(1300).translate([487.5, 305]);

export const US_NATION_PATH = pathGenerator(projectedNation) ?? "";
export const US_STATE_MESH_PATH = pathGenerator(mesh(topology, topology.objects.states, (left, right) => left !== right)) ?? "";

export const US_STATE_PATHS: UsStatePath[] = projectedStates.features
  .map((state) => {
    const code = FIPS_TO_STATE[String(state.id).padStart(2, "0")];
    const [labelX, labelY] = pathGenerator.centroid(state as Feature<Geometry, StateProperties>);
    return {
      code,
      name: state.properties.name,
      path: pathGenerator(state) ?? "",
      labelX,
      labelY
    };
  })
  .filter((state) => Boolean(state.code && state.path));

export function projectUsCoordinate(latitude: number, longitude: number): { left: number; top: number } {
  const projected = markerProjection([longitude, latitude]);
  if (!projected) {
    return { left: 50, top: 50 };
  }
  return projectedPointToPercent(projected[0], projected[1]);
}

export function projectedPointToPercent(x: number, y: number): { left: number; top: number } {
  return {
    left: ((x - MAP_MIN_X) / MAP_WIDTH) * 100,
    top: ((y - MAP_MIN_Y) / MAP_HEIGHT) * 100
  };
}
