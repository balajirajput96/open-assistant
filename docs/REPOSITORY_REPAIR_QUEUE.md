# Repository Repair Queue

## Evidence-based order

The initial account inventory contained 100 repositories, including a large number of forks. First-party repositories are repaired before forks, because an upstream workflow absence, skipped run, or cancellation is not automatically a defect in a fork.

| Priority | Repository group | Validation status | Next action |
| ---: | --- | --- | --- |
| 1 | `open-assistant` | Expo Doctor, lint, type checks, and tests already passed locally | Monitor its queued external workflow; use the local checkpoint as the repair baseline. |
| 2 | `gmail-resume-mailer` | Type-check, 27 tests, and production build passed locally | Treat its queued Dependabot run as infrastructure status unless a completed run reports a code failure. |
| 3 | `atlas-ai-assistant` | Lint, type checks, tests, and production build passed locally | Treat its queued Dependabot run as infrastructure status unless a completed run reports a code failure. |
| 4 | `infra-tools` | Declared Python and Bash syntax checks passed locally | Investigate only if the cancelled dependency-graph run produces reproducible source-code evidence. |
| 5 | n8n-related repositories | Referenced task found a runner-setting blocker, not a source-code failure | Check `RUNNER_PROVIDER=github` only where repository settings permission is available; do not bypass it in code. |

## Validation protocol

For each repository, identify its declared scripts, run the narrowest safe checks locally, fix only reproducible source failures, rerun the same checks, then rebase and push verified changes. Jobs that can send email, alter n8n workflows, or affect external systems are never invoked during validation.
