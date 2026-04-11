# Feature Specification: PokeFusions Core

**Feature Branch**: `001-pokefusions-core`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "AI-powered Pokemon fusion generator — see app-idea.md"

## Clarifications

### Session 2026-04-10

- Q: How should the user provide the Hugging Face API token? → A: User enters the token in a settings/config panel in the UI; token is stored in localStorage
- Q: When a user regenerates a fusion, does it replace the current card or create a new one? → A: Regeneration replaces the current card in-place (same parents, new AI content); if already saved, user must re-save to persist the new version
- Q: What is the source and scope of the Pokemon dataset? → A: Bundled static JSON file shipped with the app containing 809 base species (Gens 1–7)
- Q: How should the app handle API rate limiting from the AI service? → A: Show a rate-limit-specific message with cooldown hint and temporarily disable the Generate button
- Q: Should AI-generated images be persisted in localStorage with saved fusions? → A: No; only text data (name, description, stats, metadata) is stored; images are regenerated on demand or shown as placeholders

### Session 2026-04-10 (2)

- Q: What defines type compatibility for random fusion pairing? → A: Pairs are excluded only if both Pokemon share the exact same type combination; all other pairings are valid
- Q: Should AI-generated text be sanitized before rendering? → A: Yes; all AI output must be treated as untrusted and sanitized before DOM insertion to prevent XSS
- Q: How is the Hugging Face model selected? → A: A single configurable model ID with a sensible default; user can change it in the settings panel alongside the API token

### Session 2026-04-11

- Q: How does the Pokemon selector work for manual selection (search/filter behavior)? → A: Users can search by name (text input) and optionally filter by type. The 809-entry grid should use virtualization or lazy loading for performance. No pagination — all results visible as the user scrolls.
- Q: Should fusion images be persisted when saving? → A: Yes; if an AI-generated image exists, it should be stored alongside the fusion text data so it is available when the user revisits their collection. This requires a hosted database since localStorage cannot handle image storage at scale.
- Q: Which hosted database should be used? → A: TBD — the specific database technology is a deferred decision. The architecture should use a lightweight backend API layer that abstracts the DB choice.

## User Scenarios & Testing

### User Story 1 - Generate a Random Fusion (Priority: P1)

A user visits the app and generates a fusion from two randomly selected Pokemon. The app picks a compatible pair, blends their stats, and uses AI to create a unique fusion name and description. The result appears as a fusion card.

**Why this priority**: This is the core value proposition — one-click AI fusion generation. Without this, the app has no purpose.

**Independent Test**: Can be fully tested by clicking "Generate" and verifying a fusion card appears with a blended name, averaged stats, and AI-written description.

**Acceptance Scenarios**:

1. **Given** the user is on the main page, **When** they click "Generate Fusion", **Then** a random compatible pair is selected and a fusion card is displayed with a blended name, averaged stats, and AI-generated description
2. **Given** a fusion is being generated, **When** the AI service is processing, **Then** a loading skeleton card is shown until the result is ready
3. **Given** the required AI service is unavailable, **When** the user clicks "Generate Fusion", **Then** an error message is displayed with a retry button

---

### User Story 2 - Select Two Pokemon Manually (Priority: P2)

A user browses or searches the full Pokemon roster and picks two specific Pokemon to fuse. The app generates the fusion the same way as the random flow, but with user-chosen parents.

**Why this priority**: Manual selection gives users creative control and replay value beyond the random generator.

**Independent Test**: Can be fully tested by selecting two Pokemon from the roster, submitting the pair, and verifying the fusion card output.

**Acceptance Scenarios**:

1. **Given** the user is on the selection page, **When** they pick two Pokemon from the roster, **Then** a fusion card is generated for that pair with a blended name, averaged stats, and AI-generated description
2. **Given** the user selects the same Pokemon twice, **When** they attempt to generate, **Then** the system prevents the fusion and displays a helpful message
3. **Given** the user selects two Pokemon that would be filtered out in random mode, **When** they generate, **Then** the fusion is still created (manual mode allows any pair)

---

### User Story 3 - Save and Manage Fusions (Priority: P3)

A user saves a generated fusion to view later. They can revisit their saved fusions, browse them, and delete ones they no longer want.

**Why this priority**: Persistence gives the app stickiness — users return to review their collection.

**Independent Test**: Can be fully tested by generating a fusion, saving it, closing and reopening the browser, and verifying the fusion is still accessible.

**Acceptance Scenarios**:

1. **Given** a fusion card is displayed, **When** the user clicks "Save", **Then** the fusion is persisted and a success notification appears
2. **Given** the user has saved fusions, **When** they navigate to their collection, **Then** all previously saved fusions are displayed as fusion cards
3. **Given** the user is viewing a saved fusion, **When** they click "Delete", **Then** the fusion is removed and a confirmation notification appears
4. **Given** the user has saved fusions, **When** they close and reopen the browser, **Then** all saved fusions are still available

