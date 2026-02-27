import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import { useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import { useTheme } from "../../hooks/useTheme";
import { useResizeObserver } from "../../hooks/useResizeObserver";
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

// OpenStreetMaps are using local language for China, I prefered English.
// It can be a feature in the future to select the style...
// const TILE_LIGHT = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_LIGHT = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_DARK = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR_LIGHT = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO';
const TILE_ATTR_DARK = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

const ACCENT_COLOR = "#c9a84c";

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

/** Watches the map container for size changes and calls invalidateSize */
function MapResizeWatcher({ containerRef }) {
  const map = useMap();
  const handleResize = useCallback(() => {
    map.invalidateSize();
  }, [map]);
  useResizeObserver(containerRef, handleResize);
  return null;
}

export default function MapPanel({ selectedId, index }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const meta = selectedId ? index[selectedId] : null;
  const location = meta?.location || null;
  const polygon = meta?.polygon || null;   // GeoJSON koordinat dizisi [[lat,lng], ...]

  const tileUrl = theme === "dark" ? TILE_DARK : TILE_LIGHT;
  const tileAttr = theme === "dark" ? TILE_ATTR_DARK : TILE_ATTR_LIGHT;

  return (
    <div className="map-panel" ref={containerRef} aria-label={t("aria.map")}>
      <MapContainer
        center={CHINA_CENTER}
        zoom={CHINA_ZOOM}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
        aria-label={t("aria.mapContainer")}
      >
        <TileLayer
          key={theme}
          attribution={tileAttr}
          url={tileUrl}
        />

        <FlyTo position={location} />
        <MapResizeWatcher containerRef={containerRef} />

        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>{location.label || meta?.title}</Popup>
          </Marker>
        )}

        {polygon && (
          <Polygon
            positions={polygon}
            pathOptions={{ color: ACCENT_COLOR, fillOpacity: 0.2 }}
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
