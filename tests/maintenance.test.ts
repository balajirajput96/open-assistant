import { describe, expect, it, vi } from "vitest";
import { MaintenanceWorker, runMaintenanceCheck } from "../server/maintenance";

function jsonResponse(payload: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

describe("maintenance worker", () => {
  it("classifies successful, queued, and failed repository workflows", async () => {
    const responses = [
      jsonResponse({ workflow_runs: [{ conclusion: "success", html_url: "https://example.test/success" }] }),
      jsonResponse({ workflow_runs: [{ status: "queued", html_url: "https://example.test/queued" }] }),
      jsonResponse({ workflow_runs: [{ conclusion: "failure", html_url: "https://example.test/failure" }] }),
    ];
    const result = await runMaintenanceCheck({
      token: "test-token",
      repositories: ["owner/success", "owner/queued", "owner/failure"],
      fetchImpl: vi.fn(async () => responses.shift()!) as never,
    });

    expect(result.status).toBe("error");
    expect(result.repositoriesChecked).toBe(3);
    expect(result.failedRepositories).toBe(1);
    expect(result.details.map((entry) => entry.state)).toEqual(["success", "blocked", "error"]);
  });

  it("does not make an external request without a configured token", async () => {
    const fetchImpl = vi.fn();
    const result = await runMaintenanceCheck({ repositories: ["owner/repository"], fetchImpl });

    expect(result.status).toBe("blocked");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("prevents overlapping runs and persists a completed check", async () => {
    const persistRun = vi.fn(async () => undefined);
    const worker = new MaintenanceWorker({
      token: "test-token",
      repositories: ["owner/repository"],
      fetchImpl: vi.fn(async () => jsonResponse({ workflow_runs: [{ conclusion: "success" }] })) as never,
      persistRun,
    });

    const [first, second] = await Promise.all([worker.runOnce(), worker.runOnce()]);
    expect(first?.status).toBe("success");
    expect(second).toBeNull();
    expect(persistRun).toHaveBeenCalledTimes(1);
  });
});
