import matter from "gray-matter";
import { useEffect, useState } from "react";

/**
 * Lazily indexes all .md files under /src/content/ via Vite's import.meta.glob.
 *
 * Content structure:
 *   src/content/{Group}.md           → group header file (displayed when group is selected)
 *   src/content/{Group}/{item}.md    → sub-content item
 *
 * Header files are detected by path depth: direct children of content/ (depth 1)
 * are headers; files inside subfolders (depth 2+) are regular items.
 * Header file names must match the group id in config exactly (case-sensitive).
 *
 * Return values:
 *   index       – { [id]: frontmatter }   (all metadata, content excluded)
 *   getContent(id) – Promise<string>       (markdown body, lazy-loaded)
 */

export interface ContentEntry {
  id: string;
  group?: string;
  title?: string;
  subtitle?: string;
  start?: string;
  end?: string;
  className?: string;
  type?: string;
  tags?: string[];
  location?: { lat: number; lng: number; label?: string };
  polygon?: [number, number][];
  sidebarSort?: string;
  _path: string;
  _isHeader: boolean;
  [key: string]: unknown;
}

export interface ContentIndex {
  [id: string]: ContentEntry;
}

// Glob must be static — Vite analyzes it at build time
const rawModules = import.meta.glob("../content/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

/** Content root prefix used to calculate path depth */
const CONTENT_PREFIX = "../content/";

/**
 * Derive id from path.
 * Header files:  "../content/Cinema.md" → "Cinema"
 * Content files: "../content/Cinema/Hero (2002).md" → "Hero (2002)"
 */
export function pathToId(path: string): string {
  return (path.split("/").pop() ?? "").replace(".md", "");
}

/**
 * A file is a group header when it sits directly under the content root,
 * i.e. the relative part after "../content/" contains no "/" separator.
 */
export function isHeaderPath(path: string): boolean {
  const rel = path.slice(CONTENT_PREFIX.length); // e.g. "Cinema.md" or "Cinema/Hero (2002).md"
  return !rel.includes("/");
}

export function useMdLoader() {
  const [index, setIndex] = useState<ContentIndex>({});

  useEffect(() => {
    async function buildIndex() {
      const entries: ContentIndex = {};
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
          } as ContentEntry;
        } catch (e) {
          console.warn("MD parse error:", path, e);
        }
      }
      setIndex(entries);
    }
    buildIndex();
  }, []);

  const getContent = async (id: string): Promise<string | null> => {
    const meta = index[id];
    if (!meta) return null;
    const raw = await rawModules[meta._path]();
    const { content } = matter(raw);
    return content;
  };

  return { index, getContent };
}
