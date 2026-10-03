# Logify Web

The Logify web app uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, and
shadcn/ui. It provides a white-theme workspace with a project sidebar, message
search, time ranges, paginated logs, event details, and source connection
instructions.

![Logify log explorer](../../docs/screenshots/log-explorer.jpg)

## Run locally

Requires Node.js 20.9+ and npm. Start the backend using the
[root quick start](../../README.md#quick-start), then run from this directory:

```bash
npm ci
NEXT_PUBLIC_LOGIFY_API_BASE_URL=http://localhost:8081 npm run dev
```

Open [localhost:3000](http://localhost:3000).

For a persistent configuration, add `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_LOGIFY_API_BASE_URL=http://localhost:8081
```

Match this URL to the backend's `APP_SERVER_PORT`. Restart the dev server after
changing it; a compiled frontend requires a rebuild because `NEXT_PUBLIC_*`
values are embedded in the client bundle.

## Docker

From the repository root, run `make run` to build and start the full stack.
The web image runs the Next.js standalone server on Node.js Alpine as a non-root
user. Project URLs are resolved at runtime, so newly created projects work
without rebuilding the frontend. The image includes public assets and the
compiled JavaScript and CSS, and exposes `/healthz` for its health check.

Run `make down` from the repository root to stop both Logify container stacks
(`logify-alpine` and `logify-dev`) while keeping their data volumes.

## Main screens

| Route | Purpose |
| --- | --- |
| `/` | Product introduction and sample-log preview |
| `/signup` | Create an account; the backend provisions its default project |
| `/login` | Sign in to an existing account |
| `/dashboard/logs` | Search logs, switch projects, inspect events, and connect a source |

The project list and log results come from the real API. The browser selects
an existing project; default-project creation belongs to backend registration.
The result table scrolls within the workspace while its controls and pagination
remain visible.

To populate the explorer, run `make mock-data` from the repository root. See
the [sample-data guide](../../mock-data/README.md).

## Checks

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Code map

| Location | Purpose |
| --- | --- |
| `app/(landing)/` | Landing screen |
| `app/(auth)/` | Sign-in and registration routes |
| `app/(app)/dashboard/logs/` | Log explorer |
| `components/ui/` | shadcn/ui primitives |
| `components/observability/` | Search, event details, and ingest instructions |
| `components/app-shell.tsx` | Viewport layout and shared providers |
| `components/app-bar.tsx` | Project sidebar and account menu |
| `lib/api/` | HTTP clients for authentication, projects, and logs |
| `lib/auth-store.tsx` | Authentication state |
| `lib/project-store.tsx` | Project selection and creation |
| `lib/logs-data-context.tsx` | Search results and pagination |

The [root README](../../README.md#screenshots) contains the complete screenshot
gallery and backend setup instructions.
