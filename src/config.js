/**
 * Centralized application configuration.
 * Single source of truth for groups, app identity, theme, defaults, and features.
 */

const config = {
  app: {
    name: "Bürküt",
    logo: "🦅",
    defaultLocale: "tr",
    supportedLocales: [
      { code: "tr", label: "Türkçe" },
      { code: "en", label: "English" },
      { code: "zh", label: "中文" },
    ],
  },

  /**
   * Groups define the main content categories.
   * - id:             matches the `group` field in MD front matter (must stay stable)
   * - translationKey: key used by react-i18next for locale-appropriate label
   */
  groups: [
    { id: "Dynasties and States", translationKey: "groups.dynasties" },
    { id: "Literature",           translationKey: "groups.literature" },
    { id: "Cinema",               translationKey: "groups.cinema" },
  ],

  defaults: {
    activeGroup: "Dynasties and States",
  },

  theme: {
    accentColor: "#c9a84c",
    accentColorAlpha12: "rgba(201, 168, 76, 0.12)",
    accentColorAlpha15: "rgba(201, 168, 76, 0.15)",
    accentColorAlpha20: "rgba(201, 168, 76, 0.2)",
    accentColorAlpha30: "rgba(201, 168, 76, 0.3)",
    accentColorAlpha44: "#c9a84c44",
    bgBody: "#d0d0dd",
    darkBg: "#0f0f1a",
    darkBgAlt: "#0d0d1c",
    sidebarBg: "#1a1a2e",
  },

  /** Feature flags – flip these to enable/disable functionality */
  features: {
    search: false,
    darkLightToggle: false,
  },
};

export default config;

