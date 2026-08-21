# Kimi Claw Deployment Review

## Verified official paths

The official Kimi Claw overview documents two distinct routes. The managed route is to sign in at [kimi.com/bot](https://www.kimi.ai/bot), create a Kimi Claw, wait for the provider-managed setup, and then configure chat channels. It requires an Allegretto-or-higher membership plan and does not require a local installer or a separately supplied model API credential.[1]

The self-hosted route is only for an existing OpenClaw instance. The official flow starts from the same Kimi bot page, where the account holder selects **Link Existing OpenClaw** and follows the Kimi plugin instructions on their OpenClaw device.[1]

## Deployment boundary

The provided command downloads and executes a remote script and includes a credential in the command line. It is therefore not an acceptable deployment path without source verification and protected secret handling. This review intentionally does not execute that installer or retain the supplied credential.

Kimi officially supports browser access, mobile apps, and Telegram bot deployment. The documented provider-managed web route is the appropriate first option when the user has no existing OpenClaw host.[1] [2]

## Required next step

Open the official Kimi bot page and authenticate using the account that owns the membership. After the user completes that account step, the managed deployment route can be reviewed through the provider UI; any self-hosted route requires a separately verified OpenClaw installation target.

## Current outcome

The Kimi login modal was closed without entering a phone number, requesting an OTP, accepting terms, or creating a cloud instance. No Kimi Claw deployment, account link, or provider charge was initiated.

## References

[1]: https://www.kimi.ai/help/kimi-claw/overview "Kimi Claw overview — Kimi Help Center"
[2]: https://www.kimi.ai/help/kimi-claw/platform-support "Supported platforms — Kimi Help Center"
