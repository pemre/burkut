# UI Design System Guidelines

Machine-readable conventions for the Bürküt design system. Follow these rules when creating or modifying UI primitives in `src/components/ui/`.

---

## Token Architecture

The design system uses a three-tier CSS custom property architecture based on the W3C Design Tokens Community Group (DTCG) conceptual model. All tokens live in plain CSS — no JSON files or build-time transforms.

### Tier 1: Core Tokens

Raw, context-free values defined in `:root` in `src/styles/global.css`. Components never reference core tokens directly.

**Naming:** `--{category}-{name}-{scale}`

```css
/* Color */
--color-amber-500: #f29b17;
--color-gray-300: #d1d9e0;

/* Spacing */
--space-1: 0.125rem;
--space-2: 0.25rem;
--space-3: 0.375rem;
--space-4: 0.5rem;

/* Border radius */
--radius-sm: 4px;
--radius-md: 6px;
--radius-lg: 8px;

/* Font size */
--font-size-xs: 0.75rem;
--font-size-sm: 0.85rem;

/* Transition duration */
--duration-fast: 0.15s;
--duration-normal: 0.25s;
```

### Tier 2: Semantic Tokens

Contextual meaning referencing core tokens. Defined in `:root` (light) and `[data-theme="dark"]` (dark) in `src/styles/global.css`. These are the primary tokens consumed by component CSS.

**Naming:** `--{category}-{context}`

```css
/* :root (light) */
--color-primary: var(--color-amber-500);
--color-bg-body: var(--color-gray-100);
--color-bg-surface: #ffffff;
--color-text-primary: var(--color-gray-900);
--color-border-default: var(--color-gray-300);
--color-border-hover: var(--color-amber-500-a44);
--color-hover-bg: rgba(208, 215, 222, 0.32);
--radius-control: var(--radius-md);

/* [data-theme="dark"] overrides */
--color-primary: var(--color-amber-400);
--color-bg-body: #1c2128;
--color-bg-surface: #22272e;
--color-text-primary: #adbac7;
--color-border-default: var(--color-gray-700);
```

### Tier 3: Component Tokens

Scoped to a specific UI primitive. Defined in the component's co-located `.css` file. Reference semantic tokens (or core tokens when no semantic equivalent exists).

**Naming:** `--{component}-{property}`

```css
/* Button.css */
.btn {
  --btn-height: 28px;
  --btn-border-radius: var(--radius-control);
  --btn-padding-x: var(--space-3);
  --btn-font-size: var(--font-size-sm);
}
```

### Token Flow

```
Core Token                  → Semantic Token              → Component Token
--color-amber-500: #f29b17  → --color-primary: var(…)     →
--radius-md: 6px            → --radius-control: var(…)    → --btn-border-radius: var(--radius-control)
--space-3: 0.375rem         →                             → --btn-padding-x: var(--space-3)
--font-size-sm: 0.85rem     →                             → --btn-font-size: var(--font-size-sm)
```

### Adding a New Token

1. Add the core token to the appropriate category section in `src/styles/global.css` under `:root`.
2. If the value has contextual meaning, create a semantic token referencing the core token.
3. If the value is specific to one component, create a component token in the component's `.css` file.

---

## Button Primitive

**Location:** `src/components/ui/Button/Button.tsx`
**Import:** `import { Button } from "../ui";` or `import { Button } from "./components/ui";`

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"icon" \| "text"` | `"icon"` | Visual variant |
| `children` | `ReactNode` | — | Icon or text content |
| `className` | `string` | — | Merged with internal classes |
| `aria-label` | `string` | — | Accessible label (required for icon-only buttons) |
| `title` | `string` | — | Tooltip text |
| `aria-expanded` | `boolean \| "true" \| "false"` | — | Expansion state |
| `aria-pressed` | `boolean \| "true" \| "false"` | — | Toggle state |
| `disabled` | `boolean` | — | Disables interaction |
| `onClick` | `(e) => void` | — | Click handler |
| `href` | `string` | — | When provided, renders `<a>` instead of `<button>` |
| `target` | `string` | — | Anchor target (only with `href`) |
| `rel` | `string` | — | Anchor rel (only with `href`) |

### Rendered Element

- **No `href`:** renders `<button type="button">`
- **With `href`:** renders `<a>` with anchor-specific attributes

### CSS Classes

| Class | Applied When |
|-------|-------------|
| `btn` | Always |
| `btn--icon` | `variant="icon"` or default |
| `btn--text` | `variant="text"` |

### Usage Examples

**Icon button:**

```tsx
<Button
  variant="icon"
  aria-label={t("themeToggle.label")}
  title={t("themeToggle.title")}
  onClick={toggleTheme}
>
  <Sun size={16} />
