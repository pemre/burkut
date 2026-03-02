import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentIndex } from "../../hooks/useMdLoader";
import "./ContentPanel.css";

interface ContentPanelProps {
  selectedId: string | null;
  activeGroup: string;
  index: ContentIndex;
  getContent: (id: string) => Promise<string | null>;
  isComplete?: (id: string) => boolean;
  onToggleComplete?: (id: string) => void;
}

export default function ContentPanel({
  selectedId,
  activeGroup,
  index,
  getContent,
  isComplete,
  onToggleComplete,
}: ContentPanelProps) {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: getContent and t are stable by reference in production
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const targetId = selectedId || activeGroup;

    getContent(targetId)
      .then((content) => {
        if (!cancelled) {
          setMarkdown(content || t("content.notFound"));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMarkdown(t("content.loadError"));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, activeGroup]);

  const meta = selectedId ? index[selectedId] : null;
  const currentId = selectedId || activeGroup;
  const completed = isComplete ? isComplete(currentId) : false;

  return (
    <article className="content-panel" aria-label={t("aria.contentPanel")}>
      {meta && (
        <header className="content-meta">
          <div className="content-meta__left">
            {meta.tags && (
              <div className="content-tags">
                {meta.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {meta.subtitle && <p className="content-subtitle">{meta.subtitle}</p>}
          </div>
        </header>
      )}

      {loading ? (
        <div className="content-loading">{t("content.loading")}</div>
      ) : (
        <div className="content-body">
          {onToggleComplete && (
            <button
              type="button"
              className={`read-toggle ${completed ? "read-toggle--done" : ""}`}
              onClick={() => onToggleComplete(currentId)}
              aria-label={completed ? t("progress.markUnread") : t("progress.markRead")}
              title={completed ? t("progress.markUnread") : t("progress.markRead")}
            >
              <Check size={16} />
            </button>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}
