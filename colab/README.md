# GPT-OSS Colab and Drive Workspace

This folder contains a **Colab-only** bootstrap for a persistent Google Drive workspace. It is deliberately independent of the Open Assistant mobile application.

Open `gpt_oss_drive_bootstrap.ipynb` in Google Colab only after signing in to the Google account that owns the target Drive. The first executable cell asks Colab to mount Drive through Google's normal authorization flow; no credential, password, OTP, API key, or browser session is stored in this repository.

The bootstrap creates the workspace below without deleting existing data:

```text
MyDrive/AI_Assistant/GPT_OSS_Colab/
├── models/
├── model_cache/
├── manifests/
├── notebooks/
├── logs/
├── configs/
├── documents/
├── knowledge_base/
├── vector_db/
├── memory/
└── checkpoints/
```

It performs a hardware, CUDA, Drive-storage, and model-download gate before permitting any GPT-OSS download. By default, downloads are disabled. The `openai/gpt-oss-120b` path requires an 80GB-class GPU and a conservative 150GiB of free Drive capacity; these checks must pass before the notebook enables a download. If the requirement is not met, the notebook records the explicit block rather than attempting an infeasible transfer.
