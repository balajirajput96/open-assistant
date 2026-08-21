import { describe, expect, it } from "vitest";
import { runMaintenanceCheck } from "../server/maintenance";

const integrationTest = process.env.GITHUB_MAINTENANCE_TOKEN ? it : it.skip;

describe("maintenance GitHub Actions integration", () => {
  integrationTest("reads the latest Open Assistant workflow without mutating GitHub state when configured", async () => {
    const result = await runMaintenanceCheck({
      token: process.env.GITHUB_MAINTENANCE_TOKEN,
      repositories: ["balajirajput96/open-assistant"],
    });

    expect(result.repositoriesChecked).toBe(1);
    expect(result.details[0]?.repository).toBe("balajirajput96/open-assistant");
    expect(["success", "blocked", "error"]).toContain(result.status);
  }, 20_000);
});
