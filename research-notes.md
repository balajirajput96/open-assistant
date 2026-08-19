# Architecture Research Notes

## Verified product constraints

Voice input is sensitive data. The U.S. Federal Trade Commission advises users to understand when an assistant is listening, review the service’s privacy policy, and retain the ability to delete stored recordings. The first release will therefore use an explicit press-to-talk control rather than an always-listening wake word, show microphone state clearly, and provide local-history deletion.[1]

Google Play classifies microphone data as personal and sensitive user data. Its policy requires transparent handling, a runtime permission before permission-gated access, a valid privacy policy, accurate Data safety disclosure, and secure transmission for any sensitive information that leaves the device.[2] The release plan will minimize collection, make cloud processing opt-in, and keep the initial conversation history local by default.

## Product decisions informed by these constraints

| Decision | Implementation direction | Why it is appropriate |
| --- | --- | --- |
| Voice interaction | Press-to-talk; visible recording state; no background listening | Reduces unexpected recording risk and supports clear user intent. |
| Conversation memory | AsyncStorage on device, with a prominent clear-history control | Supports useful continuity without making an account or cloud database mandatory. |
| External actions | Review sheet plus explicit confirmation before every outward side effect | Avoids silent posting, sending, purchases, or account modification. |
| AI services | A configurable provider layer with transparent limits and opt-in cloud use | "Free" endpoints have quotas and terms; no app can reliably promise unlimited free AI. |
| Play Store | Privacy policy, Data safety answers, permissions rationale, and visible support information before submission | Required compliance work for a voice-enabled Android release. |

## Free AI service reality

An unlimited, zero-cost, production-quality AI API is not a dependable foundation for a public app. For example, Google’s Gemini Developer API currently offers limited free-tier access, but states that free-tier content may be used to improve its products; its higher-volume tier changes that data-use condition but is paid.[3] The app will therefore separate a **no-key local utility mode** from optional cloud AI provider modes, explain the privacy and quota tradeoff before activation, and never label a third-party quota as unlimited or permanently free.

## Representative public feedback

One popular community discussion about a hands-free Android agent received positive comments for the concept while commenters asked for voice input and technical details. Its author also described using screen content for real-time server processing, which illustrates why users need a visible explanation of what is sent off-device.[4] This is anecdotal feedback, not population-level evidence; it reinforces, rather than replaces, the privacy-first approval model above.

## On-device model direction

A maintained React Native project from Callstack demonstrates that on-device LLM execution can be paired with local model management and an Expo example application.[5] However, it relies on native runtime code and downloaded model files, so it cannot be tested in the standard Expo Go client or bundled as a tiny initial download. The implementation will use a **development build / Play Store binary**, an explicit model-download screen, storage and network checks, and an unavailable-model state; it will not pretend an on-device model works in every browser preview.

The initial app will isolate the inference runtime behind a TypeScript adapter. This lets the UI, local conversation storage, voice controls, action approval, and privacy features work immediately, while native inference can be integrated in the Android build without coupling core application state to a specific model runtime.

Expo’s technical guidance confirms that local inference creates material battery, heat, RAM, storage, model-delivery, and device-performance tradeoffs.[6] React Native ExecuTorch presents a practical Android/iOS route and documents support for LLM, speech-to-text, and text-to-speech models that can be bundled or downloaded for offline inference.[7] For the first Android release, the preferred runtime is therefore **React Native ExecuTorch in a custom development / production build**, with a compact downloaded model selected only after licence and device testing. This excludes standard Expo Go as the test target for inference itself.

The initial selectable text model is **Qwen3-0.6B, quantized for mobile delivery**, because the upstream Qwen announcement places Qwen3-0.6B among its Apache-2.0 licensed dense models.[8] This is a model-weight licence finding, not a claim about suitability for every use case. The product will expose its model name, require an intentional download, and include attribution before release.

## References

[1]: https://consumer.ftc.gov/articles/how-secure-your-voice-assistant-protect-your-privacy "Federal Trade Commission — How To Secure Your Voice Assistant and Protect Your Privacy"
[2]: https://support.google.com/googleplay/android-developer/answer/10144311?hl=en "Google Play Console Help — User Data"
[3]: https://ai.google.dev/gemini-api/docs/pricing "Google AI for Developers — Gemini Developer API pricing"
[4]: https://www.reddit.com/r/SideProject/comments/1lne2f2/i_created_ai_assistant_that_runs_your_android/ "r/SideProject — Hands-free Android assistant discussion"
[5]: https://github.com/callstackincubator/ai "Callstack Incubator — React Native AI"
[6]: https://expo.dev/blog/how-to-run-ai-models-with-react-native-executorch "Expo Blog — How to run AI models with React Native ExecuTorch"
[7]: https://executorch.swmansion.com/ "React Native ExecuTorch documentation"
[8]: https://qwenlm.github.io/blog/qwen3/ "Qwen — Qwen3: Think Deeper, Act Faster"
