# n8n Pharma Automation Repair Learnings

## Verified findings from the referenced task

The referenced pharma automation work established that not every blocked GitHub Action is a source-code defect. Its remaining n8n CI blocker depended on the repository Actions variable **`RUNNER_PROVIDER=github`**. That value is a GitHub repository setting and requires authorised repository-settings access; changing workflow source code to bypass an unavailable runner is not a safe substitute.

The task also verified a safe daily health-sync pattern: resolve configuration using a trusted schedule identifier, require a public HTTPS n8n endpoint, use the n8n API key only server-side, read workflow/execution metadata without modifying a workflow or sending recruiter messages, and record a structured `success`, `blocked`, or `error` result. The cited project’s full local verification passed TypeScript plus five test files and nineteen tests.

## Repair policy applied here

| Situation | Required response |
| --- | --- |
| GitHub Action is queued, cancelled, or blocked by a runner setting | Inspect the run and repository configuration before changing source code. Do not create a source-code workaround for an infrastructure setting. |
| Repository branch has large unrelated divergence | Verify a clean default-branch worktree first. Do not blindly rebase, merge, or force-push the divergent branch. |
| n8n workflow health check | Read authenticated health metadata only; do not alter workflows, credentials, or external messages during an audit. |
| Recurring failure review | Report `success`, `blocked`, or `error` with the run URL and safe failure reason, so operational and source-code blockers remain distinguishable. |

## Current limitation

This task has not verified or changed any live n8n credentials, workflow definitions, or repository Actions variables. Those external changes require the relevant enabled integration and, for a restricted GitHub setting, available settings permission.
