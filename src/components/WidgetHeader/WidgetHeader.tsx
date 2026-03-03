import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import config from "../../config";
import "./WidgetHeader.css";

interface WidgetHeaderProps {
  titleKey: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function WidgetHeader({ titleKey, onClose, children }: WidgetHeaderProps) {
  const { t } = useTranslation();
  const draggable = config.features.draggableLayout;

  return (
    <div className={`widget-header${draggable ? " widget-header--draggable" : ""}`}>
      <span className="widget-header__title">{t(titleKey)}</span>
      {children && <div className="widget-header__actions">{children}</div>}
      {draggable && onClose && (
        <button
          type="button"
          className="widget-header__close"
          aria-label={t("widget.close")}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
