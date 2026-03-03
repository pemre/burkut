# Requirements Document

## Introduction

Replace the current `react-resizable-panels` layout system in Bürküt with `react-grid-layout` (v2) to provide a showcase-style widget dashboard. Each panel (Sidebar, ContentPanel, MapPanel, TimelinePanel) becomes a draggable, resizable widget on a 12-column responsive grid with vertical compaction. The feature is gated behind the existing `config.features.draggableLayout` flag.

## Glossary

- **Widget_Grid**: The `react-grid-layout` responsive grid container that hosts all widget panels, configured with 12 columns at the `lg` breakpoint and vertical compaction.
- **Widget**: An individual draggable and resizable grid item representing one of the application panels (Sidebar, Content, Map, Timeline).
- **Layout_State**: A JSON-serializable object describing the position (x, y) and dimensions (w, h) of every Widget on the Widget_Grid.
- **Default_Layout**: The predefined Layout_State used when no persisted layout exists, arranging all four widgets in a usable initial configuration.
- **Breakpoint**: A named screen-width threshold (lg, md, sm, xs, xxs) that determines the number of grid columns and the active Layout_State.
- **Vertical_Compaction**: The compaction strategy where widgets are packed upward to eliminate vertical gaps in the grid.
- **Widget_Header**: A drag handle area at the top of each Widget that allows the user to reposition the Widget by dragging.
- **Layout_Persistence**: The mechanism that saves and restores Layout_State to/from localStorage so the user's arrangement survives page reloads.
- **Widget_Close_Button**: A close control (×) rendered in the Widget_Header that removes the Widget from the Widget_Grid.
- **Widget_Visibility_Menu**: A dropdown menu in the application header that lists all available Widget types with checkboxes to toggle their visibility on the Widget_Grid.
- **Widget_Registry**: A centralized list of all available Widget types (Sidebar, Content, Map, Timeline, and any future types) that the Widget_Visibility_Menu uses to populate its checkbox list.
- **Visibility_State**: A JSON-serializable object mapping each Widget type identifier to a boolean indicating whether the Widget is currently visible on the Widget_Grid.

## Requirements

### Requirement 1: Widget Grid Container

**User Story:** As a user, I want the application panels arranged in a responsive grid, so that I can see all panels organized in a flexible dashboard layout.

#### Acceptance Criteria

1. WHEN the application loads, THE Widget_Grid SHALL render a responsive grid with 12 columns at the lg breakpoint.
2. THE Widget_Grid SHALL use Vertical_Compaction to pack widgets upward and eliminate vertical gaps.
3. WHEN the viewport width changes across Breakpoint thresholds, THE Widget_Grid SHALL rearrange widgets according to the Layout_State defined for each Breakpoint.
4. THE Widget_Grid SHALL define layouts for breakpoints lg, md, sm, xs, and xxs.
5. WHEN `config.features.draggableLayout` is false, THE Widget_Grid SHALL render widgets in a static, non-draggable, non-resizable arrangement.

### Requirement 2: Draggable Widgets

**User Story:** As a user, I want to drag panels to rearrange them, so that I can customize my workspace layout.

#### Acceptance Criteria

1. WHEN the user drags a Widget by its Widget_Header, THE Widget_Grid SHALL reposition the Widget to the drop location and reflow surrounding widgets using Vertical_Compaction.
2. THE Widget_Header SHALL be the only drag handle for each Widget, preventing accidental drags from interactive content areas.
3. WHILE a Widget is being dragged, THE Widget_Grid SHALL display a placeholder indicating the target drop position.

### Requirement 3: Resizable Widgets

**User Story:** As a user, I want to resize panels by dragging their edges, so that I can allocate more space to the content I care about.

#### Acceptance Criteria

1. WHEN the user drags a resize handle on a Widget, THE Widget_Grid SHALL resize the Widget and reflow surrounding widgets using Vertical_Compaction.
2. THE Widget_Grid SHALL enforce a minimum size of 2 columns wide and 2 rows tall for each Widget to prevent widgets from becoming unusable.
3. WHEN a Widget is resized, THE Widget_Grid SHALL trigger a resize event so that child components (MapPanel, TimelinePanel) can recalculate their internal dimensions.

