# Logify Web

The Logify web app uses Next.js 16, React 19, TypeScript, Tailwind CSS 4, and
shadcn/ui. It provides a white-theme workspace with a project sidebar, message
search, time ranges, paginated logs, event details, and source connection
instructions.

**Connect a source** creates named project API keys, shows each secret once,
copies a curl command, and lists or revokes existing keys. Keys send logs only;
the web app uses your login session for account management and log searches.

**Settings** is available from the sidebar and account menu. Use **Project** to
save a name or description, **API keys** to create and revoke ingestion keys,
and **Account** to view your email and account ID or sign out. Project changes
are saved through the API and appear in the project switcher immediately.

**Teams** is in the sidebar. Project Owners and Admins create email-bound
invitation links, change roles, remove members, and cancel invitations. Members
and Viewers can read the team list and leave a shared project. The recipient
can sign in or register from `/invite`, then explicitly join the project. The
invitation survives switching between login and signup. Links are copied and
shared manually, expire after seven days, and show the complete token once.

Project permissions come from the backend. Members and Viewers see project
settings as read-only and cannot manage API keys. Shared projects appear in the
same project switcher as personal projects.

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
| `/dashboard/teams` | Members, role changes, invitations, and leaving a project |
| `/invite#token=…` | Review and accept an invitation using the invited account |
| `/dashboard/settings` | Edit the selected project, manage API keys, and view account details |

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
| `app/(app)/dashboard/settings/` | Project, API-key, and account settings |
| `app/(app)/dashboard/teams/` | Selected project’s team |
| `app/invite/` | Invitation review and acceptance |
| `components/project/` | Project creation, team access, and API-key management |
| `components/ui/` | shadcn/ui primitives |
| `components/observability/` | Search, event details, and ingest instructions |
| `components/app-shell.tsx` | Viewport layout and shared providers |
| `components/app-bar.tsx` | Project sidebar and account menu |
| `lib/api/` | HTTP clients for authentication, projects, teams, API keys, and logs |
| `lib/auth-store.tsx` | Authentication state |
| `lib/project-store.tsx` | Owned/shared project selection, creation, and updates |
| `lib/logs-data-context.tsx` | Search results and pagination |

The [root README](../../README.md#screenshots) contains the complete screenshot
gallery and backend setup instructions.
