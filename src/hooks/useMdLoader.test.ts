import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import { isHeaderPath, pathToId } from "./useMdLoader";

/**
 * SPEC: useMdLoader
 * -----------------
 * 1. Scans all .md files and adds frontmatter to the index
 * 2. getContent(id) returns the markdown body (excluding frontmatter)
 * 3. getContent returns null for an invalid id
 */

// gray-matter parse test (unit test independent of hook)
describe("gray-matter parse", () => {
  it("correctly parses frontmatter", () => {
    const raw = `---
id: xia
group: Dynasties and States
title: "Xia Dynasty"
start: "-002070-01-01"
end: "-001600-01-01"
---

# Xia Dynasty

Content goes here.`;

    const { data, content } = matter(raw);
    expect(data.id).toBe("xia");
    expect(data.group).toBe("Dynasties and States");
    expect(content.trim()).toContain("# Xia Dynasty");
  });

  it("returns empty data object when no frontmatter is present", () => {
    const raw = "# Just content\n\nNo metadata.";
    const { data, content } = matter(raw);
    expect(data).toEqual({});
    expect(content).toContain("Just content");
  });

  it("parses location object", () => {
    const raw = `---
id: shang
location:
  lat: 36.1
  lng: 114.3
  label: "Yinxu (Anyang)"
---
Content`;
    const { data } = matter(raw);
    const location = data.location as { lat: number; lng: number; label: string };
    expect(location.lat).toBe(36.1);
    expect(location.label).toBe("Yinxu (Anyang)");
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
