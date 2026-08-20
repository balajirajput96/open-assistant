# External Blockers

## Deployment-gated recurring review

The combined daily GitHub failure-review schedule is configured for **09:00 Asia/Kolkata**, but registration remains blocked by the platform precondition:

```text
project not deployed yet — please deploy in the webdev panel and retry
```

This is not a source-code, test, GitHub Actions, or credential failure. A project deployment must reach the platform’s published state before the schedule command can create the recurring task. The schedule command must be retried after the Publish panel reports a live deployment.

## Repository security alerts

GitHub reports 132 dependency-security alerts on the repository default branch. The available GitHub token can inspect Actions runs, but GitHub denied annotation/security-detail reads with a `403` due to insufficient `checks:read` scope. Without individual advisory/package details, broad dependency upgrades would be unsafe and are not being guessed. The next remediation step is to review the Dependabot security page with an account permitted to access alert details, then apply and test targeted upgrades one advisory at a time.
