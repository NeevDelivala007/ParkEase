import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import type { LeafletEvent, Marker as LeafletMarker } from "leaflet";
import { createParkingIcon } from "@/lib/mapIcons";
import type { LatLng } from "@/lib/geo";

const PENDING_SPOT_SHAPE = { type: "COMMUNITY" as const, verificationStatus: "COMMUNITY_SUBMITTED" as const };

function ClickToSetLocation({ onChange }: { onChange: (loc: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

function RecenterOnExternalChange({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.5 });
    // Only re-run when the coordinates actually change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);
  return null;
}

interface LocationPickerProps {
  value: LatLng;
  onChange: (loc: LatLng) => void;
  className?: string;
}

/**
 * A small interactive map for picking/adjusting a submission's
 * coordinates: click anywhere to move the pin, or drag the pin directly.
 * Uses the same distinct "community" marker style as the main map so the
 * preview matches how the pin will actually look once submitted.
 */
export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const center: [number, number] = [value.latitude, value.longitude];

  return (
    <div className={className}>
      <MapContainer center={center} zoom={16} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnExternalChange center={center} />
        <ClickToSetLocation onChange={onChange} />
        <Marker
          position={center}
          icon={createParkingIcon(PENDING_SPOT_SHAPE)}
          draggable
          eventHandlers={{
            dragend: (e: LeafletEvent) => {
              const marker = e.target as LeafletMarker;
              const pos = marker.getLatLng();
              onChange({ latitude: pos.lat, longitude: pos.lng });
            },
          }}
        />
      </MapContainer>
    </div>
  );
}
