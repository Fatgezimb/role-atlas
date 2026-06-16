import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, WheelEvent } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { STATE_POINTS } from "../data/stateGeo";
import type { Job, MapMarker, MapViewport, RemoteType } from "../types";

const DEFAULT_VIEW = { centerX: 50, centerY: 50, zoom: 1 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

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
        aria-hidden="true"
      >
        <svg viewBox="0 0 960 560" role="img" aria-label="Stylized United States map">
          <path
            className="us-land"
            d="M116 184 188 142l86 10 78-18 92 18 94-4 80 22 88 18 92 42 42 80-26 80-88 38-84 58-130 26-126-4-116-38-116 12-88-50-52-86 22-96z"
          />
          <path className="state-line" d="M164 182v246M220 156v284M276 148v302M332 140v332M388 148v338M456 154v344M520 158v332M580 164v312M642 178v278M704 196v222M766 220v166" />
          <path className="state-line" d="M142 222h604M126 278h702M126 340h706M156 388h632M190 426h536" />
        </svg>

        <div className="state-label-layer">
          {STATE_POINTS.map((state) => (
            <span key={state.code} className="state-label" style={coordinateToStyle(state.latitude, state.longitude)}>
              {state.code}
            </span>
          ))}
        </div>

        {markers.map((marker) => {
          const job = jobsById.get(marker.id);
          const active = marker.id === selectedJobId;
          return (
            <button
              key={marker.id}
              className={`job-marker ${marker.remote_type} ${active ? "active" : ""}`}
              style={coordinateToStyle(marker.latitude, marker.longitude)}
              type="button"
              aria-label={`${job?.title ?? "Job"} in ${job?.location_text ?? marker.state}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onSelectJob(marker.id);
              }}
            >
              {marker.count > 1 ? marker.count : ""}
            </button>
          );
        })}

        {selected ? (
          <div className="selection-line" style={coordinateToStyle(selected.latitude, selected.longitude)} aria-hidden="true" />
        ) : null}
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
        <span>{Math.round(view.zoom * 100)}% zoom</span>
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

function coordinateToStyle(latitude: number, longitude: number): CSSProperties {
  const left = ((longitude + 125) / 58) * 100;
  const top = ((49.5 - latitude) / 25) * 100;
  return {
    left: `${Math.min(94, Math.max(6, left))}%`,
    top: `${Math.min(88, Math.max(10, top))}%`
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
