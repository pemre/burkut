# Implementation Plan: react-grid-layout-widgets

## Overview

Replace `react-resizable-panels` with `react-grid-layout` v2, transforming the four application panels into draggable, resizable widgets on a responsive 12-column grid. Implementation proceeds bottom-up: install dependencies, create shared config/types, build core hooks and components, wire into App.tsx, then clean up the old library.

## Tasks

- [x] 1. Install dependencies and import CSS
  - [x] 1.1 Install `react-grid-layout` v2 and its types, remove `react-resizable-panels` from `package.json`
    - Run `npm install react-grid-layout@2` and `npm uninstall react-resizable-panels`
    - Import `react-grid-layout/css/styles.css` and `react-resizable/css/styles.css` in `src/main.tsx`
    - _Requirements: 7.2, 9.1_

- [x] 2. Create Widget Registry and default layouts
  - [x] 2.1 Create `src/components/WidgetGrid/widgetRegistry.ts` with `WIDGET_REGISTRY` array
    - Define each widget type with `id`, `titleKey` (i18n), and default layout positions per breakpoint
    - Export `WIDGET_IDS` constant object and `WidgetRegistryEntry` type
    - _Requirements: 14.1, 14.4_
  - [x] 2.2 Create `src/components/WidgetGrid/defaultLayouts.ts` with `DEFAULT_LAYOUTS`
    - Define layouts for all five breakpoints (lg, md, sm, xs, xxs) as specified in the design
    - lg: sidebar w=3, content w=5, map w=4, timeline w=12 full-width below
    - sm/xs/xxs: stack widgets vertically
    - All items have minW=2, minH=2
    - _Requirements: 5.1, 5.2, 3.2_
  - [x] 2.3 Write property test for minimum widget size invariant
    - **Property 2: Minimum widget size invariant**
    - Verify all items in DEFAULT_LAYOUTS across all breakpoints satisfy `w >= minW >= 2` and `h >= minH >= 2`
    - **Validates: Requirements 3.2**

- [x] 3. Implement `useLayoutPersistence` hook
  - [x] 3.1 Create `src/hooks/useLayoutPersistence.ts`
    - Read/write layouts from localStorage key `"burkut-widget-layouts"`
    - Read/write visibility state from localStorage key `"burkut-widget-visibility"`
    - Validate persisted data schema (JSON parse, required fields, known widget IDs, min sizes)
    - Fall back to `DEFAULT_LAYOUTS` and all-visible on invalid/missing data
    - Wrap all localStorage access in try/catch
    - Implement `onLayoutChange`, `setWidgetVisible`, and `resetLayout`
    - `resetLayout` clears both localStorage keys and resets state to defaults
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.1, 13.1, 13.2, 13.3, 13.4, 13.5_
  - [x] 3.2 Write property test for layout persistence round trip
    - **Property 1: Layout persistence round trip**
    - Generate random valid Layouts, save via `onLayoutChange`, re-initialize hook, assert equivalence
    - **Validates: Requirements 4.1, 4.2**
  - [x] 3.3 Write property test for corrupted data fallback
    - **Property 3: Corrupted data fallback**
    - Generate arbitrary invalid strings in localStorage, initialize hook, assert DEFAULT_LAYOUTS returned
    - **Validates: Requirements 4.4**
  - [x] 3.4 Write property test for reset restores default layout
    - **Property 4: Reset restores default layout**
    - Persist random valid layouts, call `resetLayout`, assert localStorage cleared and state equals DEFAULT_LAYOUTS
    - **Validates: Requirements 10.1**
  - [x] 3.5 Write unit tests for `useLayoutPersistence`
    - Test: returns DEFAULT_LAYOUTS when localStorage is empty
    - Test: returns DEFAULT_LAYOUTS when localStorage throws on getItem
    - Test: persists layout on onLayoutChange call
    - Test: resetLayout clears localStorage keys
    - Test: visibility state defaults to all-visible when missing
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.1, 13.3, 13.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement `WidgetHeader` component
  - [x] 5.1 Create `src/components/WidgetHeader/WidgetHeader.tsx` and `WidgetHeader.css`
    - Render translated title via `useTranslation` and `titleKey` prop
    - Apply `.widget-header` CSS class for drag handle targeting
    - Show `cursor: grab` on hover when `config.features.draggableLayout` is `true`
    - Render without drag affordances when feature flag is `false`
    - Render close button (`X` icon from lucide-react) on the right when `onClose` is provided and feature flag is `true`
    - Close button: `<button type="button">` with i18n `aria-label` (`"widget.close"`), `onMouseDown` stopPropagation to prevent drag
    - Hide close button when feature flag is `false`
    - Render optional `children` for action buttons (e.g. timeline group toggles)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 11.1, 11.4, 11.5_
  - [x] 5.2 Write unit tests for `WidgetHeader`
    - Test: renders translated title text
    - Test: has `.widget-header` CSS class
    - Test: shows grab cursor class when draggableLayout is true
    - Test: omits grab cursor class when draggableLayout is false
    - Test: renders close button when onClose provided and flag is true
    - Test: hides close button when flag is false
    - Test: renders children (action buttons) when provided
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 11.1, 11.4, 11.5_

