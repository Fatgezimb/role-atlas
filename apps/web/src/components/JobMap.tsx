import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, WheelEvent } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { STATE_NAMES } from "../data/stateGeo";
import { projectUsCoordinate, projectedPointToPercent, US_MAP_VIEWBOX, US_NATION_PATH, US_STATE_MESH_PATH, US_STATE_PATHS } from "../data/usMap";
import type { Job, MapMarker, MapViewport, RemoteType } from "../types";

const DEFAULT_VIEW = { centerX: 50, centerY: 50, zoom: 1 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const REMOTE_MARKER_OFFSETS: Record<RemoteType, { x: number; y: number }> = {
  onsite: { x: -13, y: -9 },
  hybrid: { x: 13, y: -9 },
  remote_state_based: { x: -13, y: 10 },
  remote_open_us: { x: 13, y: 10 }
};

const REMOTE_LABELS: Record<RemoteType, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote_state_based: "Remote state-based",
  remote_open_us: "Remote open to US"
};

interface MarkerCluster {
  key: string;
  state: string | null;
  remoteType: RemoteType;
  primaryJobId: string;
  count: number;
  latitude: number;
  longitude: number;
  matchScore: number;
}

interface JobMapProps {
  markers: MapMarker[];
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  onViewportChange: (viewport: MapViewport) => void;
  jobsById: Map<string, Job>;
}

