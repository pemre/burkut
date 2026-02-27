import "@testing-library/jest-dom";
import { vi } from "vitest";
import { Buffer } from "buffer";

// Polyfill Buffer for gray-matter in jsdom test environment
globalThis.Buffer = Buffer;

// Global react-i18next mock — returns translation keys as-is
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: "tr",
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: { type: "3rdParty", init: () => {} },
}));