### Requirement 4: Layout Persistence

**User Story:** As a user, I want my custom layout to be remembered, so that I do not have to rearrange panels every time I reload the page.

#### Acceptance Criteria

1. WHEN the user changes the Layout_State by dragging or resizing a Widget, THE Layout_Persistence SHALL save the updated Layout_State to localStorage.
2. WHEN the application loads and a saved Layout_State exists in localStorage, THE Widget_Grid SHALL restore the saved Layout_State.
3. WHEN the application loads and no saved Layout_State exists, THE Widget_Grid SHALL use the Default_Layout.
4. IF localStorage is unavailable or the saved Layout_State is corrupted, THEN THE Widget_Grid SHALL fall back to the Default_Layout without displaying an error to the user.

### Requirement 5: Default Widget Layout

**User Story:** As a user, I want a sensible default arrangement of panels, so that the application is usable on first visit.

#### Acceptance Criteria

1. THE Default_Layout SHALL position the Sidebar widget on the left spanning approximately 3 columns, the Content widget in the center spanning approximately 5 columns, and the Map widget on the right spanning approximately 4 columns, with the Timeline widget spanning the full 12 columns below.
2. THE Default_Layout SHALL provide appropriate layouts for each Breakpoint so that widgets stack vertically on smaller screens.

### Requirement 6: Widget Header with Drag Handle

**User Story:** As a user, I want a clear visual header on each panel that I can grab to move it, so that I know where to drag.

#### Acceptance Criteria

1. THE Widget_Header SHALL display the panel title using the existing i18n translation keys.
2. THE Widget_Header SHALL be styled as a distinct drag handle area using a CSS class designated as the drag handle selector for react-grid-layout.
3. WHEN the user hovers over the Widget_Header, THE Widget_Header SHALL change the cursor to a grab cursor to indicate draggability.
4. WHILE `config.features.draggableLayout` is false, THE Widget_Header SHALL display the panel title without drag affordances.

### Requirement 7: Remove react-resizable-panels Dependency

**User Story:** As a developer, I want to remove the old layout library, so that the codebase does not carry unused dependencies.

#### Acceptance Criteria

1. WHEN the migration is complete, THE Application SHALL have no imports from the `react-resizable-panels` package.
2. WHEN the migration is complete, THE Application SHALL remove `react-resizable-panels` from `package.json` dependencies.
3. THE Application SHALL remove all CSS rules specific to the `react-resizable-panels` resize handles and separators (`.resize-handle`, `.resize-handle--horizontal`, `.resize-handle--vertical`, `.resize-handle__indicator`).

### Requirement 8: Child Component Resize Handling

**User Story:** As a user, I want the map and timeline to redraw correctly when their widget is resized, so that content is not clipped or misaligned.

#### Acceptance Criteria

1. WHEN a Widget containing the MapPanel is resized, THE MapPanel SHALL call `invalidateSize()` on the Leaflet map instance to recalculate its viewport.
2. WHEN a Widget containing the TimelinePanel is resized, THE TimelinePanel SHALL call `redraw()` on the vis-timeline instance to recalculate its layout.
3. THE Application SHALL debounce resize callbacks to avoid excessive recalculations during continuous drag-resize operations.

### Requirement 9: Responsive CSS Integration

**User Story:** As a developer, I want the grid layout styles to integrate with the existing CSS custom properties system, so that theming and dark mode continue to work.

#### Acceptance Criteria

1. THE Application SHALL import the required react-grid-layout and react-resizable CSS stylesheets.
2. THE Widget_Grid SHALL use CSS custom properties from `global.css` for widget backgrounds, borders, and shadows so that dark and light themes apply consistently.
3. THE Widget styling SHALL use plain CSS with custom properties, consistent with the project convention of no CSS-in-JS.

### Requirement 10: Layout Reset

**User Story:** As a user, I want to reset my layout to the default arrangement, so that I can recover from an undesirable configuration.

#### Acceptance Criteria

