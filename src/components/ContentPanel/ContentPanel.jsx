import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "react-i18next";
import "./ContentPanel.css";

export default function ContentPanel({ selectedId, activeGroup, index, getContent }) {
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

  return (
    <article className="content-panel" aria-label={t("aria.contentPanel")}>
      {meta && (
        <header className="content-meta">
          <h2>{meta.title}</h2>
          {meta.subtitle && <p className="content-subtitle">{meta.subtitle}</p>}
          {meta.tags && (
            <div className="content-tags">
              {meta.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </header>
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
