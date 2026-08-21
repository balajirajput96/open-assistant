# GPT-OSS-120B Pre-Download Feasibility Audit

## Executive assessment

The requested `openai/gpt-oss-120b` model is a public Apache-2.0 open-weight model, but the current sandbox is **not capable of downloading or running it**. The official model card reports 117B parameters, MXFP4 quantization, and an 80GB-class GPU requirement for the optimized single-GPU 120B implementation. The current environment has no NVIDIA GPU, approximately 2.7GB of available RAM, and approximately 29.3GiB of free disk. No model file, package, or large artifact was downloaded.[1]

> **Decision:** Do not start a model download in this sandbox. Doing so would exhaust storage before providing a runnable system.

## Verified model and runtime information

| Item | Verified finding | Consequence |
|---|---|---|
| Model repository | `openai/gpt-oss-120b` | Public model metadata was accessible without an API key. [1] |
| License | Apache-2.0 | Permissive licensing; retain applicable model documentation and usage policy. [1] |
| Scale | 117B model-card parameters | Far beyond mobile, free sandbox, and standard free notebook capacity. [1] |
| Weight/runtime format | MXFP4 with BF16 components | Requires a compatible optimized runtime. [1] [2] |
| Optimized 120B path | Single 80GB GPU using the documented Triton implementation | Requires high-end assigned compute; it is not provided by the current sandbox. [2] |
| Reference PyTorch path | Example multi-GPU configuration uses 4×H100 or 2×H200 | Not a free or standard Colab configuration. [2] |

## Current environment and account boundary

The sandbox capability snapshot is recorded in [`environment_report.json`](../environment_report.json). GitHub CLI is present and authenticated for the authorized user account. Google Cloud CLI, Gemini CLI, Antigravity CLI, Jules CLI, Hugging Face CLI, Docker, and Ollama are not installed. `nvidia-smi` is unavailable, confirming that no NVIDIA GPU is attached.

Google Colab is reachable in the browser but is currently signed out. Drive cannot be mounted, examined, or written until the user completes the official Google sign-in flow. No Google, Drive, browser, or Antigravity credential has been transferred or reused.

## Repository audit

The user-provided path `balaji966/gpt-oss-120b-bucket` was not resolvable through the authenticated GitHub API. The accessible related repository is [`balajirajput96/gpt-oss`](https://github.com/balajirajput96/gpt-oss), a public Apache-2.0 source repository containing deployment guidance, code, documentation, and tests. It is **not evidence that a model-weight bucket exists**, and no large files have been cloned or copied.

## Credential and storage decision

An Hugging Face API key is not needed for the public metadata and repository audit already completed. It may be needed later only if a selected artifact is gated, private, or requires authenticated Hub operations. If that becomes necessary, an approved secure input card will be used rather than chat text.

Google Colab's available accelerator, Drive capacity, and paid/free entitlement have not yet been measured because the browser session is signed out. An 80GB-GPU runtime should be treated as a prerequisite to validate—not an entitlement presumed from Google AI Pro or Antigravity access.

## Feasible next paths

| Route | Feasibility now | Requirement before setup |
|---|---|---|
| GPT-OSS-120B on Colab | Pending and likely constrained | User signs into Colab; verify an 80GB GPU, persistent Drive capacity, and runtime quota before any download. |
| GPT-OSS-20B variant | More practical but not in current sandbox | A GPU-backed environment with at least the model card's documented 16GB memory target. [1] |
| Existing Android Open Assistant | Already built and validated | Physical Android 13+ testing for on-device model/voice behavior. |

## References

[1]: https://huggingface.co/openai/gpt-oss-120b "OpenAI GPT-OSS-120B model card"

[2]: https://github.com/balajirajput96/gpt-oss "Accessible GPT-OSS reference repository and deployment guidance"
