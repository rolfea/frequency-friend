# Frequency Friend

A lightweight, framework-free note-recognition practice app for music students.

## Development

```bash
npm install
npm run test         # run unit tests
npm run test:e2e     # run Playwright end-to-end tests
npm run build        # compile TypeScript to dist/
npm run dev          # serve with npx serve
```

## Deploy to Render

### Option A: Render Blueprint (recommended)

The repo includes a `render.yaml` Blueprint. In the Render Dashboard:

1. Go to **Blueprints** → **New Blueprint**.
2. Connect this repository and select the `main` branch.
3. Render will read `render.yaml` and create the static site automatically.

### Option B: Manual static site

1. Create a new static site on Render.
2. Connect this repository.
3. Set:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `.` (root)
4. Click deploy.

## CI

GitHub Actions runs the build, unit tests, and Playwright e2e tests on every push and pull request to `main`. See `.github/workflows/ci.yml`.
