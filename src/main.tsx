import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "@fontsource/crimson-pro/400.css";
import "@fontsource/crimson-pro/500.css";
import "@fontsource/crimson-pro/700.css";
import "./styles/global.css";
import "./i18n"; // i18next initialization — must be imported before App
import App from "./App";
import { ThemeProvider } from "./hooks/useTheme";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
