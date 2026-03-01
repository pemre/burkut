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

  /** Feature flags – flip these to enable/disable functionality */
  features: {
    search: false,
    darkLightToggle: true,
    draggableLayout: true,
    progressTracker: true,
  },
};

export default config;

