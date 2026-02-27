import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import "leaflet/dist/leaflet.css";
import "./styles/global.css";
import App from "./App";

// Polyfill Buffer for gray-matter in browser
window.Buffer = Buffer;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
