# Persistent Maintenance Worker

## Purpose

The worker performs a read-only GitHub Actions health check for the prioritized first-party repositories. It classifies the newest workflow run as `success`, `blocked`, or `error`, writes a compact run history record to the project database, and never commits code, mutates workflows, sends external messages, or changes secrets by itself.

## Safety boundaries

The worker is disabled unless `MAINTENANCE_ENABLED=true` is configured server-side. It uses a server-only GitHub token, makes only GitHub Actions read requests, limits retries to two attempts for transient server failures, prevents overlapping runs, and enforces a minimum fifteen-minute interval. The default interval is one hour. Credential and real GitHub integration tests run where the token is configured; GitHub Actions keeps them skipped unless an Actions secret is deliberately added, while deterministic unit coverage remains active.

## Deployment requirement

The worker needs a persistent single-process deployment to stay alive between intervals. It is not enabled in the default stateless deployment mode. Before activation, confirm the persistent-hosting usage cost and ensure that the published project is genuinely live. The configured worker has been validated through mocked unit coverage and a read-only GitHub Actions integration test.

## Operator controls

| Control | Effect |
| --- | --- |
| `GITHUB_MAINTENANCE_TOKEN` | Required server-only token for repository and Actions read access. |
| `MAINTENANCE_ENABLED=true` | Starts the worker after the API server listens. |
| Default interval | Performs one health check each hour. |
| Database run history | Retains status, compact summary, and non-secret action details. |

The maintenance worker is intentionally not an autonomous code-writing or deployment agent. A failed health result is recorded for a subsequent verified repair workflow rather than being force-fixed in production.
