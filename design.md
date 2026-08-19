# Open Assistant — Mobile Interface Design

## Product intent

Open Assistant is a **local-first personal AI workspace** for Android and iOS. It helps a user capture a thought by typing or speaking, review the assistant’s response, save useful context locally, and explicitly approve any outward action. The first release avoids a misleading promise of unrestricted autonomous access to every website; it instead uses modular, permissioned capabilities that can be expanded safely.

## Design principles

The interface is designed for a **9:16 portrait screen** and one-handed use. Primary actions remain in the lower thumb zone, conversational content is readable at a glance, and each consequential automation displays what data will leave the device before it runs. The visual language follows mainstream iOS conventions: generous spacing, 44-point minimum touch targets, clear navigation titles, native sheets for focused choices, subtle haptics, and calm motion rather than decorative animation.

## Screen list

| Screen | Primary content | Primary functionality |
| --- | --- | --- |
| Assistant | Conversation timeline, connection state, suggested starter prompts, message composer, voice button | Ask questions, dictate a request, receive a response, stop or retry a request, and review an action proposal. |
| Activity | Local list of recent conversations and completed or declined proposed actions | Reopen a conversation, search history later, and inspect what an automation did. |
| Automations | User-created action shortcuts and their required permissions | Enable or disable an automation, review its inputs and outputs, and run a one-time action only after confirmation. |
| Settings | AI provider selection, language, voice, privacy choices, data controls, legal links | Choose a compatible provider, control local storage, delete local history, and manage microphone permission. |
| Permission sheet | Plain-language explanation of a proposed external action | Approve once, cancel, or see exactly what information will be shared and why. |

## Layout specifications

The **Assistant** screen uses a compact header with the app name and a status pill. The timeline occupies the flexible center region; user messages align right and assistant messages align left in high-contrast, rounded containers. Any proposed automation appears as a distinct card with an action title, destination, data summary, and a single visible **Review action** control. At the bottom, the composer has a multiline text field, a clear send control, and a press-to-talk microphone control. This keeps the frequent task—asking for help—inside the natural thumb arc.

The **Activity** and **Automations** screens use native-style grouped lists with a prominent section title, short explanatory copy, and full-width rows. The **Settings** screen uses grouped controls, destructive data controls at the bottom, and no dark patterns. An approval request opens in a bottom sheet rather than navigating away from the conversation, preserving the user’s context.

## Key user flows

| Flow | Steps |
| --- | --- |
| Voice question | User holds the microphone button → app requests microphone permission if needed → spoken text is transcribed → user reviews or sends the transcript → assistant replies in text and optional speech. |
| Text conversation | User enters a prompt → message appears immediately as pending → assistant replies → conversation is stored locally on the device. |
| Action proposal | Assistant identifies a supported action → presents a review card → user opens the sheet → app shows destination, payload, and consequences → user approves or declines → outcome is written to Activity. |
| Privacy reset | User opens Settings → chooses Delete local history → sees a destructive confirmation → app removes locally stored conversations and reports completion. |
| Provider configuration | User opens Settings → selects a supported provider mode → app explains any key, quota, or privacy requirement before activation. |

## Brand and color choices

The brand uses **midnight ink** (`#0B1220`) as the primary dark surface, **signal blue** (`#2563EB`) for primary actions and active controls, and **aqua clarity** (`#22D3C5`) as the assistant’s recognizable highlight. Pale blue-white (`#F7FAFF`) is the light background, while warm coral (`#E85D5D`) is reserved for destructive or blocked states. The palette communicates focused utility and privacy without imitating another assistant product. Light and dark themes preserve accessible contrast, and color is never the only signal for status.

## Trust boundaries

The product will never silently send a message, make a purchase, post content, modify an external account, or transmit private data. Every external action must be user-initiated, show a review screen, and require an affirmative confirmation. Background or recurring automations will be introduced only for services with documented, user-authorized APIs and clear notification/audit controls.
