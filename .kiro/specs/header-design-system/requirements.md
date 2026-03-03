# Requirements Document

## Introduction

Bürküt currently has no formal design system. Interactive elements across the app (ThemeToggle, Reset Layout button, Widget Visibility toggle, Language selector, GitHub link, timeline group toggles, panel headers) each use ad-hoc, inconsistent styling with hardcoded values. As the app grows, this leads to visual drift, duplicated CSS, and difficulty for both human developers and AI agents to maintain consistency.

This specification defines a scalable design system foundation for the entire Bürküt application. The system encompasses design tokens following the W3C Design Tokens Community Group (DTCG) conceptual model, a `src/components/ui/` directory for reusable UI primitives, machine-readable guidelines for AI-assisted development, and a clear architecture for future extensibility.

The header control normalization serves as Phase 1 — the first concrete deliverable that proves out the design system by migrating all header controls to use the new Button primitive and shared tokens.

## Glossary

- **Design_System**: The complete collection of design tokens, UI primitives, documentation, and guidelines that ensure visual and behavioral consistency across the Bürküt application.
- **Design_Token**: A CSS custom property that stores a design decision as a named value, organized into three tiers: core, semantic, and component. Follows the conceptual model of the W3C Design Tokens Community Group (DTCG) specification.
- **Core_Token**: A Design_Token that holds a raw, context-free value (e.g., `--color-amber-500: #f29b17`). Core_Tokens form the lowest tier and are never used directly by components.
- **Semantic_Token**: A Design_Token that references a Core_Token and assigns contextual meaning (e.g., `--color-primary: var(--color-amber-500)`). Semantic_Tokens are the primary tokens consumed by components.
- **Component_Token**: A Design_Token scoped to a specific UI primitive (e.g., `--btn-height`, `--btn-border-radius`). Component_Tokens reference Semantic_Tokens or Core_Tokens and are defined alongside the component that uses them.
- **UI_Primitive**: A low-level, reusable React component in `src/components/ui/` that implements a single UI building block (e.g., Button). Each UI_Primitive has co-located `.tsx`, `.css`, and `.test.tsx` files.
- **Button_Primitive**: The first UI_Primitive — a reusable React component at `src/components/ui/Button/Button.tsx` that encapsulates shared visual and behavioral patterns for clickable controls.
- **Icon_Button**: A Button_Primitive variant that displays only an icon with no visible text label, requiring an accessible `aria-label`.
- **Text_Button**: A Button_Primitive variant that displays a text label, optionally with a leading or trailing icon.
- **Header_Bar**: The top-level `<header>` element in App.tsx containing the app logo, title, and all header controls.
- **Header_Control**: Any interactive element in the Header_Bar (buttons, selects, links).
- **Guidelines_Doc**: A machine-readable markdown document that describes design system conventions, component APIs, token naming rules, and patterns/anti-patterns for use by both human developers and AI agents.
- **ThemeToggle**: The existing button component that switches between dark and light themes.
- **Widget_Visibility_Toggle**: The button in the Header_Bar that opens the widget visibility dropdown menu.
- **Reset_Button**: The button in the Header_Bar that resets the widget grid layout to defaults.
- **GitHub_Link**: The anchor element in the Header_Bar that links to the project repository.
- **Language_Selector**: The `<select>` element in the Header_Bar used to switch the application locale.

---

## Requirements

### Requirement 1: Design Token Architecture

**User Story:** As a developer, I want a structured design token system in `global.css` following the DTCG conceptual model, so that all UI values are centralized, themeable, and consistently named.

#### Acceptance Criteria

1. THE Design_System SHALL define Core_Tokens in `src/styles/global.css` under the `:root` selector, using the naming convention `--{category}-{name}-{scale}` (e.g., `--color-amber-500`, `--space-2`, `--radius-md`).
2. THE Design_System SHALL define Semantic_Tokens in `src/styles/global.css` that reference Core_Tokens, using the naming convention `--{category}-{context}` (e.g., `--color-primary`, `--color-border-default`, `--color-bg-surface`).
3. THE Design_System SHALL define both light and dark theme values for all Semantic_Tokens, with light values under `:root` and dark values under `[data-theme="dark"]`.
4. THE Design_System SHALL migrate all existing ad-hoc CSS custom properties in `global.css` to the three-tier token structure while preserving current visual appearance.
5. THE Design_System SHALL define Core_Tokens for the following categories at minimum: color, spacing, border-radius, font-size, and transition duration.
6. WHEN a new Core_Token value is needed, THE developer SHALL add the Core_Token to the appropriate category section in `global.css` before referencing the Core_Token from a Semantic_Token or Component_Token.

### Requirement 2: UI Primitive Directory Structure

**User Story:** As a developer, I want a dedicated `src/components/ui/` directory for all design system primitives, so that building blocks are clearly separated from feature components and easy to discover.

#### Acceptance Criteria

