# 365 - My Year Implementation Plan

## Objective

Deliver a local-first, mobile-first Year Experiment that makes daily reflection quick, preserves personal data, and treats recovery and life enrichment as complementary dimensions.

## Engineering principles

1. Build complete vertical slices rather than isolated screens.
2. Keep unknown values distinct from negative or zero values.
3. Derive summaries from persisted observations instead of storing duplicate totals.
4. Treat schema migration, backup, and offline behavior as product features.
5. Use neutral, non-diagnostic language throughout the interface.
6. Meet WCAG 2.2 AA in each slice rather than deferring accessibility.

## Stack

* React and TypeScript with Vite
* Tailwind CSS for layout and styling
* React Router for application navigation
* Dexie and IndexedDB for versioned local persistence
* Recharts for later trend visualizations
* Lucide React for interface icons
* Vite PWA plugin for installation and offline behavior
* Vitest and React Testing Library for unit and component tests
* Playwright for mobile workflows, browser coverage, and offline tests

## Phase 1 - MVP

### Slice 1 - Foundation and Year Experiment

Deliverables:

* Responsive application shell and five-destination mobile navigation
* Canonical domain types for Local Profile, Year Experiment, Personal Day, and Daily Check-In
* Timezone-aware personal-date utilities and challenge progress calculations
* Versioned Dexie database with an initial schema
* First-run Year Experiment setup, prefilled with 30 August 2026
* Today dashboard skeleton backed by persisted setup data
* PWA manifest and offline application shell

Acceptance criteria:

* 30 August 2026 is Day 1 and 29 August 2027 is Day 365.
* Dates before the experiment are not assigned a challenge day.
* Progress is clamped from 0% through 100%.
* The chosen start date and timezone survive a browser restart.
* The dashboard has no hard-coded current-day example values.
* Core controls are keyboard accessible and usable at a 320-pixel viewport.

### Slice 2 - Daily Check-In

Deliverables:

* One draftable Daily Check-In per Personal Day
* Alcohol, sleep, energy, mood, stress, and optional reflection fields
* Incremental persistence and explicit completion state
* Historical editing from the experiment start through today
* Customizable pinned optional fields

Acceptance criteria:

* A default check-in can be completed in under two minutes during usability testing.
* Reloading during entry restores the draft.
* Missing fields remain unknown and do not become zero or no.
* A future Daily Check-In cannot be created.

### Slice 3 - Symptoms and alcohol detail

Deliverables:

* Default and custom symptom definitions
* Optional 0-10 symptom observations
* Conditional alcohol amount, trigger, and note fields
* Neutral history presentation and static safety notice

Acceptance criteria:

* Recording alcohol does not reset or alter the Year Experiment dates.
* Historical Alcohol-Free Days remain unchanged.
* Custom symptom definitions can be hidden without deleting observations.

### Slice 4 - Activities and exercise

Deliverables:

* Activity categories and custom activities
* Duration, energy/mood before and after, enjoyment, and notes
* Exercise type, duration, intensity, and optional distance/calories
* Multiple records per Personal Day

Acceptance criteria:

* Activity enjoyment uses one 1-5 post-activity score.
* Activities and exercises can be edited or deleted independently.
* Dashboard Body and Life summaries are derived from persisted records.

### Slice 5 - History and calendar

Deliverables:

* Daily history and editable day detail
* Year calendar with coexisting status indicators
* Filters for recorded, partial, alcohol, creative, exercise, and meaningful days

Acceptance criteria:

* Unknown alcohol status is visually distinct from alcohol-free and alcohol-recorded.
* Status meaning does not depend on color or emoji alone.
* Calendar navigation is keyboard and screen-reader accessible.

### Slice 6 - Trends

Deliverables:

* Physical, mental, lifestyle, and life trend views
* 7-, 30-, 90-, and 365-day ranges
* Clear missing-data and sample-size presentation

Acceptance criteria:

* Charts exclude unknown observations without converting them to zero.
* Every chart has an accessible textual summary.
* Reduced-motion preferences are respected.

### Slice 7 - Projects and interests

Deliverables:

* Generic Projects with categories, optional dates, milestones, notes, and invested time
* Things I Want to Try with idea, interested, tried, loved, and not-for-me states
* Return to Sewing as seed data the user may keep or remove

Acceptance criteria:

* Projects do not require target dates.
* Creative projects use the same Project model as all other categories.
* Exploration states are not presented as task completion.

### Slice 8 - Backup, export, and deletion

Deliverables:

* Versioned JSON backup and validated restore
* CSV exports by record type
* Typed-confirmation delete-all flow with pre-delete backup offer

Acceptance criteria:

* A JSON round trip preserves all supported records and unknown values.
* Invalid or newer unsupported backups are rejected without modifying local data.
* Delete all data clears IndexedDB and returns to first-run setup.

### Slice 9 - PWA and release validation

Deliverables:

* Installable production PWA
* Offline relaunch and update behavior
* Persistent-storage capability warning
* Cross-browser mobile end-to-end suite

Acceptance criteria:

* The installed app launches without a network connection after an initial visit.
* A schema upgrade preserves an earlier fixture database.
* Primary workflows pass in Chromium and WebKit mobile profiles.
* Production build, unit tests, accessibility checks, and end-to-end tests pass.

## Phase 2 - Reflection and resilience

* Weekly and monthly reviews
* Milestones and gentle celebration
* Craving and Wellbeing Event flows
* Association engine using the accepted eligibility thresholds
* Compressed photos with storage visibility and backup support
* Printable/PDF year report

## Phase 3 - Optional connected services

* Authentication and encrypted cloud synchronization
* Conflict resolution across devices
* Apple Health and Google Health integrations
* Advanced analytics evaluated for validity and user value
* Opt-in AI reflections with explicit privacy controls

## Immediate work

Implement Slice 1 only. Review its behavior and visual direction before opening Slice 2 so the persistence, date, accessibility, and navigation foundations can be corrected cheaply.