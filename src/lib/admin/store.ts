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

function seedKnowledgeCards(): ManagedKnowledgeCard[] {
  const now = new Date().toISOString();

  return knowledgeCards.map((card) => ({
    ...card,
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
    freshness: card.freshness ?? "Manual note",
    id: card.id ?? `knowledge-${Math.random().toString(36).slice(2, 10)}`,
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
