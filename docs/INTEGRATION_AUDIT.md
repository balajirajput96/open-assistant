# Integration and CLI Audit

## Scope rule

This audit validates integrations that are implemented by Open Assistant or required by its release workflow. Installed but unreferenced tools are not enabled or wired into the application solely because they exist; doing so would enlarge the security and maintenance surface without a product requirement.

| Integration or CLI | Project evidence | Environment state | Validation result |
| --- | --- | --- | --- |
| GitHub | Repository source, remote workflow audit, source synchronization | `gh` is available and authenticated | Repository metadata, Actions runs, pull-request state, and remote branch were queried successfully. |
| Gemini | No application import, adapter, API client, or runtime reference | Gemini CLI unavailable; Google Gemini connector is disabled | Not an implemented Open Assistant integration. No secret, connector, or source-code change is required. |
| Google Workspace | No application import, adapter, or API client reference | Workspace CLI is available | Not an implemented Open Assistant integration, so no external account action was run. |
| Antigravity | No application import, adapter, or wrapper reference | CLI unavailable | Not implemented; no repairable project defect found. |
| Datadog | No instrumentation, client, or configuration reference | CLI unavailable | Not implemented; no repairable project defect found. |
| n8n | No live n8n client or credential use in this app | No n8n CLI in environment | Referenced pharma findings were documented as a workflow-repair policy only; no live n8n workflow was altered. |
| On-device model runtime | React Native ExecuTorch and resource fetcher dependencies | Native Android build required | Model and speech flows are intentionally unavailable in browser preview and documented for Android 13+ native builds. |

## Conclusion

The reachable integration boundary is GitHub plus the local/mobile runtime. Gemini, Google Workspace, Antigravity, Datadog, and n8n are not current application dependencies. A future feature that adds one of them must first add an explicit adapter, server-side secret handling, minimal permission request, and a dedicated integration test; it should not reuse an unrelated connector automatically.
