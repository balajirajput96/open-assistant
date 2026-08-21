# Persistent Maintenance Worker

## Purpose

The worker performs a read-only GitHub Actions health check for the prioritized first-party repositories. It classifies the newest workflow run as `success`, `blocked`, or `error`, writes a compact run history record to the project database, and never commits code, mutates workflows, sends external messages, or changes secrets by itself.

Each cycle is reserved in a database-backed ledger before the first GitHub request and is marked completed atomically with its compact result. This gives restarts a machine-readable, monotonic history and prevents an unrecorded cycle from executing.

## Safety boundaries

The worker is disabled unless `MAINTENANCE_ENABLED=true` is configured server-side. It uses a server-only GitHub token, makes only GitHub Actions read requests, limits retries to two attempts for transient server failures, prevents overlapping runs, and enforces a minimum fifteen-minute interval. The default interval is one hour. Credential and real GitHub integration tests run where the token is configured; GitHub Actions keeps them skipped unless an Actions secret is deliberately added, while deterministic unit coverage remains active.

## Deployment requirement

The worker needs a persistent single-process deployment to stay alive between intervals. It is not enabled in the default stateless deployment mode. Before activation, confirm the persistent-hosting usage cost and ensure that the published project is genuinely live. The configured worker has been validated through mocked unit coverage and a read-only GitHub Actions integration test.

## Complementary GitHub review

`.github/workflows/review-ci-failures.yml` runs daily at **09:00 Asia/Kolkata** (03:30 UTC) and can also be invoked manually. It has read-only `actions` and `contents` permissions, reviews only the latest run for each other workflow, writes a repository-local job summary, and always leaves code, branches, pull requests, secrets, workflow configuration, and external systems unchanged. It is a failure-review signal, not an automated repair mechanism.

## Operator controls

| Control | Effect |
| --- | --- |
| `GITHUB_MAINTENANCE_TOKEN` | Required server-only token for repository and Actions read access. |
| `MAINTENANCE_ENABLED=true` | Starts the worker after the API server listens. |
| `MAINTENANCE_MAX_CYCLES` | Optional positive integer cap; defaults to the approved 2,400 total cycles. |
| Default interval | Performs one health check each hour. |
| Database run history | Retains status, compact summary, non-secret action details, and the reserved/completed cycle ledger. |

The maintenance worker is intentionally not an autonomous code-writing or deployment agent. A failed health result is recorded for a subsequent verified repair workflow rather than being force-fixed in production.
