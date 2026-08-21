import * as db from "./db";

export const DEFAULT_MAINTENANCE_REPOSITORIES = [
  "balajirajput96/open-assistant",
  "balajirajput96/gmail-resume-mailer",
  "balajirajput96/atlas-ai-assistant",
  "balajirajput96/infra-tools",
] as const;

export type MaintenanceStatus = "success" | "blocked" | "error";
export type RepositoryHealth = {
  repository: string;
  state: "success" | "blocked" | "error";
  conclusion: string | null;
  runUrl: string | null;
  detail: string;
};

export type MaintenanceRunResult = {
  status: MaintenanceStatus;
  repositoriesChecked: number;
  failedRepositories: number;
  summary: string;
  details: RepositoryHealth[];
};

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export type FetchLike = (input: string, init?: RequestInit) => Promise<FetchResponse>;
type PersistRun = (run: MaintenanceRunResult) => Promise<void>;
type ReserveCycle = (maxCycles: number) => Promise<{ cycleNumber: number } | null>;
type CompleteCycle = (cycleNumber: number, run: MaintenanceRunResult) => Promise<void>;

const MAX_ATTEMPTS = 2;
const MIN_INTERVAL_MS = 15 * 60 * 1000;
const DEFAULT_INTERVAL_MS = 60 * 60 * 1000;
export const DEFAULT_MAX_MAINTENANCE_CYCLES = 2400;

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function stateForConclusion(conclusion: string | null): RepositoryHealth["state"] {
  if (conclusion === "success") return "success";
  if (conclusion === "queued" || conclusion === "in_progress" || conclusion === "cancelled" || conclusion === null) {
    return "blocked";
  }
  return "error";
}

function readLatestRun(payload: unknown): { conclusion: string | null; htmlUrl: string | null } | null {
  if (!payload || typeof payload !== "object") return null;
  const runs = (payload as { workflow_runs?: unknown }).workflow_runs;
  if (!Array.isArray(runs) || runs.length === 0) return null;
  const latest = runs[0];
  if (!latest || typeof latest !== "object") return null;
  const record = latest as { conclusion?: unknown; html_url?: unknown; status?: unknown };
  const conclusion = typeof record.conclusion === "string"
    ? record.conclusion
    : typeof record.status === "string"
      ? record.status
      : null;
  return {
    conclusion,
    htmlUrl: typeof record.html_url === "string" ? record.html_url : null,
  };
}

async function requestWithRetry(
  url: string,
  token: string,
  fetchImpl: FetchLike,
): Promise<FetchResponse> {
  let lastResponse: FetchResponse | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (response.ok || response.status < 500 || attempt === MAX_ATTEMPTS - 1) return response;
    lastResponse = response;
    await delay(250 * (attempt + 1));
  }
  return lastResponse as FetchResponse;
}

export async function runMaintenanceCheck({
  token,
  repositories = [...DEFAULT_MAINTENANCE_REPOSITORIES],
  fetchImpl = fetch as unknown as FetchLike,
}: {
  token?: string;
  repositories?: string[];
  fetchImpl?: FetchLike;
}): Promise<MaintenanceRunResult> {
  if (!token) {
    return {
      status: "blocked",
      repositoriesChecked: 0,
      failedRepositories: 0,
      summary: "Maintenance token is unavailable; no GitHub requests were made.",
      details: [],
    };
  }

  const details: RepositoryHealth[] = [];
  for (const repository of repositories) {
    try {
      const response = await requestWithRetry(
        `https://api.github.com/repos/${repository}/actions/runs?per_page=1`,
        token,
        fetchImpl,
      );
      if (!response.ok) {
        details.push({
          repository,
          state: response.status === 401 || response.status === 403 ? "blocked" : "error",
          conclusion: null,
          runUrl: null,
          detail: `GitHub Actions query returned HTTP ${response.status}.`,
        });
        continue;
      }

      const latest = readLatestRun(await response.json());
      if (!latest) {
        details.push({
          repository,
          state: "blocked",
          conclusion: null,
          runUrl: null,
          detail: "No GitHub Actions workflow run was found.",
        });
        continue;
      }

      details.push({
        repository,
        state: stateForConclusion(latest.conclusion),
        conclusion: latest.conclusion,
        runUrl: latest.htmlUrl,
        detail: `Latest workflow conclusion: ${latest.conclusion ?? "unknown"}.`,
      });
    } catch {
      details.push({
        repository,
        state: "error",
        conclusion: null,
        runUrl: null,
        detail: "GitHub Actions query failed after bounded retry.",
      });
    }
  }

  const failedRepositories = details.filter((entry) => entry.state === "error").length;
  const blockedRepositories = details.filter((entry) => entry.state === "blocked").length;
  const status: MaintenanceStatus = failedRepositories > 0 ? "error" : blockedRepositories > 0 ? "blocked" : "success";
  return {
    status,
    repositoriesChecked: details.length,
    failedRepositories,
    summary: `${details.length} repositories checked: ${failedRepositories} error, ${blockedRepositories} blocked, ${details.length - failedRepositories - blockedRepositories} successful.`,
    details,
  };
}

export class MaintenanceWorker {
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private readonly options: {
      token?: string;
      enabled?: boolean;
      intervalMs?: number;
      repositories?: string[];
      fetchImpl?: FetchLike;
      persistRun?: PersistRun;
      reserveCycle?: ReserveCycle;
      completeCycle?: CompleteCycle;
      maxCycles?: number;
    },
  ) {}

  async runOnce(): Promise<MaintenanceRunResult | null> {
    if (this.running) return null;
    this.running = true;
    try {
      const reserveCycle = this.options.reserveCycle ?? db.reserveMaintenanceCycle;
      const reservation = await reserveCycle(this.options.maxCycles ?? DEFAULT_MAX_MAINTENANCE_CYCLES);
      if (!reservation) {
        const result: MaintenanceRunResult = {
          status: "blocked",
          repositoriesChecked: 0,
          failedRepositories: 0,
          summary: "Maintenance cycle limit is exhausted or durable state is unavailable; no GitHub requests were made.",
          details: [],
        };
        console.warn(`[Maintenance] ${result.status}: ${result.summary}`);
        return result;
      }

      const result = await runMaintenanceCheck({
        token: this.options.token,
        repositories: this.options.repositories,
        fetchImpl: this.options.fetchImpl,
      });
      if (this.options.persistRun) await this.options.persistRun(result);
      const completeCycle = this.options.completeCycle ?? (async (cycleNumber, run) => {
        await db.completeMaintenanceCycle(cycleNumber, {
          ...run,
          details: JSON.stringify(run.details),
        });
      });
      await completeCycle(reservation.cycleNumber, result);
      console.info(`[Maintenance] ${result.status}: ${result.summary}`);
      return result;
    } finally {
      this.running = false;
    }
  }

  start() {
    if (!this.options.enabled || this.timer) return;
    const intervalMs = Math.max(this.options.intervalMs ?? DEFAULT_INTERVAL_MS, MIN_INTERVAL_MS);
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

export function startMaintenanceWorker() {
  const worker = new MaintenanceWorker({
    enabled: process.env.MAINTENANCE_ENABLED === "true",
    token: process.env.GITHUB_MAINTENANCE_TOKEN,
    maxCycles: Number.parseInt(process.env.MAINTENANCE_MAX_CYCLES ?? "", 10) || DEFAULT_MAX_MAINTENANCE_CYCLES,
  });
  worker.start();
  return worker;
}
