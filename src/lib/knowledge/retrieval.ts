import type { ManagedKnowledgeCard } from "@/lib/admin/types";
import type { Conversation, KnowledgeCard } from "@/lib/mock-data";

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "been",
  "before",
  "being",
  "between",
  "could",
  "does",
  "from",
  "have",
  "into",
  "just",
  "like",
  "more",
  "need",
  "only",
  "should",
  "that",
  "their",
  "then",
  "there",
  "this",
  "with",
  "would",
  "your",
]);

export type KnowledgeRetrievalHit = {
  card: ManagedKnowledgeCard;
  matchedTerms: string[];
  reasons: string[];
  score: number;
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function parseMatchTerms(value: string) {
  return value
    .split(/[\n,]+/)
    .map((term) => normalizeText(term))
    .filter(Boolean);
}

function addUnique(list: string[], value: string) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function buildConversationSearchText(conversation: Conversation) {
  return normalizeText(
    [
      conversation.channelId,
      conversation.customerMeta,
      conversation.intent,
      conversation.latestCustomerMessage,
      conversation.latestPreview,
      conversation.nextBestAction,
      conversation.summary,
      conversation.tags.join(" "),
    ].join(" "),
  );
}

function scoreKnowledgeCard(
  conversation: Conversation,
  card: ManagedKnowledgeCard,
  conversationText: string,
  conversationTokens: Set<string>,
) {
  const reasons: string[] = [];
  const matchedTerms: string[] = [];
  let score = 0;

  if (conversation.knowledgeIds.includes(card.id)) {
    score += 80;
    reasons.push("Linked to thread");
  }

  if (card.channelIds.length > 0) {
    if (!card.channelIds.includes(conversation.channelId)) {
      return null;
    }

    score += 12;
    reasons.push("Channel scoped");
  }

  for (const term of parseMatchTerms(card.matchTerms)) {
    if (conversationText.includes(term)) {
      score += term.includes(" ") ? 18 : 10;
      addUnique(matchedTerms, term);
    }
  }

  if (matchedTerms.length > 0) {
    reasons.push(`Matched ${matchedTerms.slice(0, 3).join(", ")}`);
  }

  const cardTokens = new Set(
    tokenize([card.title, card.body, card.source, card.type].join(" ")),
  );
  let overlapCount = 0;

  for (const token of cardTokens) {
    if (conversationTokens.has(token)) {
      overlapCount += 1;
    }
  }

  if (overlapCount > 0) {
    score += Math.min(overlapCount * 4, 28);
    reasons.push("Text similarity");
  }

  if (score === 0) {
    score = 1;
    reasons.push("Active fallback");
  }

  return {
    card,
    matchedTerms,
    reasons,
    score,
  };
}

export function resolveKnowledgeForConversation(
  conversation: Conversation,
  cards: ManagedKnowledgeCard[],
) {
  const conversationText = buildConversationSearchText(conversation);
  const conversationTokens = new Set(tokenize(conversationText));

  return cards
    .filter((card) => card.status === "active")
    .map((card) =>
      scoreKnowledgeCard(conversation, card, conversationText, conversationTokens),
    )
    .filter((hit): hit is KnowledgeRetrievalHit => Boolean(hit))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.card.updatedAt.localeCompare(left.card.updatedAt);
    });
}

export function toPromptKnowledgeCards(
  hits: KnowledgeRetrievalHit[],
): KnowledgeCard[] {
  return hits.map(({ card }) => ({
    body: card.body,
    freshness: card.freshness,
    id: card.id,
    source: card.source,
    title: card.title,
    type: card.type,
  }));
}