- [x] 6. Implement `WidgetVisibilityMenu` component
  - [x] 6.1 Create `src/components/WidgetVisibilityMenu/WidgetVisibilityMenu.tsx` and `WidgetVisibilityMenu.css`
    - Render a dropdown toggle button in the app header
    - When open, display a checkbox for each widget type from `WIDGET_REGISTRY`
    - Checked state reflects `visibilityState` from `useLayoutPersistence`
    - Checking/unchecking calls `setWidgetVisible` to show/hide widgets
    - Label each checkbox with i18n-translated widget title
    - Use i18n keys for the menu label/toggle control
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_
  - [x] 6.2 Write unit tests for `WidgetVisibilityMenu`
    - Test: renders a checkbox for each widget in WIDGET_REGISTRY
    - Test: checked state matches visibility state
    - Test: toggling checkbox calls setWidgetVisible
    - Test: labels use i18n translation keys
    - _Requirements: 12.2, 12.3, 12.4, 12.7_

- [x] 7. Implement `WidgetGrid` component
  - [x] 7.1 Create `src/components/WidgetGrid/WidgetGrid.tsx` and `WidgetGrid.css`
    - Use `useContainerWidth` from react-grid-layout v2 for width measurement
    - Render `Responsive` component with breakpoint/column config (lg:12, md:10, sm:6, xs:4, xxs:2)
    - Use `verticalCompactor` as compaction strategy
    - Set `dragConfig.handle` to `.widget-header`
    - Consume `useLayoutPersistence` for layouts, visibility, and onLayoutChange
    - Filter rendered children by `visibilityState` — only visible widgets in the grid
    - Derive layout arrays per breakpoint by filtering out hidden widget IDs
    - Set `static: true` on all items when `config.features.draggableLayout` is `false`
    - Disable drag and resize when feature flag is false
    - Render each widget wrapped in a keyed div with `WidgetHeader` as drag handle
    - Map widget IDs to their React components (Sidebar, ContentPanel, MapPanel, TimelinePanel)
    - Pass `onClose` to each `WidgetHeader` calling `setWidgetVisible(id, false)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 3.3, 11.2, 11.3_
  - [x] 7.2 Write unit tests for `WidgetGrid`
    - Test: renders all four widget panels when all visible
    - Test: passes correct breakpoint configuration to Responsive
    - Test: sets static=true on all items when draggableLayout is false
    - Test: sets dragConfig.handle to `.widget-header`
    - Test: hides widgets when visibilityState marks them hidden
    - _Requirements: 1.1, 1.4, 1.5, 2.2, 11.2_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Wire `WidgetGrid` into `App.tsx` and add header controls
  - [x] 9.1 Refactor `App.tsx` to replace `react-resizable-panels` layout with `WidgetGrid`
    - Remove all imports from `react-resizable-panels` (`Group`, `Panel`, `Separator`, `useDefaultLayout`)
    - Remove `PanelHeader` imports and usage
    - Remove panel refs (`sidebarPanelRef`, `mapPanelRef`, `timelinePanelRef`)
    - Remove collapse state (`sidebarCollapsed`, `mapCollapsed`, `timelineCollapsed`) and toggle callbacks
    - Remove `rootLayout`, `mainLayout`, `topLayout` persistence hooks
    - Remove resize handler callbacks (`handleSidebarResize`, `handleMapResize`, `handleTimelineResize`)
    - Replace the nested `Group > Panel > Separator` tree in `app-body` with a single `<WidgetGrid>` component
    - Pass existing props (index, selectedId, activeGroup, handlers, etc.) through to child widgets inside WidgetGrid
    - _Requirements: 1.1, 7.1_
  - [x] 9.2 Add reset layout button and `WidgetVisibilityMenu` to the app header
    - Add reset layout button (RotateCcw icon) visible only when `config.features.draggableLayout` is `true`
    - Button calls `resetLayout()` from `useLayoutPersistence`
    - Button uses i18n key `"layout.reset"` for aria-label and title
    - Add `<WidgetVisibilityMenu>` to header, hidden when feature flag is `false`
    - _Requirements: 10.1, 10.2, 10.3, 12.1, 12.9_
  - [x] 9.3 Write unit tests for App header controls
    - Test: reset button visible when draggableLayout is true
    - Test: reset button hidden when draggableLayout is false
    - Test: reset button uses i18n translation key
    - Test: WidgetVisibilityMenu visible when draggableLayout is true
    - Test: WidgetVisibilityMenu hidden when draggableLayout is false
    - _Requirements: 10.2, 10.3, 12.1, 12.9_

- [x] 10. Add i18n keys and update CSS
  - [x] 10.1 Add new i18n keys to all locale files (`tr.json`, `en.json`, `zh.json`)
    - Add `"layout.reset"` key for the reset button
    - Add `"widget.close"` key for the close button aria-label
    - Add any keys needed for `WidgetVisibilityMenu` label
    - _Requirements: 6.1, 10.3, 11.4, 12.8_
  - [x] 10.2 Update CSS files
    - Create `src/components/WidgetGrid/WidgetGrid.css` with grid container styles using CSS custom properties for theming
    - Create `src/components/WidgetHeader/WidgetHeader.css` with drag handle styles, grab cursor, close button
    - Create `src/components/WidgetVisibilityMenu/WidgetVisibilityMenu.css` with dropdown styles
    - Remove old resize handle CSS rules (`.resize-handle`, `.resize-handle--horizontal`, `.resize-handle--vertical`, `.resize-handle__indicator`) from `src/styles/layout.css`
    - Use CSS custom properties from `global.css` for widget backgrounds, borders, shadows
    - _Requirements: 7.3, 9.2, 9.3_

- [x] 11. Clean up old `react-resizable-panels` artifacts
  - [x] 11.1 Remove `PanelHeader` component
    - Delete `src/components/PanelHeader/PanelHeader.tsx`, `PanelHeader.css`, and `PanelHeader.test.tsx`
    - Remove any remaining imports of `PanelHeader` across the codebase
    - _Requirements: 7.1_
  - [x] 11.2 Clean up obsolete localStorage keys
    - On first load, remove legacy keys `"layout-root"`, `"layout-main"`, `"layout-top"` from localStorage (can be done in `useLayoutPersistence` or App.tsx)
    - _Requirements: 7.1_

- [x] 12. Verify child component resize handling
  - [x] 12.1 Verify MapPanel and TimelinePanel resize behavior
    - Confirm `useResizeObserver` in MapPanel still triggers `invalidateSize()` when widget is resized via react-grid-layout
    - Confirm `useResizeObserver` in TimelinePanel still triggers `redraw()` when widget is resized
    - Existing debounce (100ms) handles continuous drag-resize operations
    - Run existing MapPanel and TimelinePanel tests to verify they still pass
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 13. Final checkpoint - Ensure all tests pass and build succeeds
  - Run `npm test` to ensure all tests pass
  - Run `npx tsc --noEmit` to ensure zero type errors
  - Run `npx biome check src` to ensure zero lint diagnostics
  - Run `npm run build` to ensure production build succeeds
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The design uses TypeScript throughout, matching the project's tech stack
- Existing `useResizeObserver` hook should work without modification since react-grid-layout changes DOM dimensions directly
