import { useState, useEffect } from "react";
import matter from "gray-matter";

/**
 * Vite import.meta.glob ile /src/content/**\/*.md dosyalarını lazy index'ler.
 *
 * Content structure:
 *   src/content/{Group}.md           → group header file (displayed when group is selected)
 *   src/content/{Group}/{item}.md    → sub-content item
 *
 * Header files are detected by path depth: direct children of content/ (depth 1)
 * are headers; files inside subfolders (depth 2+) are regular items.
 * Header file names must match the group id in config exactly (case-sensitive).
 *
 * Dönen değerler:
 *   index   – { [id]: frontmatter }   (tüm metadata, içerik hariç)
 *   getContent(id) – Promise<string>  (markdown body, lazy)
 */

// Glob statik olmalı – Vite build-time analiz eder
const rawModules = import.meta.glob("../content/**/*.md", { as: "raw" });

/** Content root prefix used to calculate path depth */
const CONTENT_PREFIX = "../content/";

/**
 * Derive id from path.
 * Header files:  "../content/Cinema.md" → "Cinema"
 * Content files: "../content/Cinema/Hero (2002).md" → "Hero (2002)"
 */
function pathToId(path) {
  return path.split("/").pop().replace(".md", "");
}

/**
 * A file is a group header when it sits directly under the content root,
 * i.e. the relative part after "../content/" contains no "/" separator.
 */
function isHeaderPath(path) {
  const rel = path.slice(CONTENT_PREFIX.length); // e.g. "Cinema.md" or "Cinema/Hero (2002).md"
  return !rel.includes("/");
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
          entries[id] = {
            id,
            ...data,
            _path: path,
            _isHeader: isHeaderPath(path),
          };
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
