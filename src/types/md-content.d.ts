declare module "virtual:md-content" {
  const modules: Record<string, { data: Record<string, unknown>; content: string }>;
  export default modules;
}
