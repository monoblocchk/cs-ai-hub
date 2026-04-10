import { promises as fs } from "node:fs";
import path from "node:path";
import type { EvalExperiment, EvalState } from "@/lib/evals/types";
import { conversations } from "@/lib/mock-data";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const EVAL_STATE_FILE = path.join(DATA_DIRECTORY, "eval-state.json");

function createDefaultExperiments(): EvalExperiment[] {
  return [
    {
      additionalGuidance:
        "Bias toward direct answers and a lighter-touch public response.",
      enabled: true,
      id: "exp-fast-direct",
      label: "Fast direct",
      modelOverride: "",
      profileId: "draft_fast",
      providerRouteId: "mock",
    },
    {
      additionalGuidance:
        "Keep the answer polished and add one useful value angle if it fits naturally.",
      enabled: true,
      id: "exp-quality-sales",
      label: "Quality sales nudge",
      modelOverride: "",
      profileId: "draft_quality",
      providerRouteId: "mock",
    },
  ];
}

export function createDefaultEvalState(): EvalState {
  return {
    experiments: createDefaultExperiments(),
    runs: [],
    selectedConversationId: conversations[0]?.id ?? "",
    updatedAt: new Date().toISOString(),
  };
}

function normalizeExperiment(experiment: Partial<EvalExperiment>): EvalExperiment {
  return {
    additionalGuidance: experiment.additionalGuidance ?? "",
    enabled: typeof experiment.enabled === "boolean" ? experiment.enabled : true,
    id: experiment.id ?? `exp-${Math.random().toString(36).slice(2, 10)}`,
    label: experiment.label?.trim() || "Untitled experiment",
    modelOverride: experiment.modelOverride ?? "",
    profileId:
      experiment.profileId === "draft_fast" ? "draft_fast" : "draft_quality",
    providerRouteId:
      experiment.providerRouteId &&
      ["mock", "openai-direct", "gemini-direct", "vercel-ai-gateway"].includes(
        experiment.providerRouteId,
      )
        ? experiment.providerRouteId
        : "mock",
  };
}

export function normalizeEvalState(raw: Partial<EvalState> | null | undefined) {
  const defaults = createDefaultEvalState();

  return {
    experiments: (raw?.experiments ?? defaults.experiments).map((experiment) =>
      normalizeExperiment(experiment),
    ),
    runs: raw?.runs ?? defaults.runs,
    selectedConversationId:
      raw?.selectedConversationId &&
      conversations.some((conversation) => conversation.id === raw.selectedConversationId)
        ? raw.selectedConversationId
        : defaults.selectedConversationId,
    updatedAt: raw?.updatedAt ?? defaults.updatedAt,
  };
}

async function ensureDataDirectory() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
}

export async function readEvalState() {
  await ensureDataDirectory();

  try {
    const raw = await fs.readFile(EVAL_STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as EvalState;
    return normalizeEvalState(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    const seeded = createDefaultEvalState();
    await writeEvalState(seeded);
    return seeded;
  }
}

export async function writeEvalState(nextState: Partial<EvalState>) {
  await ensureDataDirectory();
  const normalized = normalizeEvalState({
    ...nextState,
    updatedAt: new Date().toISOString(),
  });

  await fs.writeFile(EVAL_STATE_FILE, JSON.stringify(normalized, null, 2), "utf8");

  return normalized;
}
