import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "./MapPanel.css";

// Leaflet default icon fix (Vite asset pipeline uyumu)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CHINA_CENTER = [35.86, 104.19];
const CHINA_ZOOM = 4;

/** Seçilen item değişince haritayı fly eder */
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 6, { duration: 1.2 });
    } else {
      map.flyTo(CHINA_CENTER, CHINA_ZOOM, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

export default function MapPanel({ selectedId, index }) {
  const meta = selectedId ? index[selectedId] : null;
  const location = meta?.location || null;
  const polygon = meta?.polygon || null;   // GeoJSON koordinat dizisi [[lat,lng], ...]

  return (
    <div className="map-panel" aria-label="Harita paneli">
      <MapContainer
        center={CHINA_CENTER}
        zoom={CHINA_ZOOM}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
        aria-label="Çin haritası"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyTo position={location} />

        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>{location.label || meta?.title}</Popup>
          </Marker>
        )}

        {polygon && (
          <Polygon
            positions={polygon}
            pathOptions={{ color: "#c9a84c", fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>

      {location && (
        <div className="map-info">
          📍 <strong>{location.label}</strong>
          &nbsp;—&nbsp;{location.lat.toFixed(2)}°N, {location.lng.toFixed(2)}°E
        </div>
      )}
    </div>
  );
}