1. THE Design_System SHALL establish a `src/components/ui/` directory for all UI_Primitives.
2. WHEN a new UI_Primitive is created, THE UI_Primitive SHALL be placed in `src/components/ui/{Name}/` with co-located `{Name}.tsx`, `{Name}.css`, and `{Name}.test.tsx` files.
3. THE `src/components/ui/` directory SHALL contain an `index.ts` barrel file that re-exports all UI_Primitives for convenient importing.
4. WHEN a UI_Primitive defines Component_Tokens, THE Component_Tokens SHALL be declared in the UI_Primitive's co-located `.css` file using the naming convention `--{component}-{property}` (e.g., `--btn-height`, `--btn-border-radius`).
5. THE Design_System SHALL keep feature-level components (e.g., ThemeToggle, WidgetVisibilityMenu) in their existing `src/components/{Name}/` directories, consuming UI_Primitives from `src/components/ui/`.

### Requirement 3: Button Primitive

**User Story:** As a developer, I want a reusable Button primitive derived from the ThemeToggle styling, so that all clickable controls share a consistent look and behavior without duplicating CSS.

#### Acceptance Criteria

1. THE Button_Primitive SHALL render a `<button>` element with `type="button"` by default.
2. THE Button_Primitive SHALL accept a `variant` prop with values `"icon"` and `"text"`, defaulting to `"icon"`.
3. WHEN the `variant` prop is `"icon"`, THE Button_Primitive SHALL render as an Icon_Button with equal width and height matching the Component_Token `--btn-height`.
4. WHEN the `variant` prop is `"text"`, THE Button_Primitive SHALL render as a Text_Button with height matching the Component_Token `--btn-height` and horizontal padding defined by the Component_Token `--btn-padding-x`.
5. THE Button_Primitive SHALL apply border, border-radius, background, color, and hover styles derived from the current ThemeToggle styling, using Semantic_Tokens and Component_Tokens instead of hardcoded values.
6. THE Button_Primitive SHALL accept an optional `aria-label` prop and forward the prop to the rendered `<button>` element.
7. THE Button_Primitive SHALL accept a `title` prop and forward the prop to the rendered `<button>` element.
8. THE Button_Primitive SHALL accept `children` for rendering icon and text content.
9. THE Button_Primitive SHALL accept and forward standard HTML button attributes (`onClick`, `disabled`, `aria-expanded`, `aria-pressed`, `className`).
10. THE Button_Primitive SHALL be located at `src/components/ui/Button/Button.tsx` with co-located `Button.css` and `Button.test.tsx` files.
11. THE Button_Primitive SHALL define its Component_Tokens (`--btn-height`, `--btn-border-radius`, `--btn-padding-x`, `--btn-font-size`) in `Button.css`, referencing Semantic_Tokens for their default values.
12. WHEN the `disabled` attribute is set, THE Button_Primitive SHALL reduce opacity and set `cursor: not-allowed`.

### Requirement 4: Button Primitive Polymorphism

**User Story:** As a developer, I want the Button primitive to render as an `<a>` element when given an `href` prop, so that link-styled buttons (like the GitHub link) use the same component without duplicating styles.

#### Acceptance Criteria

1. WHEN an `href` prop is provided, THE Button_Primitive SHALL render an `<a>` element instead of a `<button>` element.
2. WHEN rendering as an `<a>` element, THE Button_Primitive SHALL forward `href`, `target`, and `rel` attributes to the rendered element.
3. WHEN rendering as an `<a>` element, THE Button_Primitive SHALL apply the same visual styles as the `<button>` variant.
4. THE Button_Primitive SHALL use TypeScript discriminated union types or conditional types to ensure type safety between button and anchor prop sets.

### Requirement 5: Migrate ThemeToggle to Button Primitive

**User Story:** As a developer, I want the ThemeToggle to use the new Button primitive internally, so that the ThemeToggle stays consistent with the design system and reduces duplicated styling.

#### Acceptance Criteria

1. THE ThemeToggle SHALL render using the Button_Primitive with variant `"icon"`.
2. THE ThemeToggle SHALL pass `aria-label` and `title` props through to the Button_Primitive.
3. THE ThemeToggle SHALL retain the current icon-switching behavior (Sun icon in dark mode, Moon icon in light mode).
4. WHEN the ThemeToggle is rendered, THE ThemeToggle SHALL be visually identical to the current appearance.

### Requirement 6: Migrate Reset Button to Button Primitive

**User Story:** As a developer, I want the Reset Layout button to use the new Button primitive, so that the Reset Layout button matches the ThemeToggle in size and style.

#### Acceptance Criteria

1. THE Reset_Button SHALL render using the Button_Primitive with variant `"icon"`.
2. THE Reset_Button SHALL pass `aria-label` and `title` props through to the Button_Primitive.
3. THE Reset_Button SHALL display the RotateCcw icon at the same size as the ThemeToggle icon.
4. WHEN the Reset_Button is rendered, THE Reset_Button SHALL have the same height, border, border-radius, and hover behavior as the ThemeToggle.

