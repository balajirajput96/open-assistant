# Open Assistant

Open Assistant is a **local-first mobile AI assistant** designed for privacy-conscious Android use. It stores conversation history locally, supports user-approved model downloads, can generate responses with an on-device open model, and exposes action reviews instead of silent automation.

## Product boundaries

| Included | Deliberately excluded from this release |
| --- | --- |
| Local text chat after model download | Unlimited cloud AI access or a claim that every website can be autonomously controlled |
| On-device Whisper voice transcription after download | Silent email, message, social post, purchase, or account modification |
| Spoken responses through the device text-to-speech service | Background surveillance or automatic microphone activation |
| Local activity audit trail and deletion controls | User accounts, cloud history sync, analytics, or advertising SDKs |
| Explicit review before a link opens or a draft is saved | Automatic model download without consent |

## Tech stack

- Expo SDK 54 and React Native
- React Native ExecuTorch with Expo resource fetching for local inference
- Qwen3-0.6B for compact local text generation, subject to model download and supported device hardware
- Whisper Tiny for local speech-to-text, subject to model download and microphone permission
- AsyncStorage for local conversation, activity, action-review, and preference state

## Local development

```bash
pnpm install
pnpm check
pnpm test
pnpm dev
```

The web preview is useful for interface review, but the local inference and private microphone transcription require an Android development or production build. Test on a physical 64-bit Android 13+ device before release.

## Key user flows

1. **Download local text model**: The user enables the local model option, the model downloads, and text requests are then processed on the device.
2. **Private voice input**: The user enables the voice model option, grants microphone permission, speaks, reviews the local transcript, and sends it only when satisfied.
3. **Action review**: A send-like request creates a local draft review. A request to open a supplied link creates a review card. The user must explicitly approve the final action.
4. **Local deletion**: The user deletes stored conversation history and action history from Settings.

## Release material

- [Model attribution](docs/MODEL_ATTRIBUTION.md)
- [Privacy policy draft](docs/PRIVACY_POLICY_DRAFT.md)
- [Play Store release guide](docs/PLAY_STORE_RELEASE.md)
- [Product interface design](design.md)
- [Architecture and research notes](research-notes.md)

## Verification

`pnpm check` confirms TypeScript integration. `pnpm test` covers the rule that sending-like requests become a review-only local draft and that opening a link requires both a URL and explicit open intent.