1. WHEN the user activates the layout reset control, THE Widget_Grid SHALL clear the saved Layout_State from localStorage and restore the Default_Layout.
2. THE Application SHALL provide a reset layout control accessible from the application header.
3. THE reset layout control label SHALL use an i18n translation key for localization.

### Requirement 11: Widget Close Button

**User Story:** As a user, I want to close individual widgets from the grid, so that I can remove panels I do not need and free up screen space.

#### Acceptance Criteria

1. THE Widget_Header SHALL display a Widget_Close_Button on the right side of the header area.
2. WHEN the user activates the Widget_Close_Button, THE Widget_Grid SHALL remove the corresponding Widget from the visible grid and reflow remaining widgets using Vertical_Compaction.
3. WHEN a Widget is removed via the Widget_Close_Button, THE Visibility_State SHALL update the corresponding Widget type to hidden.
4. THE Widget_Close_Button SHALL use an accessible button element with an i18n-translated aria-label indicating the close action.
5. WHILE `config.features.draggableLayout` is false, THE Widget_Header SHALL hide the Widget_Close_Button.

### Requirement 12: Widget Visibility Menu

**User Story:** As a user, I want a dropdown menu in the application header that lists all available widgets with checkboxes, so that I can show or hide widgets at any time.

#### Acceptance Criteria

1. THE Application header SHALL display a Widget_Visibility_Menu control.
2. WHEN the user opens the Widget_Visibility_Menu, THE Widget_Visibility_Menu SHALL display a checkbox for each Widget type in the Widget_Registry.
3. WHEN a Widget is visible on the Widget_Grid, THE Widget_Visibility_Menu SHALL show the corresponding checkbox as checked.
4. WHEN a Widget is hidden from the Widget_Grid, THE Widget_Visibility_Menu SHALL show the corresponding checkbox as unchecked.
5. WHEN the user checks an unchecked Widget checkbox, THE Widget_Grid SHALL add the corresponding Widget back to the grid at a default position and reflow using Vertical_Compaction.
6. WHEN the user unchecks a checked Widget checkbox, THE Widget_Grid SHALL remove the corresponding Widget from the grid and reflow remaining widgets using Vertical_Compaction.
7. THE Widget_Visibility_Menu SHALL label each checkbox with the Widget panel title using existing i18n translation keys.
8. THE Widget_Visibility_Menu label and toggle control SHALL use i18n translation keys for localization.
9. WHILE `config.features.draggableLayout` is false, THE Application header SHALL hide the Widget_Visibility_Menu.

### Requirement 13: Widget Visibility Persistence

**User Story:** As a user, I want my widget visibility choices to be remembered across page reloads, so that hidden widgets stay hidden and visible widgets stay visible.

#### Acceptance Criteria

1. WHEN the Visibility_State changes (via Widget_Close_Button or Widget_Visibility_Menu), THE Layout_Persistence SHALL save the updated Visibility_State to localStorage.
2. WHEN the application loads and a saved Visibility_State exists in localStorage, THE Widget_Grid SHALL restore only the widgets marked as visible.
3. WHEN the application loads and no saved Visibility_State exists, THE Widget_Grid SHALL display all widgets defined in the Widget_Registry as visible.
4. IF localStorage is unavailable or the saved Visibility_State is corrupted, THEN THE Widget_Grid SHALL display all widgets as visible without displaying an error to the user.
5. WHEN the user activates the layout reset control, THE Layout_Persistence SHALL clear the saved Visibility_State and restore all widgets to visible.

### Requirement 14: Widget Registry Extensibility

**User Story:** As a developer, I want a centralized registry of widget types, so that adding a new widget type in the future requires minimal code changes.

#### Acceptance Criteria

1. THE Widget_Registry SHALL define each Widget type with an identifier, a default layout position, and an i18n title key.
2. WHEN a new Widget type is added to the Widget_Registry, THE Widget_Visibility_Menu SHALL automatically include a checkbox for the new Widget type without additional UI code changes.
3. WHEN a new Widget type is added to the Widget_Registry and no saved Visibility_State exists, THE Widget_Grid SHALL display the new Widget type using its default layout position.
4. THE Widget_Registry SHALL be defined in a single configuration source to avoid duplication across components.
