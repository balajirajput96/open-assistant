import { describe, expect, it } from "vitest";

const credentialTest = process.env.GITHUB_MAINTENANCE_TOKEN ? it : it.skip;

describe("GitHub maintenance credential", () => {
  credentialTest("authenticates against the GitHub user endpoint when configured", async () => {
    const token = process.env.GITHUB_MAINTENANCE_TOKEN;
    expect(token, "GITHUB_MAINTENANCE_TOKEN must be configured").toBeTruthy();

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as { login?: string };
    expect(body.login).toBeTruthy();
  }, 20_000);
});
