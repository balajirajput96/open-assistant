# Historical Automation Inventory

## Audit boundary

The audit reviewed the current Open Assistant Git worktree, reachable branches/remotes, recent commits, reflog, stashes, workflow files, and project automation documentation. Raw terminal command history was not printed because it can contain credentials; only its availability metadata was checked. No claim is made for sandbox artifacts that were not present in the current restored project.

| Component | Source | Current status | Reuse decision |
| --- | --- | --- | --- |
| Mobile AI assistant | Git history and current source | Preserved through checkpoint commits and GitHub `main` | Keep as the primary product. |
| Push/PR verification | `.github/workflows/verify.yml` | Validated locally and by recent successful GitHub runs | Keep as the baseline regression gate. |
| GitHub automation audit | `REPOSITORY_REPAIR_QUEUE.md`, `EXTERNAL_BLOCKERS.md` | Documents first-party priority, runner safeguards, and current external limitations | Keep and update only when evidence changes. |
| n8n repair guidance | `N8N_REPAIR_LEARNINGS.md` | Read-only health and runner-setting policy | Keep; do not mutate live workflows during health checks. |
| Local mobile checks | package scripts and Expo diagnostics | `pnpm install`, lint, type checks, tests, build, and Expo diagnostics passed in the verified baseline | Reuse as the deterministic maintenance sequence. |
| Branch recovery points | local checkpoint branches, reflog, GitHub main and repair branch refs | No stashes were present; no destructive recovery is required | Preserve; never reset or force-push divergent work blindly. |

## Safe reusable maintenance sequence

1. Fetch GitHub state and inspect branch divergence before making source changes.
2. Run locked dependency installation, lint, type checks, unit tests, and server build.
3. Keep GitHub workflow results separate from runner, deployment, and credential blockers.
4. Rebase only onto the verified default branch, review the diff, and synchronize validated commits.
5. Record `success`, `blocked`, or `error` without exposing secrets or altering external systems.

## Current external dependencies

Hourly deterministic checks can be made durable in GitHub Actions. AI-driven repair reviews should remain low-frequency because each full agent run has a runtime and credit cost. The project deployment prerequisite remains required before a managed daily review can be registered.