</Button>
```

**Text button:**

```tsx
<Button
  variant="text"
  aria-label={t("widgets.toggleLabel")}
  aria-expanded={isOpen}
  title={t("widgets.title")}
  onClick={toggleMenu}
>
  <LayoutGrid size={14} />
  {t("widgets.label")}
  <ChevronDown size={14} />
</Button>
```

**Link-styled button (anchor):**

```tsx
<Button
  variant="icon"
  href="https://github.com/pemre/burkut"
  target="_blank"
  rel="noreferrer"
  aria-label="GitHub"
  title="GitHub"
>
  <Github size={16} />
</Button>
```

### Disabled State

- `<button>`: native `disabled` attribute — `opacity: 0.5`, `cursor: not-allowed`, no click events.
- `<a>`: `aria-disabled="true"` applied, `e.preventDefault()` called on click.

---

## Component Tokens Reference

### Button (`--btn-*`)

| Token | Default Value | Purpose |
|-------|--------------|---------|
| `--btn-height` | `28px` | Control height for both icon and text variants |
| `--btn-border-radius` | `var(--radius-control)` | Border radius |
| `--btn-padding-x` | `var(--space-3)` | Horizontal padding (text variant only) |
| `--btn-font-size` | `var(--font-size-sm)` | Font size (text variant only) |

These tokens are defined on the `.btn` selector in `Button.css` and can be overridden by parent components or utility classes when needed.

---

## Adding a New UI Primitive

Follow these steps when creating a new primitive in `src/components/ui/`:

### 1. File Structure

Create a folder at `src/components/ui/{Name}/` with three files:

```
src/components/ui/{Name}/
├── {Name}.tsx        # Component implementation
├── {Name}.css        # Styles and component tokens
└── {Name}.test.tsx   # Unit tests
```

### 2. Component Tokens

Define component tokens in `{Name}.css` on the root selector using `--{component}-{property}` naming:

```css
.my-component {
  --my-component-height: 32px;
  --my-component-gap: var(--space-2);
}
```

Reference semantic tokens for default values. Only reference core tokens when no semantic equivalent exists.

### 3. Barrel Export

Add the component to `src/components/ui/index.ts`:

```typescript
export { MyComponent } from "./MyComponent/MyComponent";
export type { MyComponentProps } from "./MyComponent/MyComponent";
```

### 4. Testing

Write unit tests in `{Name}.test.tsx` covering:

- Default render output
- All variant/prop combinations
- Attribute forwarding
- Disabled/interactive states

Write property-based tests in `{Name}.property.test.tsx` using `fast-check` when the component has properties that should hold across all valid inputs.

### 5. TypeScript

- Export a named `Props` type (e.g., `MyComponentProps`)
- Use discriminated unions for polymorphic components
- Avoid `any` — use `ComponentPropsWithoutRef<"element">` for HTML attribute forwarding

---

## Patterns and Anti-Patterns

### DO: Use `Button` with `href` for icon links

```tsx
<Button variant="icon" href="/about" aria-label="About">
  <Info size={16} />
</Button>
```

### DON'T: Style raw `<a>` tags to look like buttons

```tsx
{/* ❌ Avoid this */}
<a href="/about" className="custom-icon-link" style={{ ... }}>
  <Info size={16} />
</a>
```

### DO: Use semantic tokens in component CSS

```css
.my-component {
  border-color: var(--color-border-default);
  color: var(--color-text-primary);
}
```

### DON'T: Use hardcoded color values

```css
/* ❌ Avoid this */
.my-component {
  border-color: #d1d9e0;
  color: #1f2328;
}
```

### DO: Use component tokens for component-specific values

```css
.my-component {
  --my-component-height: 32px;
  height: var(--my-component-height);
}
```

### DON'T: Reference core tokens directly from component CSS

```css
/* ❌ Avoid this — go through semantic tokens */
.my-component {
  border-radius: var(--radius-md);
}

/* ✅ Correct — use the semantic token */
.my-component {
  border-radius: var(--radius-control);
}
```

### DO: Import primitives from the barrel export

```typescript
import { Button } from "../ui";
```

### DON'T: Import directly from the component file

```typescript
/* ❌ Avoid this */
import { Button } from "../ui/Button/Button";
```

### DO: Provide `aria-label` on icon-only buttons

```tsx
<Button variant="icon" aria-label="Close" onClick={onClose}>
  <X size={16} />
</Button>
```

### DON'T: Omit accessible labels on icon-only buttons

```tsx
{/* ❌ No accessible name — screen readers can't describe this */}
<Button variant="icon" onClick={onClose}>
  <X size={16} />
</Button>
```

### DO: Keep feature components in `src/components/{Name}/`, consuming primitives from `src/components/ui/`

### DON'T: Place feature-specific components inside `src/components/ui/`

The `ui/` directory is reserved for low-level, reusable building blocks only.
