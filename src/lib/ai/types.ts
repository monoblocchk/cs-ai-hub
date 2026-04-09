import type { Channel, Conversation, KnowledgeCard } from "@/lib/mock-data";

export type DraftStyle = "support" | "sales" | "short" | "formal" | "hype";
export type ModelProfileId = "draft_fast" | "draft_quality";
export type ProviderRouteId = "mock" | "openai-direct" | "gemini-direct" | "vercel-ai-gateway";

export type DraftCandidate = {
  key: DraftStyle;
  label: string;
  body: string;
  rationale: string;
  recommended: boolean;
};

export type GuidanceOverrides = {
  channel: string;
  styles: Record<DraftStyle, string>;
};

export type DraftGenerationRequest = {
  channel: Channel;
  conversation: Conversation;
  guidanceOverrides: GuidanceOverrides;
  knowledgeCards: KnowledgeCard[];
  modelOverride?: string;
  profileId: ModelProfileId;
  providerRouteId: ProviderRouteId;
  styles?: DraftStyle[];
};

export type DraftGenerationDiagnostics = {
  generatedAt: string;
  guidanceNotes: string[];
  model: string;
  profileDescription: string;
  profileId: ModelProfileId;
  profileLabel: string;
  providerLabel: string;
  providerRouteId: ProviderRouteId;
  usedFallback: boolean;
  warning?: string;
};

export type DraftGenerationResponse = {
  diagnostics: DraftGenerationDiagnostics;
  drafts: DraftCandidate[];
};

export type ModelProfile = {
  description: string;
  id: ModelProfileId;
  label: string;
  temperature: number;
};

export type ProviderRoute = {
  baseUrl?: string;
  defaultModels: Record<ModelProfileId, string>;
  description: string;
  id: ProviderRouteId;
  label: string;
  tokenEnv?: string;
};

export type ProviderConnectionStatus = {
  activeInRuntime: boolean;
  description: string;
  id: ProviderRouteId;
  isBuiltIn: boolean;
  label: string;
  requiresRestart: boolean;
  savedToEnvFile: boolean;
  tokenEnv?: string;
};

export type ResolvedGuidance = {
  channelInstruction: string;
  guidanceNotes: string[];
  styleInstructions: Record<DraftStyle, string>;
};
