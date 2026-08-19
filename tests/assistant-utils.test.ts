import { describe, expect, it } from "vitest";

import { createProposalFromPrompt, trimConversation } from "../lib/assistant-utils";

describe("assistant action guardrails", () => {
  it("creates a review-only draft proposal for a sending request", () => {
    const proposal = createProposalFromPrompt("Please email the team an update");
    expect(proposal?.kind).toBe("draft");
    expect(proposal?.status).toBe("awaiting-review");
  });

  it("requires a link and explicit opening intent before proposing a link action", () => {
    expect(createProposalFromPrompt("Open https://example.com")).toMatchObject({ kind: "open-link" });
    expect(createProposalFromPrompt("Here is https://example.com")).toBeNull();
  });

  it("keeps only the most recent conversation entries", () => {
    expect(trimConversation([1, 2, 3, 4], 2)).toEqual([3, 4]);
  });
});
