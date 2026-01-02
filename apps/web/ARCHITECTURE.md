# Frontend Architecture (Focus: Developer Guide)

## 🗺 Overview
The frontend is an Angular 18+ application built with **Standalone Components** and **Signals**. It prioritizes performance, type safety, and a clean reactive data flow.

## 🏗 Key Components

### 1. State Management: Native Signals
- **Why Signals?**: We deliberately avoided `NgRx` or `BehaviorSubjects`. Signals provide finer-grained reactivity and simpler syntax (`this.count()`) compared to RxJS streams.
- **Usage**:
    - `messages = signal<Message[]>([])`: Chat history.
    - `notes = signal<Note[]>([])`: Notes list (Updated via API).
    - `sessionId = signal('default')`: Current session context.

### 2. UI Library: Angular Material
- **Version**: Pinned to **v18** to match Angular core.
- **Theme**: We use the **Prebuilt Theme** (`indigo-pink.css`).
    - **Decision**: Custom theming in Material M3 (v18+) is complex Sass. Prebuilt themes allow us to focus on logic first.
- **Layout**: **TailwindCSS** (or utility classes mimicking it) is used for positioning (flex, grid, padding). We use Material for *Interactive Components* (Buttons, Inputs, Sidenav) and CSS/Tailwind for *Structure*.

### 3. API Integration (`src/app/api.service.ts`)
- **Client**: Angular `HttpClient`.
- **Pattern**:
    - All backend calls return `Observable<T>`.
    - Components subscribe (or use `rxResource` in future).
    - **Handling**: currently simple subscriptions. Ideally, we would use `toSignal` for read-only data (Notes list).

### 4. Component Structure (`src/app/`)
- **`AppComponent`**: Acts as the main layout shell and Smart Component.
    - Contains the `MatSidenav`.
    - Manages the top-level state.
    - *Refactor Goal*: Split `Chat` and `Notes` into separate sub-components (`ChatComponent`, `NotesSidebarComponent`) once files grow >200 lines. Currently kept together for cohesion speed.

## 🛠 Developer Notes

### Adding Dependencies
- **Strict Rule**: Always install dependencies compatible with **Angular 18**.
- Example: `npm install @angular/material@18 @angular/cdk@18`.
- If you install `latest`, it might pull v21 (nightly/next) causing peer dependency failures.

### Change Detection
- Since we use `OnPush` (implicit with Signals best practice, though explicit `changeDetection: ChangeDetectionStrategy.OnPush` should be added to components), updating a Signal automatically refreshes the view.
- Avoid manual `detectChanges()`.

### Routing
- Currenly Single View.
- `app.routes.ts` is empty but ready for expansion (e.g., `/settings`, `/dashboard`).
