import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import "./ContentPanel.css";

export default function ContentPanel({ selectedId, activeGroup, index, getContent, isComplete, onToggleComplete }) {
  const { t } = useTranslation();
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

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

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, activeGroup, getContent]);

  const meta = selectedId ? index[selectedId] : null;
  const currentId = selectedId || activeGroup;
  const completed = isComplete ? isComplete(currentId) : false;

  return (
    <article className="content-panel" aria-label={t("aria.contentPanel")}>
      {meta ? (
        <header className="content-meta">
          <div className="content-meta__left">
            {meta.tags && (
              <div className="content-tags">
                {meta.tags.map((tag) => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            )}
            {meta.subtitle && <p className="content-subtitle">{meta.subtitle}</p>}
          </div>
          {onToggleComplete && (
            <button
              className={`read-toggle ${completed ? "read-toggle--done" : ""}`}
              onClick={() => onToggleComplete(currentId)}
              aria-label={completed ? t("progress.markUnread") : t("progress.markRead")}
              title={completed ? t("progress.markUnread") : t("progress.markRead")}
            >
              <Check size={16} />
            </button>
          )}
        </header>
      ) : (
        /* Group header page — still show mark-as-read toggle */
        onToggleComplete && (
          <header className="content-meta content-meta--header-only">
            <div className="content-meta__left" />
            <button
              className={`read-toggle ${completed ? "read-toggle--done" : ""}`}
              onClick={() => onToggleComplete(currentId)}
              aria-label={completed ? t("progress.markUnread") : t("progress.markRead")}
              title={completed ? t("progress.markUnread") : t("progress.markRead")}
            >
              <Check size={16} />
            </button>
          </header>
        )
      )}

      {loading ? (
        <div className="content-loading">{t("content.loading")}</div>
      ) : (
        <div className="content-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}
