import { describe, expect, it } from "vitest";
import { buildIndex, isHeaderPath, type MdModule, pathToId } from "./useMdLoader";

/**
 * SPEC: useMdLoader
 * -----------------
 * 1. buildIndex builds an index from pre-parsed { data, content } modules
 * 2. pathToId extracts the id from a file path
 * 3. isHeaderPath recognizes header vs subfolder files
 */

// buildIndex tests — uses pre-parsed module format (output of vite-plugin-md-content)
describe("buildIndex", () => {
  it("builds index from pre-parsed modules", () => {
    const modules: Record<string, MdModule> = {
      "../content/Dynasties and States/xia.md": {
        data: {
          id: "xia",
          group: "Dynasties and States",
          title: "Xia Dynasty",
          start: "-002070-01-01",
          end: "-001600-01-01",
        },
        content: "\n# Xia Dynasty\n\nContent goes here.",
      },
    };

    const index = buildIndex(modules);
    expect(index.xia).toBeDefined();
    expect(index.xia.id).toBe("xia");
    expect(index.xia.group).toBe("Dynasties and States");
    expect(index.xia.title).toBe("Xia Dynasty");
    expect(index.xia._isHeader).toBe(false);
    expect(index.xia._path).toBe("../content/Dynasties and States/xia.md");
  });

  it("handles modules with no frontmatter data", () => {
    const modules: Record<string, MdModule> = {
      "../content/Notes/empty.md": {
        data: {},
        content: "# Just content\n\nNo metadata.",
      },
    };

    const index = buildIndex(modules);
    expect(index.empty).toBeDefined();
    expect(index.empty.id).toBe("empty");
    expect(index.empty._isHeader).toBe(false);
  });

  it("parses location object from pre-parsed data", () => {
    const modules: Record<string, MdModule> = {
      "../content/Dynasties and States/shang.md": {
        data: {
          id: "shang",
          location: { lat: 36.1, lng: 114.3, label: "Yinxu (Anyang)" },
        },
        content: "Content",
      },
    };

    const index = buildIndex(modules);
    const location = index.shang.location;
    expect(location?.lat).toBe(36.1);
    expect(location?.label).toBe("Yinxu (Anyang)");
  });

  it("detects header files by path depth", () => {
    const modules: Record<string, MdModule> = {
      "../content/Cinema.md": {
        data: { id: "Cinema", group: "Cinema", title: "Cinema" },
        content: "Header content",
      },
      "../content/Cinema/Hero (2002).md": {
        data: { id: "Hero (2002)", group: "Cinema", title: "Hero" },
        content: "Movie content",
      },
    };

    const index = buildIndex(modules);
    expect(index.Cinema._isHeader).toBe(true);
    expect(index["Hero (2002)"]._isHeader).toBe(false);
  });
});

describe("pathToId util", () => {
  it("extracts id from file path (subfolder item)", () => {
    expect(pathToId("../content/Dynasties and States/xia.md")).toBe("xia");
    expect(pathToId("../content/Cinema/Hero (2002).md")).toBe("Hero (2002)");
  });

  it("extracts id from header file (depth-1)", () => {
    expect(pathToId("../content/Cinema.md")).toBe("Cinema");
    expect(pathToId("../content/Dynasties and States.md")).toBe("Dynasties and States");
    expect(pathToId("../content/Literature.md")).toBe("Literature");
  });
});

describe("isHeaderPath util", () => {
  it("recognizes depth-1 files as headers", () => {
    expect(isHeaderPath("../content/Cinema.md")).toBe(true);
    expect(isHeaderPath("../content/Dynasties and States.md")).toBe(true);
    expect(isHeaderPath("../content/Literature.md")).toBe(true);
  });

  it("does not recognize subfolder files as headers", () => {
    expect(isHeaderPath("../content/Cinema/Hero (2002).md")).toBe(false);
    expect(isHeaderPath("../content/Dynasties and States/xia.md")).toBe(false);
  });
});
