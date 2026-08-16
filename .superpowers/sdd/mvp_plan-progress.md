# SDD ledger — plan: docs/mvp_plan.md

## Preflight scan

- Plan has 9 tasks; tasks 2-9 depend on Task 1 scaffolding.
- No internal contradictions found.
- Spec (`docs/core.md`) reachable and consistent with plan.
- Rulings: none yet.

## Status

All 9 tasks in the MVP plan are complete. The app is built, tested, deployed to Render, and pushed to GitHub.

## Todos

- [x] Task 1: Project scaffolding
- [x] Task 2: Note domain
- [x] Task 3: Scheduler / spaced-repetition wrapper
- [x] Task 4: Session logic
- [x] Task 5: Storage helpers
- [x] Task 6: SVG staff display custom element
- [x] Task 7: Settings panel custom element
- [x] Task 8: App card and main wiring
- [x] Task 9: Build verification and Render deploy prep

## Post-MVP additions made during this session

- Added Playwright e2e suite (`tests/e2e/*.spec.ts`) covering staff rendering, session sizing, settings, and spaced-repetition behavior.
- Added GitHub Actions CI (`.github/workflows/ci.yml`) running build, unit tests, and e2e tests.
- Added `render.yaml` Render Blueprint for one-click static-site deploy.
- Added CSP meta tag in `index.html`.
- Ran three review passes (correctness, code cleanliness, security) and applied fixes:
  - Removed dead code from `src/domain/note.ts`.
  - Centralized `pickDueNotes` in `src/domain/scheduler.ts` and fixed replacement behavior when pool < session size.
  - Hardened `session.answer()` to return `null` on exhausted session.
  - Added settings validation (swap inverted range, clamp `cardsPerSession`).
  - Cleaned up e2e test helpers and grouped them with `test.describe`.

## Verification

- `npm run build`: clean
- `npm run test`: 28 unit tests passing
- `npm run test:e2e`: 8 Playwright tests passing
- Deployed to Render via `render.yaml` Blueprint.
- Pushed to `https://github.com/rolfea/frequency-friend.git` on `main`.
