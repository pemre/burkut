import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={t("theme.toggle")}
      title={t("theme.toggle")}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

