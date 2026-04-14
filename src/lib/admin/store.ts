import { promises as fs } from "node:fs";
import path from "node:path";
import type { DraftStyle } from "@/lib/ai/types";
import type { AdminState, ManagedKnowledgeCard, ManagedWebSource } from "@/lib/admin/types";
import { channels, knowledgeCards } from "@/lib/mock-data";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const ADMIN_STATE_FILE = path.join(DATA_DIRECTORY, "admin-state.json");

function createEmptyStyleGuidance(): Record<DraftStyle, string> {
  return {
    support: "",
    sales: "",
    short: "",
    formal: "",
    hype: "",
  };
}

const DEFAULT_KNOWLEDGE_MATCH_TERMS: Record<string, string> = {
  "creator-bundle": "creator bundle, starter bundle, upgrading desk rig, cable cleanliness, camera stability",
  "desk-clamp-fit": "desk clamp, clamp fit, desk thickness, thick edge, cable tray, 55 mm, compatibility",
  "magic-arm-kit": "magic arm, mirrorless camera, mic, webcam, flexible positioning, angle changes, overhead",
  "shipping-sla": "shipping, dispatch, courier, delivery, label created, order status, business days",
  "single-rod-mount": "single rod, fixed mount, compact desk, overhead shot, clean footprint, simple setup",
};

const DEFAULT_KNOWLEDGE_CHANNELS: Record<string, string[]> = {
  "creator-bundle": ["instagram-comments", "instagram-dm", "website-chat"],
  "desk-clamp-fit": ["email", "website-chat", "whatsapp"],
  "magic-arm-kit": ["instagram-comments", "instagram-dm", "website-chat", "facebook"],
  "shipping-sla": ["email", "whatsapp", "website-chat"],
  "single-rod-mount": ["instagram-comments", "instagram-dm", "email", "website-chat"],
};

function seedKnowledgeCards(): ManagedKnowledgeCard[] {
  const now = new Date().toISOString();

  return knowledgeCards.map((card) => ({
    ...card,
    channelIds: DEFAULT_KNOWLEDGE_CHANNELS[card.id] ?? [],
    matchTerms: DEFAULT_KNOWLEDGE_MATCH_TERMS[card.id] ?? "",
    sourceType: card.source.startsWith("http") || card.source.includes(".com/")
      ? "web"
      : "manual",
    status: "active",
    updatedAt: now,
  }));
}

function seedWebSources(): ManagedWebSource[] {
  const now = new Date().toISOString();

  return [
    {
      id: "source-magic-arm-kit",
      label: "Magic Arm Kit product page",
      note: "Primary product source for flexible creator rig recommendations.",
      status: "active",
      updatedAt: now,
      url: "https://monoblocc.com/products/magic-arm-kit",
    },
    {
      id: "source-single-rod-mount",
      label: "Single Rod Mount product page",
      note: "Used when a cleaner fixed setup is the better answer.",
      status: "active",
      updatedAt: now,
      url: "https://monoblocc.com/products/single-rod-mount",
    },
    {
      id: "source-shipping",
      label: "Shipping policy page",
      note: "Grounding for dispatch and courier timing replies.",
      status: "active",
      updatedAt: now,
      url: "https://monoblocc.com/shipping",
    },
  ];
}

export function createDefaultAdminState(): AdminState {
  return {
    ai: {
      channelGuidanceByChannelId: Object.fromEntries(
        channels.map((channel) => [channel.id, ""]),
      ),
      modelOverride: "",
      profileId: "draft_quality",
      providerRouteId: "mock",
      styleGuidance: createEmptyStyleGuidance(),
    },
    gorgias: {
      accountDomain: "",
      defaultInboxMode: "mock",
      email: "",
      lastConnectionSummary: "",
      lastPreviewAt: "",
      ticketLimit: 8,
    },
    intercom: {
      conversationLimit: 12,
      defaultInboxMode: "mock",
      importedSince: "",
      importedUntil: "",
      lastImportAt: "",
      lastImportSummary: "",
      region: "us",
    },
    knowledge: {
      cards: seedKnowledgeCards(),
      webSources: seedWebSources(),
    },
    updatedAt: new Date().toISOString(),
  };
}

function normalizeManagedCard(card: Partial<ManagedKnowledgeCard>, fallbackTime: string): ManagedKnowledgeCard {
  return {
    body: card.body ?? "",
    channelIds: Array.isArray(card.channelIds)
      ? card.channelIds.filter((channelId): channelId is string => typeof channelId === "string")
      : DEFAULT_KNOWLEDGE_CHANNELS[card.id ?? ""] ?? [],
    freshness: card.freshness ?? "Manual note",
    id: card.id ?? `knowledge-${Math.random().toString(36).slice(2, 10)}`,
    matchTerms: card.matchTerms ?? DEFAULT_KNOWLEDGE_MATCH_TERMS[card.id ?? ""] ?? "",
    source: card.source ?? "",
    sourceType: card.sourceType === "web" ? "web" : "manual",
    status: card.status === "draft" ? "draft" : "active",
    title: card.title ?? "Untitled knowledge card",
    type: card.type === "Policy" || card.type === "Usage" ? card.type : "Product",
    updatedAt: card.updatedAt ?? fallbackTime,
  };
}