### Requirement 7: Normalize Widget Visibility Toggle

**User Story:** As a developer, I want the Widget Visibility toggle button to match the height and style of other header buttons, so that the header looks visually consistent.

#### Acceptance Criteria

1. THE Widget_Visibility_Toggle SHALL render using the Button_Primitive with variant `"text"`.
2. THE Widget_Visibility_Toggle SHALL have the same height as the ThemeToggle and Reset_Button, using the `--btn-height` Component_Token.
3. THE Widget_Visibility_Toggle SHALL pass `aria-label`, `aria-expanded`, and `title` props through to the Button_Primitive.
4. THE Widget_Visibility_Toggle SHALL retain the current dropdown menu behavior and positioning.

### Requirement 8: Normalize Language Selector

**User Story:** As a developer, I want the Language selector to match the height and border radius of the header buttons, so that all header controls are visually aligned.

#### Acceptance Criteria

1. THE Language_Selector SHALL have the same height as the Button_Primitive, using the `--btn-height` Component_Token.
2. THE Language_Selector SHALL use the `--btn-border-radius` Component_Token for border radius.
3. THE Language_Selector SHALL use the same border color and hover border color as the Button_Primitive.
4. THE Language_Selector SHALL remain a native `<select>` element for accessibility and platform-native behavior.

### Requirement 9: Convert GitHub Link to Button Primitive

**User Story:** As a developer, I want the GitHub link to use the Button primitive with an `href` prop, so that the GitHub link matches the other header controls visually while remaining a navigational link.

#### Acceptance Criteria

1. THE GitHub_Link SHALL render using the Button_Primitive with variant `"icon"` and an `href` prop.
2. THE GitHub_Link SHALL have the same height, border, border-radius, background, and hover styles as the Icon_Button.
3. THE GitHub_Link SHALL retain `target="_blank"` and `rel="noreferrer"` attributes.
4. THE GitHub_Link SHALL retain the `aria-label` of "GitHub" and the `title` of "GitHub".

### Requirement 10: Design System Guidelines Document

**User Story:** As a developer or AI agent, I want a machine-readable guidelines document for the design system, so that future development maintains visual consistency and AI agents can follow the conventions autonomously.

#### Acceptance Criteria

1. THE Design_System SHALL include a guidelines document at `src/components/ui/GUIDELINES.md`.
2. THE Guidelines_Doc SHALL describe the three-tier token architecture (core, semantic, component) with naming conventions and examples.
3. THE Guidelines_Doc SHALL describe the Button_Primitive API including all props, variants, and usage examples for icon buttons, text buttons, and link-styled buttons.
4. THE Guidelines_Doc SHALL list all Component_Tokens defined by each UI_Primitive with their purpose and default values.
5. THE Guidelines_Doc SHALL describe the rules for adding a new UI_Primitive to `src/components/ui/`, including file structure, token naming, testing, and barrel export requirements.
6. THE Guidelines_Doc SHALL include a "Patterns and Anti-Patterns" section with concrete do/don't examples for common scenarios (e.g., "DO use Button with `href` for icon links; DON'T style raw `<a>` tags to look like buttons").
7. THE Guidelines_Doc SHALL be structured with clear headings and code blocks so that AI agents can parse and follow the conventions without ambiguity.

### Requirement 11: Steering Documentation and README Updates

**User Story:** As a developer, I want the project steering docs and README updated to reference the design system, so that all contributors and AI agents are aware of the conventions.

#### Acceptance Criteria

1. WHEN the Design_System is complete, THE project README.md SHALL be updated to reference the design system guidelines document.
2. WHEN the Design_System is complete, THE steering docs in `.kiro/steering/` SHALL be updated to include design system conventions, the `src/components/ui/` directory structure, and token naming rules.
3. THE steering documentation SHALL instruct AI agents to use UI_Primitives from `src/components/ui/` when building new interactive elements instead of creating ad-hoc styled elements.

### Requirement 12: Button Primitive Test Coverage

**User Story:** As a developer, I want comprehensive tests for the Button primitive, so that regressions are caught early and the component contract is verified.

#### Acceptance Criteria

1. THE Button_Primitive test suite SHALL verify that the default render produces a `<button>` element with `type="button"`.
2. THE Button_Primitive test suite SHALL verify that the `"icon"` variant applies the correct CSS class.
3. THE Button_Primitive test suite SHALL verify that the `"text"` variant applies the correct CSS class.
4. THE Button_Primitive test suite SHALL verify that `aria-label`, `title`, `aria-expanded`, `aria-pressed`, and `disabled` attributes are forwarded to the rendered element.
5. THE Button_Primitive test suite SHALL verify that providing an `href` prop renders an `<a>` element instead of a `<button>` element.
6. THE Button_Primitive test suite SHALL verify that `onClick` handlers fire when the Button_Primitive is clicked.
7. WHEN the `disabled` attribute is set, THE Button_Primitive test suite SHALL verify that `onClick` handlers do not fire.
