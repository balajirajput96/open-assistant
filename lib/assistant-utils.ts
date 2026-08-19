export type ProposedAction = {
  id: string;
  title: string;
  description: string;
  kind: "draft" | "open-link";
  href?: string;
  status: "awaiting-review" | "completed" | "declined";
  createdAt: string;
};

export function createProposalFromPrompt(text: string): ProposedAction | null {
  const url = text.match(/https?:\/\/[^\s]+/i)?.[0];
  const mentionsSending = /\b(send|email|mail|message|post|share)\b/i.test(text);
  const mentionsOpening = /\b(open|visit|website|link)\b/i.test(text);

  if (url && mentionsOpening) {
    return {
      id: `action-${Date.now()}`,
      title: "Open a link",
      description: "This will open the supplied link outside Open Assistant. No message or purchase will be made.",
      kind: "open-link",
      href: url,
      status: "awaiting-review",
      createdAt: new Date().toISOString(),
    };
  }

  if (mentionsSending) {
    return {
      id: `action-${Date.now()}`,
      title: "Create a local draft",
      description: "Open Assistant will prepare a draft only. It will not send, post, or modify another account.",
      kind: "draft",
      status: "awaiting-review",
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}

export function trimConversation<T>(items: T[], maxItems = 12) {
  return items.slice(Math.max(0, items.length - maxItems));
}
