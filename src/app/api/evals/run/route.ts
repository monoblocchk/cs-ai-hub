import { NextResponse } from "next/server";
import { generateDraftResponse } from "@/lib/ai/service";
import type { DraftGenerationRequest } from "@/lib/ai/types";
import type { ManagedKnowledgeCard } from "@/lib/admin/types";
import type {
  EvalExperiment,
  EvalRun,
  EvalRunRequest,
  EvalRunResult,
} from "@/lib/evals/types";
import { channels, conversations, type Conversation, type KnowledgeCard } from "@/lib/mock-data";

function getKnowledgeForConversation(
  conversation: Conversation,
  managedCards: ManagedKnowledgeCard[],
) {
  const activeCards = managedCards.filter((card) => card.status === "active");
  const referencedIds = new Set(conversation.knowledgeIds);
  const prioritized = activeCards.filter((card) => referencedIds.has(card.id));
  const supplemental = activeCards.filter((card) => !referencedIds.has(card.id));

  return [...prioritized, ...supplemental].slice(0, 6);
}

function toPromptKnowledgeCards(cards: ManagedKnowledgeCard[]): KnowledgeCard[] {
  return cards.map((card) => ({
    body: card.body,
    freshness: card.freshness,
    id: card.id,
    source: card.source,
    title: card.title,
    type: card.type,
  }));
}

function buildGuidanceChannel(
  baseChannelGuidance: string,
  experiment: EvalExperiment,
) {
  return [baseChannelGuidance, experiment.additionalGuidance]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n\n");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EvalRunRequest;
    const conversation = conversations.find(
      (entry) => entry.id === payload.conversationId,
    );

    if (!conversation) {
      return NextResponse.json(
        { error: "Unknown evaluation scenario." },
        { status: 400 },
      );
    }

    const selectedExperiments = payload.experiments.filter(
      (experiment) => experiment.enabled,
    );

    if (!selectedExperiments.length) {
      return NextResponse.json(
        { error: "Select at least one enabled experiment before running evaluations." },
        { status: 400 },
      );
    }

    const channel =
      channels.find((entry) => entry.id === conversation.channelId) ?? channels[0];
    const knowledgeCards = toPromptKnowledgeCards(
      getKnowledgeForConversation(conversation, payload.adminState.knowledge.cards),
    );
    const results: EvalRunResult[] = [];

    for (const experiment of selectedExperiments) {
      const startedAt = Date.now();
      const generationRequest: DraftGenerationRequest = {
        channel,
        conversation,
        guidanceOverrides: {
          channel: buildGuidanceChannel(
            payload.adminState.ai.channelGuidanceByChannelId[channel.id] ?? "",
            experiment,
          ),
          styles: payload.adminState.ai.styleGuidance,
        },
        knowledgeCards,
        modelOverride: experiment.modelOverride,
        profileId: experiment.profileId,
        providerRouteId: experiment.providerRouteId,
      };
      const response = await generateDraftResponse(generationRequest);

      results.push({
        additionalGuidance: experiment.additionalGuidance,
        completedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        experimentId: experiment.id,
        experimentLabel: experiment.label,
        modelOverride: experiment.modelOverride,
        notes: "",
        profileId: experiment.profileId,
        providerRouteId: experiment.providerRouteId,
        response,
        score: null,
        winner: false,
      });
    }

    const run: EvalRun = {
      channelId: conversation.channelId,
      conversationId: conversation.id,
      conversationLabel: conversation.customerName,
      createdAt: new Date().toISOString(),
      id: `run-${Date.now()}`,
      results,
      summary: `${conversation.customerName} on ${channel.label}`,
    };

    return NextResponse.json(run);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to run evaluation experiments.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