---

### User Story 4 - View AI-Generated Fusion Image (Priority: P4)

When a local image generation service is available, the fusion card includes an AI-generated Pokemon-style image. When the service is not available, a placeholder image is shown instead.

**Why this priority**: Images enhance the fusion concept visually but are not required for the core experience.

**Independent Test**: Can be tested by generating a fusion with and without the image generation service running, verifying the image or placeholder appears correctly.

**Acceptance Scenarios**:

1. **Given** the local image generation service is running, **When** a fusion is generated, **Then** a Pokemon-style AI-generated image appears on the fusion card
2. **Given** the local image generation service is not available, **When** a fusion is generated, **Then** the Pokemon logo is displayed as a placeholder on the fusion card
3. **Given** the image service becomes unavailable mid-session, **When** the user generates a new fusion, **Then** the fusion is still created with a placeholder image and no error interrupts the experience

---

### User Story 5 - Regenerate a Fusion (Priority: P5)

A user viewing a fusion card can regenerate it to get a new AI-generated name and description for the same Pokemon pair.

**Why this priority**: Regeneration adds replay value without requiring users to re-select or re-randomize the pair.

**Independent Test**: Can be tested by generating a fusion, clicking "Regenerate", and verifying the name and description change while the parent Pokemon remain the same.

**Acceptance Scenarios**:

1. **Given** a fusion card is displayed, **When** the user clicks "Regenerate", **Then** the current card is updated in-place with a new name and description for the same parent pair
2. **Given** a regeneration is in progress, **When** the AI service is processing, **Then** a loading state is shown on the card
3. **Given** a previously saved fusion is regenerated, **When** the new content appears, **Then** the user must explicitly re-save to persist the updated version

---

### User Story 6 - Polished Responsive Experience (Priority: P6)

The app provides a polished experience across mobile and desktop with dark mode support, smooth animations, and clear feedback for all states (loading, error, empty, success).

**Why this priority**: UX polish demonstrates engineering quality but is not required for core functionality.

**Independent Test**: Can be tested by using the app on different screen sizes, toggling dark mode, and verifying all states render correctly with appropriate feedback.

**Acceptance Scenarios**:

1. **Given** the user is on a mobile device, **When** they use the app, **Then** the layout adapts to their screen size with all features accessible
2. **Given** the user toggles dark mode, **When** the theme switches, **Then** all UI elements update consistently with smooth transitions
3. **Given** an error occurs during any operation, **When** the error is displayed, **Then** a toast notification appears and auto-dismisses after a brief period
4. **Given** the user has no saved fusions, **When** they navigate to their collection, **Then** an empty state with guidance is shown

### Edge Cases

- What happens when the required AI service fails during fusion generation? → Error message with retry button; no partial fusion displayed
- What happens when the user's browser storage is full? → N/A — fusion data is stored in a hosted database, not localStorage
- What happens when the database is unavailable? → Show error with retry button; retain the current fusion in memory so the user can retry saving without regenerating
- What happens when the AI returns an empty or malformed response? → Retry the request once automatically; if still failing, show error with manual retry option
- What happens when the user selects the same Pokemon for both parent slots? → Prevent the fusion and display a message asking them to choose two different Pokemon
- What happens when the optional flavor text service is unavailable? → Skip flavor text enrichment silently; fusion generation continues without it
- What happens when the user attempts to save a duplicate fusion (same parent pair)? → Allow saving; each generation is unique due to AI-generated content
- What happens when the AI service rate-limits requests? → Show a rate-limit-specific message with a cooldown hint and temporarily disable the Generate button until the cooldown expires
- What happens when the user has not configured an API token? → Show a first-run prompt directing the user to the settings panel to enter their Hugging Face token before generation is available

## Requirements

### Functional Requirements

