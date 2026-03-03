import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import matter from "gray-matter";
import type { Plugin } from "vite";

const VIRTUAL_ID = "virtual:md-content";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;

/**
 * Recursively collect all .md file paths under a directory.
 */
function collectMdFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMdFiles(full));
    } else if (entry.name.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Vite plugin that pre-parses all .md files at build/dev time using gray-matter
 * and serves them as a single virtual module (`virtual:md-content`).
 *
 * In dev mode this means ONE module request instead of ~75 individual .md fetches.
 * In production the result is identical — all content is bundled into the JS output.
 *
 * The virtual module exports a Record<string, { data, content }> keyed by
 * relative path (e.g. "../content/Cinema/Hero (2002).md").
 *
 * The plugin watches the content directory so that adding, editing, or deleting
 * a .md file triggers an HMR update.
 */
export default function mdContent(): Plugin {
  let contentDir: string;

  return {
    name: "vite-plugin-md-content",

    configResolved(config) {
      contentDir = join(config.root, "src/content");
    },

    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
    },

    load(id: string) {
      if (id !== RESOLVED_ID) return;

      const mdFiles = collectMdFiles(contentDir);
      const modules: Record<string, { data: Record<string, unknown>; content: string }> = {};

      for (const filePath of mdFiles) {
        const raw = readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);
        // Key matches the old import.meta.glob path format: "../content/..."
        const relPath = `../content/${relative(contentDir, filePath)}`;
        modules[relPath] = { data, content };
      }

      return `export default ${JSON.stringify(modules)};`;
    },

    configureServer(server) {
      // Watch the content directory for changes — invalidate the virtual module on any .md change
      server.watcher.add(contentDir);
      server.watcher.on("all", (event, filePath) => {
        if (filePath.endsWith(".md") && filePath.startsWith(contentDir)) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        }
      });
    },
  };
}
