import type {
  DraftGenerationResponse,
  ModelProfileId,
  ProviderRouteId,
} from "@/lib/ai/types";
import type { AdminState } from "@/lib/admin/types";

export type EvalExperiment = {
  additionalGuidance: string;
  enabled: boolean;
  id: string;
  label: string;
  modelOverride: string;
  profileId: ModelProfileId;
  providerRouteId: ProviderRouteId;
};

export type EvalRunResult = {
  additionalGuidance: string;
  completedAt: string;
  durationMs: number;
  experimentId: string;
  experimentLabel: string;
  modelOverride: string;
  notes: string;
  profileId: ModelProfileId;
  providerRouteId: ProviderRouteId;
  response: DraftGenerationResponse;
  score: number | null;
  winner: boolean;
};

export type EvalRun = {
  channelId: string;
  conversationId: string;
  conversationLabel: string;
  createdAt: string;
  id: string;
  results: EvalRunResult[];
  summary: string;
};

export type EvalState = {
  experiments: EvalExperiment[];
  runs: EvalRun[];
  selectedConversationId: string;
  updatedAt: string;
};

export type EvalRunRequest = {
  adminState: AdminState;
  conversationId: string;
  experiments: EvalExperiment[];
};