- **FR-001**: System MUST generate a fusion from two randomly selected compatible Pokemon with a single user action
- **FR-002**: System MUST apply a type-compatibility check when randomly selecting Pokemon pairs — pairs are excluded only if both Pokemon share the exact same type combination
- **FR-003**: System MUST allow users to manually select any two different Pokemon for fusion, bypassing the type-compatibility filter
- **FR-004**: System MUST generate a blended fusion name from the two parent Pokemon names using AI
- **FR-005**: System MUST generate unique descriptive text for each fusion using AI
- **FR-006**: System MUST calculate fusion stats by averaging each of the six stat types from both parents, rounded to whole numbers
- **FR-007**: System MUST display fusion results as a card showing: fusion name, parent names with type badges, all six stats with color-coded indicators (green for values ≥100, yellow for values ≥50, red for values <50), AI-written description, and creation timestamp
- **FR-008**: System MUST allow users to save generated fusions for later viewing
- **FR-009**: System MUST persist saved fusions (including AI-generated images when available) to a hosted database, accessible across browser sessions without requiring user accounts
- **FR-010**: System MUST allow users to delete saved fusions
- **FR-011**: System MUST allow users to regenerate a fusion (new AI name and description) for the same parent pair
- **FR-012**: System MUST display a Pokemon logo placeholder when AI image generation is unavailable
- **FR-013**: System MUST display AI-generated Pokemon-style images on fusion cards when the local image service is available
- **FR-014**: System MUST show loading skeleton cards while fusions are being generated
- **FR-015**: System MUST show toast notifications for success, error, and informational events with 3-second auto-dismiss behavior
- **FR-016**: System MUST show an error state with a retry button when the required AI service fails
- **FR-017**: System MUST support dark mode
- **FR-018**: System MUST provide a responsive layout that works across mobile and desktop viewports
- **FR-019**: System MUST include smooth animations and transitions for state changes
- **FR-020**: System MUST fail silently when optional services (flavor text, image generation) are unavailable, without blocking fusion generation
- **FR-021**: System MUST provide a settings panel where the user can enter and update their Hugging Face API token
- **FR-022**: System MUST persist the API token in localStorage and use it for all AI service requests
- **FR-023**: System MUST prevent fusion generation and show a configuration prompt if no API token is set
- **FR-024**: System MUST detect rate-limit responses from the AI service and display a cooldown message with the Generate button temporarily disabled
- **FR-025**: System MUST load the Pokemon dataset from a bundled static JSON file containing 809 base species (Gens 1–7)
- **FR-026**: System MUST persist AI-generated images alongside fusion text data in the hosted database when images are available; fusions without images store a null image field
- **FR-027**: System MUST show an error with retry when the database is unavailable, retaining the current fusion in memory
- **FR-028**: System MUST sanitize all AI-generated text before rendering in the DOM to prevent cross-site scripting (XSS)
- **FR-029**: System MUST allow the user to configure the Hugging Face model ID in the settings panel, with a sensible default pre-filled

### Key Entities

- **Pokemon**: A base species creature defined by a name, one or two types, six stats (HP, Attack, Defense, Special Attack, Special Defense, Speed), and optional flavor text. Sourced from a bundled static JSON dataset of 809 base species (Gens 1–7, ending at Melmetal). No regional variants, megas, or special forms.
- **Fusion**: A generated combination of two parent Pokemon. Contains a blended AI-generated name, AI-generated description, averaged stats, an optional AI-generated image (persisted to hosted DB when available), and a creation timestamp. Each fusion is unique even for the same parent pair due to AI generation. Regeneration replaces the current fusion in-place; saved fusions require an explicit re-save after regeneration.
- **Fusion Card**: The visual representation of a Fusion displayed to the user. Shows the fusion name, parent Pokemon names with type badges, six color-coded stats with a total, AI description, optional image (or placeholder), and action buttons (Save, Delete, Regenerate).
- **Type Compatibility Check**: A runtime check that excludes random-mode pairings where both Pokemon share the exact same type combination (e.g., two pure-Water or two Water/Flying Pokemon are excluded). All other pairings are valid. Implemented as a comparison function, not a precomputed matrix. Used only in random mode; manual selection bypasses this filter.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can generate a random fusion with a single action and see the result within 15 seconds
- **SC-002**: The app remains fully functional when the required AI text service and hosted database are available — all other services may be offline
- **SC-003**: Saved fusions (including images) persist in the hosted database with 100% reliability across sessions and devices
- **SC-004**: All user-facing operations provide visual feedback (loading, success, or error) within 1 second of user action
- **SC-005**: The app is fully usable on screens as small as 320px wide and as large as 2560px wide
- **SC-006**: 100% of error scenarios display a user-friendly message with a recovery action (retry, dismiss, or navigate)
- **SC-007**: Users can manually select and fuse any two different Pokemon from the full roster of available base species
- **SC-008**: Regenerating a fusion produces a different name and description at least 90% of the time

## Assumptions

- Users have a stable internet connection to access the required AI text generation service and hosted database
- Users are using a modern browser that supports local storage (latest two major versions of Chrome, Firefox, Safari, or Edge)
- The Pokemon dataset covers base species only: no regional variants, mega evolutions, Gigantamax forms, or other special forms
- The app is designed for single-user use with no authentication for v1 — all users share the same DB endpoint
- The local image generation service, when used, runs on the same machine or local network as the user
- The type-compatibility filter for random mode excludes pairs where both Pokemon share the exact same type combination; all other pairings are valid
- AI-generated content (names, descriptions, images) is non-deterministic — the same inputs may produce different outputs
- No offline mode is required — the app needs the AI service and database to function fully
- The Hugging Face API token is provided by the user via a settings panel and stored in localStorage — it is never hardcoded in source
- AI-generated images are persisted to the hosted database alongside fusion text data when available
- The Pokemon dataset is a bundled static JSON file (809 base species, Gens 1–7); no runtime fetching of the full roster is required
- The specific hosted database technology is a deferred decision; the backend API abstracts the DB choice
