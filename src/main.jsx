import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import "leaflet/dist/leaflet.css";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/500.css";
import "@fontsource/crimson-pro/700.css";
import "./styles/global.css";
import "./i18n"; // i18next initialization — must be imported before App
import { ThemeProvider } from "./hooks/useTheme";
import App from "./App";

// Polyfill Buffer for gray-matter in browser
window.Buffer = Buffer;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
