# Model and Runtime Attribution

Open Assistant uses downloadable on-device model assets. This file must be included in the repository and reviewed before each release because a model package or registry version can change.

| Component | Intended role | Licence / source | Release requirement |
| --- | --- | --- | --- |
| Qwen3-0.6B | Local text generation | Qwen announces the Qwen3-0.6B dense model under Apache 2.0.[1] | Retain the Apache 2.0 notice and identify the model in the app’s Settings and store listing. |
| Whisper Tiny | Local speech recognition | The OpenAI Whisper repository states that its code and model weights are under MIT.[2] | Retain the MIT notice and confirm the exact converted asset’s provenance before shipping. |
| React Native ExecuTorch | Mobile inference runtime | MIT-licensed open-source runtime.[3] | Retain the library licence and test the exact dependency version in the release build. |
| React Native Audio API | Microphone PCM capture | Open-source dependency used by the native speech flow.[4] | Retain its licence notice and provide the microphone rationale in the app and store disclosure. |

> **Release safeguard:** This document records the intended upstream sources. Before publishing a build, verify the exact model-file URL, checksum, model card, and licence bundled or downloaded by the selected dependency version. Do not silently substitute a different model.

[1]: https://qwenlm.github.io/blog/qwen3/ "Qwen — Qwen3: Think Deeper, Act Faster"
[2]: https://github.com/openai/whisper "OpenAI Whisper repository"
[3]: https://github.com/software-mansion/react-native-executorch "React Native ExecuTorch repository"
[4]: https://github.com/software-mansion/react-native-audio-api "React Native Audio API repository"
