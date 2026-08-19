# Open Assistant Privacy Policy — Draft for Review

> **Working draft, not legal advice.** This describes the current application behaviour and should be reviewed by qualified counsel and completed with the publisher’s legal name, contact details, effective date, and final distribution details before public release.

## Summary

Open Assistant is designed as a **local-first assistant**. Its text conversation history, action-review history, and preferences are stored locally on the user’s device. When the local models are available, text generation and speech transcription are performed on-device.

## Information processed on the device

The application may process typed messages, locally generated responses, microphone audio during an active transcription session, local action-review records, and local settings. This information is used to provide the requested assistant features. The current app code does not upload a user’s typed message or microphone recording to a cloud AI service.

## Model downloads

The app downloads local model files only after the user enables the relevant download control. Model downloads require network access and are fetched from the model runtime’s configured distribution source. Download requests may necessarily reveal ordinary technical information, such as IP address and device network metadata, to that distribution service; prompts and microphone audio are not part of a model-file download.

## External actions

Open Assistant does not silently send emails, messages, social posts, payments, purchases, or account changes. It can create a local draft or open a user-supplied link only after the user reviews and explicitly confirms the action. Opening a link transfers the user to that destination, whose privacy practices apply independently.

## Storage and deletion

The user can delete locally stored conversations, action history, and preferences in **Settings → Delete local history**. Downloaded model files are managed by the native model runtime and may require removal through device storage controls or a future in-app model-management feature.

## Microphone permission

The microphone is requested only when the user starts private voice transcription. Audio is captured as short device-local PCM buffers for on-device transcription. The current application does not upload the captured audio.

## Changes and contact

Before release, the publisher must add its legal identity, support email address, effective date, and a publicly hosted privacy-policy URL. Any new analytics, cloud model, account, advertising, or external automation feature requires an updated policy and a fresh Google Play Data safety review.
