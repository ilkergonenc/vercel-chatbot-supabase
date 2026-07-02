export const DEFAULT_CHAT_MODEL = "gpt-4.1";

export const titleModel = {
  id: "gpt-4.1-mini",
  name: "GPT 4.1 Mini",
  provider: "openai",
  description: "Fast model for title generation",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "Flagship OpenAI model for complex chat and tool use",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT 4.1 Mini",
    provider: "openai",
    description: "Fast OpenAI model for everyday chat and tools",
  },
  {
    id: "o4-mini",
    name: "o4-mini",
    provider: "openai",
    description: "Compact OpenAI reasoning model",
    reasoningEffort: "low",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT 4o Mini",
    provider: "openai",
    description: "Fast multimodal OpenAI model",
  },
];

export const modelCapabilities: Record<string, ModelCapabilities> = {
  "gpt-4.1": { tools: true, vision: true, reasoning: false },
  "gpt-4.1-mini": { tools: true, vision: true, reasoning: false },
  "o4-mini": { tools: true, vision: true, reasoning: true },
  "gpt-4o-mini": { tools: true, vision: true, reasoning: false },
};

export function getCapabilities(): Record<string, ModelCapabilities> {
  return modelCapabilities;
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