function normalizeWebSource(source: Partial<ManagedWebSource>, fallbackTime: string): ManagedWebSource {
  return {
    id: source.id ?? `source-${Math.random().toString(36).slice(2, 10)}`,
    label: source.label ?? "Untitled source",
    note: source.note ?? "",
    status: source.status === "paused" ? "paused" : "active",
    updatedAt: source.updatedAt ?? fallbackTime,
    url: source.url ?? "",
  };
}

export function normalizeAdminState(raw: Partial<AdminState> | null | undefined): AdminState {
  const defaults = createDefaultAdminState();
  const fallbackTime = new Date().toISOString();

  return {
    ai: {
      channelGuidanceByChannelId: {
        ...defaults.ai.channelGuidanceByChannelId,
        ...(raw?.ai?.channelGuidanceByChannelId ?? {}),
      },
      modelOverride: raw?.ai?.modelOverride ?? defaults.ai.modelOverride,
      profileId:
        raw?.ai?.profileId === "draft_fast" ? "draft_fast" : defaults.ai.profileId,
      providerRouteId:
        raw?.ai?.providerRouteId &&
        ["mock", "openai-direct", "gemini-direct", "vercel-ai-gateway"].includes(
          raw.ai.providerRouteId,
        )
          ? raw.ai.providerRouteId
          : defaults.ai.providerRouteId,
      styleGuidance: {
        ...defaults.ai.styleGuidance,
        ...(raw?.ai?.styleGuidance ?? {}),
      },
    },
    gorgias: {
      accountDomain: raw?.gorgias?.accountDomain ?? defaults.gorgias.accountDomain,
      defaultInboxMode:
        raw?.gorgias?.defaultInboxMode === "gorgias-preview"
          ? "gorgias-preview"
          : defaults.gorgias.defaultInboxMode,
      email: raw?.gorgias?.email ?? defaults.gorgias.email,
      lastConnectionSummary:
        raw?.gorgias?.lastConnectionSummary ?? defaults.gorgias.lastConnectionSummary,
      lastPreviewAt: raw?.gorgias?.lastPreviewAt ?? defaults.gorgias.lastPreviewAt,
      ticketLimit:
        typeof raw?.gorgias?.ticketLimit === "number" &&
        raw.gorgias.ticketLimit >= 1 &&
        raw.gorgias.ticketLimit <= 50
          ? raw.gorgias.ticketLimit
          : defaults.gorgias.ticketLimit,
    },
    intercom: {
      conversationLimit:
        typeof raw?.intercom?.conversationLimit === "number" &&
        raw.intercom.conversationLimit >= 1 &&
        raw.intercom.conversationLimit <= 50
          ? raw.intercom.conversationLimit
          : defaults.intercom.conversationLimit,
      defaultInboxMode:
        raw?.intercom?.defaultInboxMode === "intercom-history"
          ? "intercom-history"
          : defaults.intercom.defaultInboxMode,
      importedSince: raw?.intercom?.importedSince ?? defaults.intercom.importedSince,
      importedUntil: raw?.intercom?.importedUntil ?? defaults.intercom.importedUntil,
      lastImportAt: raw?.intercom?.lastImportAt ?? defaults.intercom.lastImportAt,
      lastImportSummary:
        raw?.intercom?.lastImportSummary ?? defaults.intercom.lastImportSummary,
      region:
        raw?.intercom?.region === "eu" || raw?.intercom?.region === "au"
          ? raw.intercom.region
          : defaults.intercom.region,
    },
    knowledge: {
      cards: (raw?.knowledge?.cards ?? defaults.knowledge.cards).map((card) =>
        normalizeManagedCard(card, fallbackTime),
      ),
      webSources: (raw?.knowledge?.webSources ?? defaults.knowledge.webSources).map((source) =>
        normalizeWebSource(source, fallbackTime),
      ),
    },
    updatedAt: raw?.updatedAt ?? defaults.updatedAt,
  };
}

async function ensureDataDirectory() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
}

export async function readAdminState() {
  await ensureDataDirectory();

  try {
    const raw = await fs.readFile(ADMIN_STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as AdminState;
    return normalizeAdminState(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    const seeded = createDefaultAdminState();
    await writeAdminState(seeded);
    return seeded;
  }
}

export async function writeAdminState(nextState: Partial<AdminState>) {
  await ensureDataDirectory();
  const normalized = normalizeAdminState({
    ...nextState,
    updatedAt: new Date().toISOString(),
  });

  await fs.writeFile(
    ADMIN_STATE_FILE,
    JSON.stringify(normalized, null, 2),
    "utf8",
  );

  return normalized;
}
