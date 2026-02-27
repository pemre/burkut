import { useState, useEffect } from "react";
import matter from "gray-matter";

/**
 * Vite import.meta.glob ile /src/content/**\/*.md dosyalarını lazy index'ler.
 *
 * Dönen değerler:
 *   index   – { [id]: frontmatter }   (tüm metadata, içerik hariç)
 *   getContent(id) – Promise<string>  (markdown body, lazy)
 */

// Glob statik olmalı – Vite build-time analiz eder
const rawModules = import.meta.glob("../content/**/*.md", { as: "raw" });

function pathToId(path) {
  // "../content/hanedanlar/xia.md" → "xia"
  return path.split("/").pop().replace(".md", "");
}

export function useMdLoader() {
  const [index, setIndex] = useState({});

  useEffect(() => {
    async function buildIndex() {
      const entries = {};
      for (const [path, loader] of Object.entries(rawModules)) {
        const id = pathToId(path);
        try {
          const raw = await loader();
          const { data } = matter(raw);
          entries[id] = { id, ...data, _path: path };
        } catch (e) {
          console.warn("MD parse hatası:", path, e);
        }
      }
      setIndex(entries);
    }
    buildIndex();
  }, []);

  const getContent = async (id) => {
    const meta = index[id];
    if (!meta) return null;
    const raw = await rawModules[meta._path]();
    const { content } = matter(raw);
    return content;
  };

  return { index, getContent };
}
