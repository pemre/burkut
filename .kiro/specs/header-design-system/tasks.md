# Implementation Plan: Header Design System

## Overview

Build a foundational design system for Bürküt starting with a three-tier CSS token architecture in `global.css`, a polymorphic `Button` UI primitive in `src/components/ui/`, and migration of all header controls to use shared tokens and the Button component. Existing visual appearance and tests must be preserved throughout via backward-compatible aliases.

## Tasks

- [x] 1. Establish design token architecture in global.css
  - [x] 1.1 Add core tokens to `:root` in `src/styles/global.css`
    - Define `--color-amber-500`, `--color-gray-*` scale, and alpha variants for color
    - Define `--space-1` through `--space-4` (0.125rem–0.5rem) for spacing
    - Define `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px) for border-radius
    - Define `--font-size-xs` (0.75rem), `--font-size-sm` (0.85rem) for font size
    - Define `--duration-fast` (0.15s), `--duration-normal` (0.25s) for transitions
    - _Requirements: 1.1, 1.5_

  - [x] 1.2 Add semantic tokens referencing core tokens in `:root` and `[data-theme="dark"]`
    - Define `--color-primary`, `--color-bg-body`, `--color-bg-surface`, `--color-bg-surface-alt`
    - Define `--color-text-primary`, `--color-text-secondary`, `--color-border-default`, `--color-border-hover`
    - Define `--color-hover-bg`, `--radius-control`
    - Provide light values under `:root` and dark overrides under `[data-theme="dark"]`
    - _Requirements: 1.2, 1.3_

  - [x] 1.3 Migrate existing ad-hoc variables to aliases pointing to new semantic tokens
    - Keep `--accent`, `--bg-body`, `--bg-surface`, `--text-primary`, `--border-default`, `--hover-bg` etc. as aliases (e.g., `--accent: var(--color-primary)`)
    - Ensure all existing component CSS continues to work without changes
    - Repeat alias pattern in `[data-theme="dark"]` block
    - _Requirements: 1.4, 1.6_

- [x] 2. Create Button primitive and UI directory structure
  - [x] 2.1 Set up `src/components/ui/` directory with barrel export
    - Create `src/components/ui/index.ts` that re-exports Button
    - _Requirements: 2.1, 2.3_

  - [x] 2.2 Implement `Button` component at `src/components/ui/Button/Button.tsx`
    - Define `ButtonAsButton` and `ButtonAsAnchor` discriminated union types
    - Implement polymorphic rendering: `<button type="button">` by default, `<a>` when `href` provided
    - Support `variant` prop (`"icon"` | `"text"`, default `"icon"`)
    - Apply CSS classes: `btn`, `btn--icon`, `btn--text`
    - Forward `aria-label`, `title`, `aria-expanded`, `aria-pressed`, `disabled`, `className`, `onClick`, `children`
    - For `<a>` variant, forward `href`, `target`, `rel`
    - Handle disabled state on `<a>` with `aria-disabled="true"` and `e.preventDefault()`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 4.1, 4.2, 4.3, 4.4_

  - [x] 2.3 Create `src/components/ui/Button/Button.css` with component tokens and styles
    - Define `--btn-height: 28px`, `--btn-border-radius: var(--radius-control)`, `--btn-padding-x: var(--space-3)`, `--btn-font-size: var(--font-size-sm)`
    - Style `.btn` base (border, background, color, cursor, transition using semantic tokens)
    - Style `.btn--icon` (equal width/height from `--btn-height`, centered content)
    - Style `.btn--text` (height from `--btn-height`, horizontal padding from `--btn-padding-x`)
    - Style `:hover`, `:focus-visible`, `:active`, `:disabled` / `[aria-disabled="true"]` states
    - Derive styles from current ThemeToggle CSS, replacing hardcoded values with tokens
    - _Requirements: 2.4, 3.3, 3.4, 3.5, 3.11, 3.12_

  - [x] 2.4 Write unit tests for Button primitive at `src/components/ui/Button/Button.test.tsx`
    - Test default render produces `<button type="button">` (Req 12.1)
    - Test `"icon"` variant applies `btn--icon` class (Req 12.2)
    - Test `"text"` variant applies `btn--text` class (Req 12.3)
    - Test `aria-label`, `title`, `aria-expanded`, `aria-pressed`, `disabled` forwarding (Req 12.4)
    - Test `href` renders `<a>` element (Req 12.5)
    - Test `onClick` fires on click (Req 12.6)
    - Test `disabled` prevents `onClick` (Req 12.7)
    - Test `className` merges with internal classes
    - Test children are rendered
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [x] 2.5 Write property test: Element type determined by href
    - **Property 1: Element type determined by href**
    - Generate random props with/without `href`; assert `<a>` when href present, `<button type="button">` when absent
    - Use `fast-check` with `{ numRuns: 100 }`
    - File: `src/components/ui/Button/Button.property.test.tsx`
    - **Validates: Requirements 3.1, 4.1**

  - [x] 2.6 Write property test: Variant determines CSS class
    - **Property 2: Variant determines CSS class**
    - Generate random variant from `["icon", "text", undefined]` with/without `href`; assert correct `btn--icon`/`btn--text` class and `btn` always present
    - Use `fast-check` with `{ numRuns: 100 }`
    - File: `src/components/ui/Button/Button.property.test.tsx`
    - **Validates: Requirements 3.2, 3.3, 3.4, 4.3**

  - [x] 2.7 Write property test: Attribute forwarding preserves all props
    - **Property 3: Attribute forwarding preserves all props**
    - Generate random combinations of `aria-label`, `title`, `aria-expanded`, `aria-pressed`, `disabled`, `className`; assert each appears on DOM element with exact value
    - Use `fast-check` with `{ numRuns: 100 }`
    - File: `src/components/ui/Button/Button.property.test.tsx`
    - **Validates: Requirements 3.6, 3.7, 3.9, 12.4**

  - [x] 2.8 Write property test: Anchor-specific attributes forwarded
    - **Property 4: Anchor-specific attributes forwarded**
    - Generate random `href`, `target`, `rel` strings; assert all forwarded to rendered `<a>` element
    - Use `fast-check` with `{ numRuns: 100 }`
    - File: `src/components/ui/Button/Button.property.test.tsx`
    - **Validates: Requirements 4.2**

- [x] 3. Checkpoint - Verify token architecture and Button primitive
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Migrate header controls to Button primitive
  - [x] 4.1 Migrate ThemeToggle to use Button primitive
    - Import `Button` from `../ui` in `ThemeToggle.tsx`
    - Replace `<button className="theme-toggle">` with `<Button variant="icon">`
    - Pass `aria-label` and `title` through to Button
    - Retain Sun/Moon icon-switching behavior
    - Remove duplicated button styles from `ThemeToggle.css` (keep only ThemeToggle-specific styles if any)
    - Update or create `ThemeToggle.test.tsx` to verify `btn` and `btn--icon` classes, `aria-label`, `title`, and icon switching
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Migrate Reset Layout button in App.tsx to use Button primitive
    - Import `Button` from `./components/ui` in `App.tsx`
    - Replace `<button className="reset-layout-btn">` with `<Button variant="icon">`
    - Pass `aria-label` and `title` through to Button
    - Keep `RotateCcw` icon at size 16
    - Remove `reset-layout-btn` styles from `layout.css` if present
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.3 Migrate WidgetVisibilityMenu toggle to use Button primitive
    - Import `Button` from `../ui` in `WidgetVisibilityMenu.tsx`
    - Replace `<button className="widget-visibility-menu__toggle">` with `<Button variant="text">`
    - Pass `aria-label`, `aria-expanded`, and `title` through to Button
    - Retain dropdown menu behavior and positioning
    - Remove duplicated toggle button styles from `WidgetVisibilityMenu.css`
    - Update `WidgetVisibilityMenu.test.tsx` to verify `btn` and `btn--text` classes, `aria-expanded` forwarding, and dropdown behavior
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 4.4 Normalize Language Selector styling
    - Update the `<select>` element's CSS (in `layout.css` or a co-located file) to use `--btn-height` for height, `--btn-border-radius` for border-radius, and `--color-border-default` / `--color-border-hover` for borders
    - Keep it as a native `<select>` element
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 4.5 Convert GitHub link to Button primitive
    - Replace the raw `<a>` in App.tsx with `<Button variant="icon" href="https://github.com/pemre/burkut">`
    - Forward `target="_blank"`, `rel="noreferrer"`, `aria-label="GitHub"`, `title="GitHub"`
    - Remove inline `style={{ lineHeight: 1 }}`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 5. Checkpoint - Verify all header control migrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create guidelines document and update steering docs
  - [x] 6.1 Create `src/components/ui/GUIDELINES.md`
    - Document three-tier token architecture (core, semantic, component) with naming conventions and examples
    - Document Button primitive API: all props, variants, usage examples for icon buttons, text buttons, and link-styled buttons
    - List all component tokens with purpose and default values
    - Describe rules for adding a new UI primitive (file structure, token naming, testing, barrel export)
    - Include "Patterns and Anti-Patterns" section with do/don't examples
    - Structure with clear headings and code blocks for AI parseability
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 6.2 Update steering docs and README
    - Update `README.md` to reference the design system guidelines document
    - Update `.kiro/steering/structure.md` to include `src/components/ui/` directory and its conventions
    - Update `.kiro/steering/tech.md` or create design system section in steering docs with token naming rules
    - Instruct AI agents to use UI primitives from `src/components/ui/` for new interactive elements
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Token migration uses aliases to preserve backward compatibility — no existing component CSS needs to change in Phase 1
