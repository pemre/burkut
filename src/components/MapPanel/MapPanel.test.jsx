import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/**
 * SPEC: MapPanel bileşeni
 * -----------------------
 * 1. Konum bilgisi varsa koordinat gösterilir
 * 2. Konum bilgisi yoksa harita yine render olur (fallback)
 * 3. MapContainer render edilir
 *
 * NOT: react-leaflet jsdom'da tam render etmez;
 * temel DOM varlığını ve prop aktarımını test ediyoruz.
 */

// react-leaflet mock
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, "aria-label": label }) => (
    <div data-testid="map-container" aria-label={label}>{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  Polygon: () => <div data-testid="polygon" />,
  useMap: () => ({ flyTo: vi.fn() }),
}));

import MapPanel from "./MapPanel";

const mockIndex = {
  shang: {
    id: "shang",
    title: "Shang Hanedanı",
    location: { lat: 36.1, lng: 114.3, label: "Yinxu (Anyang)" },
  },
};

describe("MapPanel", () => {
  it("harita container render olur", () => {
    render(<MapPanel selectedId={null} index={{}} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("konum bilgisi varsa koordinat gösterilir", () => {
    render(<MapPanel selectedId="shang" index={mockIndex} />);
    expect(screen.getByText(/36.10/)).toBeInTheDocument();
    expect(screen.getByText(/Yinxu/)).toBeInTheDocument();
  });

  it("konum yoksa map-info render olmaz", () => {
    render(<MapPanel selectedId={null} index={{}} />);
    expect(screen.queryByText(/°N/)).not.toBeInTheDocument();
  });
});
