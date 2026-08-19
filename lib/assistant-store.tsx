import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { createProposalFromPrompt, ProposedAction } from "@/lib/assistant-utils";

const STORAGE_KEY = "open-assistant.local-state.v1";

export type AssistantRole = "assistant" | "user" | "system";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  tone: "neutral" | "success" | "warning";
};

export type AssistantPreferences = {
  modelDownloadApproved: boolean;
  voiceModelDownloadApproved: boolean;
  autoSpeak: boolean;
  preferredLanguage: "en" | "hi";
};

type PersistedState = {
  messages: AssistantMessage[];
  activities: ActivityEntry[];
  actions: ProposedAction[];
  preferences: AssistantPreferences;
};

type AssistantStore = PersistedState & {
  hydrated: boolean;
  appendMessage: (role: AssistantRole, content: string) => AssistantMessage;
  addActivity: (title: string, detail: string, tone?: ActivityEntry["tone"]) => void;
  proposeActionForPrompt: (prompt: string) => ProposedAction | null;
  updateAction: (id: string, status: ProposedAction["status"]) => void;
  updatePreferences: (update: Partial<AssistantPreferences>) => void;
  clearLocalData: () => Promise<void>;
};

const welcomeMessage: AssistantMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "I run locally when your model is ready. I will always show you a review before an action can leave this device.",
  createdAt: new Date().toISOString(),
};

const initialPreferences: AssistantPreferences = {
  modelDownloadApproved: false,
  voiceModelDownloadApproved: false,
  autoSpeak: false,
  preferredLanguage: "en",
};

const AssistantContext = createContext<AssistantStore | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([welcomeMessage]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [actions, setActions] = useState<ProposedAction[]>([]);
  const [preferences, setPreferences] = useState<AssistantPreferences>(initialPreferences);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw || !active) return;
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        if (saved.messages?.length) setMessages(saved.messages);
        if (saved.activities) setActivities(saved.activities);
        if (saved.actions) setActions(saved.actions);
        if (saved.preferences) setPreferences({ ...initialPreferences, ...saved.preferences });
      })
      .catch(() => {
        if (active) {
          setActivities([
            {
              id: "storage-unavailable",
              title: "Local history is unavailable",
              detail: "The assistant will continue without saving this session.",
              createdAt: new Date().toISOString(),
              tone: "warning",
            },
          ]);
        }
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const data: PersistedState = { messages, activities, actions, preferences };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [messages, activities, actions, preferences, hydrated]);

  const value = useMemo<AssistantStore>(() => {
    const appendMessage = (role: AssistantRole, content: string) => {
      const message: AssistantMessage = {
        id: `message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, message]);
      return message;
    };

    const addActivity = (title: string, detail: string, tone: ActivityEntry["tone"] = "neutral") => {
      setActivities((current) => [
        {
          id: `activity-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          title,
          detail,
          createdAt: new Date().toISOString(),
          tone,
        },
        ...current,
      ]);
    };

    return {
      messages,
      activities,
      actions,
      preferences,
      hydrated,
      appendMessage,
      addActivity,
      proposeActionForPrompt: (prompt) => {
        const proposal = createProposalFromPrompt(prompt);
        if (proposal) {
          setActions((current) => [proposal, ...current]);
          addActivity("Action review created", proposal.title, "warning");
        }
        return proposal;
      },
      updateAction: (id, status) => {
        setActions((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      },
      updatePreferences: (update) => setPreferences((current) => ({ ...current, ...update })),
      clearLocalData: async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setMessages([welcomeMessage]);
        setActivities([]);
        setActions([]);
        setPreferences(initialPreferences);
      },
    };
  }, [actions, activities, hydrated, messages, preferences]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistantStore() {
  const value = useContext(AssistantContext);
  if (!value) throw new Error("useAssistantStore must be used inside AssistantProvider");
  return value;
}
