# Mock log data

`logs.json` contains 16 fictional event templates across six services, with
`debug`, `info`, `warn`, and `error` levels. `seed.py` sends these through the real
`POST /v1/logs` API, Kafka, and log processor into ClickHouse. The app loads them
through its normal search API.

Requires Python 3.9+ and a running Logify API and log processor. No Python
packages need to be installed.

## Run

Start the backend and pipeline with `make run` from `apps/backend`. In another
terminal, run this from the repository root:

```bash
make mock-data
```

Enter your existing account's email and password when prompted. The password
is hidden. The script sends 100 logs to `default-project`, or your first project
if no project has that name. It never creates an account or project.

The default URL is `http://localhost:8081`. If your API uses port `8080`:

```bash
python3 mock-data/seed.py --base-url http://localhost:8080
```

## Use an API key

Create a key in **Connect a source**, then run:

```bash
export LOGIFY_API_KEY='YOUR_API_KEY'
python3 mock-data/seed.py --base-url http://localhost:8080 --count 100
```

The key selects its project automatically. This mode never signs in or requests
the project list. A supplied `--project-id` must match the key's project; the
backend rejects a mismatch. Keys are never printed or saved by the script.
Use either `LOGIFY_API_KEY` or `LOGIFY_ACCESS_TOKEN`, not both.

## Use an access token

```bash
export LOGIFY_ACCESS_TOKEN='YOUR_ACCESS_TOKEN'
python3 mock-data/seed.py --count 200
```

To use a specific project:

```bash
python3 mock-data/seed.py --project-id YOUR_PROJECT_UUID --count 50
```

The script checks that the selected project appears in your authenticated
account's project list. Tokens and passwords are neither stored in this folder
nor printed by the script.

For unattended login, set `LOGIFY_EMAIL` and `LOGIFY_PASSWORD` in the environment.
`LOGIFY_API_BASE_URL` and `LOGIFY_PROJECT_ID` also provide defaults for their
corresponding flags. A supplied access token takes precedence over email login.

## Preview or customize

```bash
# Print five JSON payloads without authentication or network requests.
python3 mock-data/seed.py --dry-run --count 5

# Read another JSON array and spread its events over the last hour.
python3 mock-data/seed.py --file mock-data/logs.json --count 120 --minutes 60

# The same flags work through Make.
make mock-data ARGS='--count 50 --minutes 10'
```

Edit `logs.json` to change the messages, services, levels, or string-valued tags.
The templates repeat when the requested count exceeds the number of templates.
The script supplies the project ID, fresh UTC timestamps, unique request IDs,
and `source: mock-data`. Events are marked with `mock: true` and
`dataset: logify-demo` tags, and use the development environment.

By default, timestamps cover the last 15 minutes. After the script reports
acceptance, refresh Logs and choose a time range covering those events. Kafka
processing is asynchronous, so they may take a moment to appear. Each run adds
a new batch. Failed requests produce a nonzero exit status and the accepted
count; the script does not retry failed writes automatically.

## Verify the script

```bash
python3 -m unittest discover -s mock-data/tests -v
```

These tests use a temporary local HTTP server and send no events to your Logify
databases. They cover login, token and API-key authentication, default and explicit project
selection, request payloads, preview mode, and rejected requests.