export function JobMap({ markers, selectedJobId, onSelectJob, onViewportChange, jobsById }: JobMapProps) {
  const mapPanelRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [view, setView] = useState(DEFAULT_VIEW);
  const selected = selectedJobId ? jobsById.get(selectedJobId) : null;

  const viewport = useMemo(() => buildViewport(view), [view]);
  const isReset = view.zoom === DEFAULT_VIEW.zoom && view.centerX === DEFAULT_VIEW.centerX && view.centerY === DEFAULT_VIEW.centerY;
  const stateCounts = useMemo(() => buildStateCounts(markers), [markers]);
  const remoteStates = useMemo(() => buildRemoteStates(markers), [markers]);
  const markerClusters = useMemo(() => buildMarkerClusters(markers), [markers]);

  useEffect(() => {
    onViewportChange(viewport);
  }, [onViewportChange, viewport]);

  const updateZoom = useCallback((delta: number) => {
    setView((current) => ({
      ...current,
      zoom: clamp(Number((current.zoom + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM)
    }));
  }, []);

  const recenter = useCallback(() => {
    setView(DEFAULT_VIEW);
  }, []);

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const dragMap = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const rect = mapPanelRef.current?.getBoundingClientRect();
    if (!drag || !rect) {
      return;
    }
    const dx = ((event.clientX - drag.x) / rect.width) * 100;
    const dy = ((event.clientY - drag.y) / rect.height) * 100;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    setView((current) => ({
      ...current,
      centerX: clamp(current.centerX - dx / current.zoom, 0, 100),
      centerY: clamp(current.centerY - dy / current.zoom, 0, 100)
    }));
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  const zoomWithWheel = (event: WheelEvent<HTMLElement>) => {
    event.preventDefault();
    updateZoom(event.deltaY < 0 ? 0.18 : -0.18);
  };

  return (
    <section
      ref={mapPanelRef}
      className="map-panel interactive-map"
      aria-label="United States job map"
      onPointerDown={startDrag}
      onPointerMove={dragMap}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={zoomWithWheel}
    >
      <div
        className="map-canvas"
        style={{ "--map-scale": view.zoom, "--map-x": `${50 - view.centerX}%`, "--map-y": `${50 - view.centerY}%` } as CSSProperties}
      >
        <div className="map-stage">
          <svg className="us-map-shape" viewBox={US_MAP_VIEWBOX} role="img" aria-label="United States states map">
            <path className="nation-shadow" d={US_NATION_PATH} />
            <g>
              {US_STATE_PATHS.map((state) => {
                const count = stateCounts.get(state.code) ?? 0;
                return (
                  <path
                    key={state.code}
                    className={stateClassName({
                      count,
                      hasRemote: remoteStates.has(state.code),
                      isSelected: selected?.state === state.code
                    })}
                    d={state.path}
                  >
                    <title>
                      {state.name}
                      {count ? `: ${count} matching ${count === 1 ? "role" : "roles"}` : ""}
                    </title>
                  </path>
                );
              })}
            </g>
            <path className="state-borders" d={US_STATE_MESH_PATH} />
          </svg>

          <div className="state-label-layer" aria-hidden="true">
            {US_STATE_PATHS.filter((state) => stateCounts.has(state.code) || selected?.state === state.code).map((state) => {
              const labelPosition = projectedPointToPercent(state.labelX, state.labelY);
              return (
                <span
                  key={state.code}
                  className={`state-label ${stateCounts.has(state.code) ? "active" : ""}`}
                  style={percentToStyle(labelPosition)}
                >
                  {state.code}
                </span>
              );
            })}
          </div>

          <div className="marker-layer">
            {markerClusters.map((cluster) => {
              const active = cluster.primaryJobId === selectedJobId || (selected?.state === cluster.state && selected?.remote_type === cluster.remoteType);
              const markerPosition = coordinateToStyle(cluster.latitude, cluster.longitude, cluster.remoteType, cluster.count);
              const stateName = cluster.state ? STATE_NAMES[cluster.state] ?? cluster.state : "the United States";
              return (
                <button
                  key={cluster.key}
                  className={`job-marker ${cluster.remoteType} ${active ? "active" : ""}`}
                  style={markerPosition}
                  type="button"
                  aria-label={`${cluster.count} ${REMOTE_LABELS[cluster.remoteType]} ${cluster.count === 1 ? "role" : "roles"} in ${stateName}`}
                  title={`${cluster.count} ${REMOTE_LABELS[cluster.remoteType]} ${cluster.count === 1 ? "role" : "roles"} in ${stateName}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectJob(cluster.primaryJobId);
                  }}
                >
                  <span>{cluster.count > 1 ? cluster.count : ""}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="map-controls" aria-label="Map controls" onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" aria-label="Zoom in" onClick={() => updateZoom(0.35)}>
          <Plus size={20} />
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => updateZoom(-0.35)}>
          <Minus size={20} />
        </button>
        <button type="button" aria-label="Recenter map" onClick={recenter}>
          <LocateFixed size={18} />
        </button>
      </div>

      <div className="map-viewport-chip">
        <strong>{viewport.isFiltered ? "Map-filtered results" : "All states visible"}</strong>
        <span>
          {stateCounts.size} states / {markers.length} roles / {Math.round(view.zoom * 100)}%
        </span>
        {!isReset ? (
          <button type="button" onClick={recenter}>
            Reset
          </button>
        ) : null}
      </div>

      <MapLegend />
    </section>
  );
}

function buildStateCounts(markers: MapMarker[]): Map<string, number> {
  return markers.reduce((counts, marker) => {
    if (marker.state) {
      counts.set(marker.state, (counts.get(marker.state) ?? 0) + (marker.count || 1));
    }
    return counts;
  }, new Map<string, number>());
}

function buildRemoteStates(markers: MapMarker[]): Set<string> {
  return markers.reduce((states, marker) => {
    if (marker.state && marker.remote_type.startsWith("remote")) {
      states.add(marker.state);
    }
    return states;
  }, new Set<string>());
}

function buildMarkerClusters(markers: MapMarker[]): MarkerCluster[] {
  const clusters = new Map<string, MarkerCluster & { weightedLatitude: number; weightedLongitude: number }>();
  for (const marker of markers) {
    const count = marker.count || 1;
    const key = `${marker.state ?? marker.id}:${marker.remote_type}`;
    const existing = clusters.get(key);
    if (existing) {
      existing.count += count;
      existing.weightedLatitude += marker.latitude * count;
      existing.weightedLongitude += marker.longitude * count;
      if (marker.match_score > existing.matchScore) {
        existing.primaryJobId = marker.id;
        existing.matchScore = marker.match_score;
      }
      existing.latitude = existing.weightedLatitude / existing.count;
      existing.longitude = existing.weightedLongitude / existing.count;
      continue;
    }
    clusters.set(key, {
      key,
      state: marker.state,
      remoteType: marker.remote_type,
      primaryJobId: marker.id,
      count,
      latitude: marker.latitude,
      longitude: marker.longitude,
      weightedLatitude: marker.latitude * count,
      weightedLongitude: marker.longitude * count,
      matchScore: marker.match_score
    });
  }
  return [...clusters.values()]
    .map(({ weightedLatitude: _weightedLatitude, weightedLongitude: _weightedLongitude, ...cluster }) => cluster)
    .sort((left, right) => right.count - left.count || right.matchScore - left.matchScore);
}

function MapLegend() {
  const items: Array<{ label: string; type: RemoteType }> = [
    { label: "On-site", type: "onsite" },
    { label: "Hybrid", type: "hybrid" },
    { label: "Remote (state-based)", type: "remote_state_based" },
    { label: "Remote (Open to US)", type: "remote_open_us" }
  ];
  return (
    <div className="map-legend">
      {items.map((item) => (
        <span key={item.label}>
          <i className={item.type} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function stateClassName({
  count,
  hasRemote,
  isSelected
}: {
  count: number;
  hasRemote: boolean;
  isSelected: boolean;
}): string {
  const density = count ? Math.min(4, count) : 0;
  return ["state-fill", `density-${density}`, hasRemote ? "remote-state" : "", isSelected ? "selected" : ""].filter(Boolean).join(" ");
}

function buildViewport(view: typeof DEFAULT_VIEW): MapViewport {
  const horizontalSpan = 58 / view.zoom;
  const verticalSpan = 25 / view.zoom;
  const longitude = -125 + (view.centerX / 100) * 58;
  const latitude = 49.5 - (view.centerY / 100) * 25;
  return {
    bounds: {
      west: longitude - horizontalSpan / 2,
      east: longitude + horizontalSpan / 2,
      south: latitude - verticalSpan / 2,
      north: latitude + verticalSpan / 2
    },
    center: { latitude, longitude },
    zoom: view.zoom,
    isFiltered: view.zoom > 1.04 || Math.abs(view.centerX - DEFAULT_VIEW.centerX) > 1 || Math.abs(view.centerY - DEFAULT_VIEW.centerY) > 1
  };
}

function coordinateToStyle(latitude: number, longitude: number, remoteType: RemoteType, count: number): CSSProperties {
  const { left, top } = projectUsCoordinate(latitude, longitude);
  const offset = REMOTE_MARKER_OFFSETS[remoteType];
  return {
    ...percentToStyle({ left, top }),
    "--marker-offset-x": `${offset.x}px`,
    "--marker-offset-y": `${offset.y}px`,
    "--marker-size": `${Math.min(46, 28 + Math.sqrt(count) * 7)}px`
  } as CSSProperties;
}

function percentToStyle({ left, top }: { left: number; top: number }): CSSProperties {
  return {
    left: `${Math.min(96, Math.max(4, left))}%`,
    top: `${Math.min(93, Math.max(5, top))}%`
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
