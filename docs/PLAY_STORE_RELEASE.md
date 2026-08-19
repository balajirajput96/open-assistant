# Android and Google Play Release Guide

## What this build supports

This project is an Expo mobile app with a native on-device AI runtime. The local model runtime requires a **custom Android development build or production build**; standard Expo Go and the browser preview do not include the native inference libraries. The chosen runtime documents Android 13 as its minimum supported Android version.[1]

| Area | Current release design | Operator action before publishing |
| --- | --- | --- |
| Text assistant | Downloadable local Qwen3-0.6B model, user-approved before download | Test the model download and generation on a physical 64-bit Android 13+ device. |
| Voice input | Downloadable local Whisper Tiny model with microphone permission | Test the permission denial, grant, transcription, interruption, and no-network-after-download cases. |
| External actions | Local drafts and user-confirmed link opening only | Confirm there is no direct posting, purchase, sending, or account modification flow. |
| Data safety | Local conversation and local voice processing, with model-file download networking | Re-evaluate every declaration against the final APK/AAB and any added SDKs. |
| Privacy policy | Draft included in this repository | Obtain a stable public URL and have the final policy reviewed before submitting. |

## Build and release sequence

1. Test a native Android development build on supported hardware. Confirm that the model is not downloaded until the user enables its download setting.
2. Set the real publisher support address and publicly host the reviewed privacy policy. The Play Console requires a privacy policy for apps that collect or share user data.[2]
3. Create the production checkpoint in the project workspace. Then use the **Publish** control in the workspace to generate the Android artifact; do not build a production APK manually in this development sandbox.
4. Create a Google Play Developer account and complete the required store listing, content declarations, Data safety form, app access information, and testing track. Google requires an accurate Data safety disclosure for published apps.[2]
5. Upload the generated Android App Bundle (AAB) to internal testing first. Test model downloads, voice permission, offline inference after download, deletion controls, and action confirmation on several physical devices.
6. Resolve pre-launch report findings, confirm all model and software notices, then promote through closed/open testing to production according to the publisher’s chosen rollout.

## Store-listing draft

**App name:** Open Assistant  
**Short description:** Private on-device AI chat and voice assistant with user-approved actions.  
**Full description:** Open Assistant keeps conversations on your device and runs its supported AI models locally after you choose to download them. Speak or type a request, review local results, and approve every external action before it happens. The app does not silently send messages, post content, make purchases, or change external accounts.

## Practical cost limits

The app can avoid per-message cloud AI fees after models are downloaded, but **“completely free” does not mean zero operational cost**. Google Play account registration, publisher compliance, user device storage, network data for model downloads, ongoing maintenance, and support remain real constraints. Google Play billing and programme terms should be checked directly in the publisher’s Play Console before release.

[1]: https://docs.swmansion.com/react-native-executorch/ "React Native ExecuTorch documentation"
[2]: https://support.google.com/googleplay/android-developer/answer/10144311 "Google Play Data safety requirements"
