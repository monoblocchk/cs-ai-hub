import type { DraftStyle, ModelProfileId, ProviderRouteId } from "@/lib/ai/types";
import type { KnowledgeCard } from "@/lib/mock-data";

export type ManagedKnowledgeCard = KnowledgeCard & {
  channelIds: string[];
  matchTerms: string;
  sourceType: "manual" | "web";
  status: "active" | "draft";
  updatedAt: string;
};

export type ManagedWebSource = {
  id: string;
  label: string;
  note: string;
  status: "active" | "paused";
  updatedAt: string;
  url: string;
};

export type AdminState = {
  ai: {
    channelGuidanceByChannelId: Record<string, string>;
    modelOverride: string;
    profileId: ModelProfileId;
    providerRouteId: ProviderRouteId;
    styleGuidance: Record<DraftStyle, string>;
  };
  gorgias: {
    accountDomain: string;
    defaultInboxMode: "mock" | "gorgias-preview";
    email: string;
    lastConnectionSummary: string;
    lastPreviewAt: string;
    ticketLimit: number;
  };
  intercom: {
    conversationLimit: number;
    defaultInboxMode: "intercom-history" | "mock";
    importedSince: string;
    importedUntil: string;
    lastImportAt: string;
    lastImportSummary: string;
    region: "au" | "eu" | "us";
  };
  knowledge: {
    cards: ManagedKnowledgeCard[];
    webSources: ManagedWebSource[];
  };
  updatedAt: string;
};
