declare module "gray-matter" {
  interface GrayMatterResult {
    data: Record<string, unknown>;
    content: string;
  }
  export default function matter(input: string): GrayMatterResult;
}

declare module "*.md" {
  const content: string;
  export default content;
}
