import { DRAFT_STYLE_LABELS, DRAFT_STYLE_ORDER, MODEL_PROFILES, PROVIDER_ROUTES } from "@/lib/ai/catalog";
import { GLOBAL_BRAND_GUIDE, resolveGuidance } from "@/lib/ai/prompt-policies";
import type {
  DraftCandidate,
  DraftGenerationRequest,
  DraftGenerationResponse,
  DraftStyle,
  ProviderRoute,
} from "@/lib/ai/types";

function getRequestedStyles(request: DraftGenerationRequest): DraftStyle[] {
  if (!request.styles?.length) {
    return DRAFT_STYLE_ORDER;
  }

  const requestedStyles = DRAFT_STYLE_ORDER.filter((style) =>
    request.styles?.includes(style),
  );

  return requestedStyles.length > 0 ? requestedStyles : DRAFT_STYLE_ORDER;
}

function cleanModelOverride(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function getRecommendedStyle(channelId: string): DraftStyle {
  return channelId === "instagram-comments" || channelId === "whatsapp" ? "short" : "support";
}

function extractCompletionText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function extractJsonObject(text: string) {
  const normalized = text.trim();

  if (!normalized) {
    throw new Error("Model returned an empty response.");
  }

  const firstBrace = normalized.indexOf("{");
  const lastBrace = normalized.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Model response did not contain a JSON object.");
  }

  return JSON.parse(normalized.slice(firstBrace, lastBrace + 1)) as {
    recommendedKey?: string;
    variants?: Array<{
      body?: string;
      key?: string;
      rationale?: string;
    }>;
  };
}

function getFallbackDrafts(request: DraftGenerationRequest): DraftCandidate[] {
  const requestedStyles = getRequestedStyles(request);
  const recommendedKey = getRecommendedStyle(request.conversation.channelId);
  const supportDrafts = request.conversation.drafts.support;
  const salesDrafts = request.conversation.drafts.sales;
  const hypeDrafts = request.conversation.drafts.hype;

  const styleBodies: Record<DraftStyle, string> = {
    support: supportDrafts[0]?.body ?? request.conversation.latestCustomerMessage,
    sales: salesDrafts[0]?.body ?? supportDrafts[0]?.body ?? request.conversation.latestCustomerMessage,
    short: supportDrafts[1]?.body ?? supportDrafts[0]?.body ?? request.conversation.latestCustomerMessage,
    formal: supportDrafts[2]?.body ?? supportDrafts[0]?.body ?? request.conversation.latestCustomerMessage,
    hype: hypeDrafts[0]?.body ?? supportDrafts[0]?.body ?? request.conversation.latestCustomerMessage,
  };

  return requestedStyles.map((style) => ({
    key: style,
    label: DRAFT_STYLE_LABELS[style],
    body: styleBodies[style],
    rationale:
      style === recommendedKey
        ? "Recommended for this channel based on the current workflow rules."
        : "Template-backed fallback variant for local evaluation.",
    recommended: style === recommendedKey,
  }));
}

function normaliseDrafts(
  request: DraftGenerationRequest,
  parsed: {
    recommendedKey?: string;
    variants?: Array<{
      body?: string;
      key?: string;
      rationale?: string;
    }>;
  },
): DraftCandidate[] {
  const requestedStyles = getRequestedStyles(request);
  const recommendedKey = DRAFT_STYLE_ORDER.includes(parsed.recommendedKey as DraftStyle)
    ? (parsed.recommendedKey as DraftStyle)
    : getRecommendedStyle(request.conversation.channelId);

  const variantMap = new Map(
    (parsed.variants ?? [])
      .filter((variant): variant is { body: string; key: string; rationale?: string } =>
        typeof variant.key === "string" && typeof variant.body === "string",
      )
      .map((variant) => [variant.key.toLowerCase(), variant]),
  );

  return requestedStyles.map((style) => {
    const parsedVariant = variantMap.get(style);
    const fallback = getFallbackDrafts(request).find((draft) => draft.key === style);

    return {
      key: style,
      label: DRAFT_STYLE_LABELS[style],
      body: parsedVariant?.body?.trim() || fallback?.body || request.conversation.latestCustomerMessage,
      rationale:
        parsedVariant?.rationale?.trim() ||
        fallback?.rationale ||
        "Generated from the current thread context and guidance stack.",
      recommended: style === recommendedKey,
    };
  });
}

function buildPromptBody(request: DraftGenerationRequest, guidance: ReturnType<typeof resolveGuidance>) {
  const requestedStyles = getRequestedStyles(request);
  const recentMessages = request.conversation.messages.slice(-6).map((message) => ({
    author: message.authorName,
    direction: message.direction,
    timestamp: message.timestamp,
    type: message.authorType,
    body: message.body,
  }));

  const styleGuidance = Object.fromEntries(
    requestedStyles.map((style) => [style, guidance.styleInstructions[style]]),
  );

  return [
    requestedStyles.length === DRAFT_STYLE_ORDER.length
      ? "Generate five customer-ready draft reply variants for Monoblocc."
      : `Regenerate only these Monoblocc draft styles: ${requestedStyles.join(", ")}.`,
    "",
    "Return only valid JSON using this shape:",
    JSON.stringify(
      {
        recommendedKey: "support",
        variants: requestedStyles.map((style) => ({
          key: style,
          body: "",
          rationale: "",
        })),
      },
      null,
      2,
    ),
    "",
    "Rules:",
    `- Keep the variants in this exact order: ${requestedStyles.join(", ")}.`,
    "- Each body must be specific to the thread context.",
    "- The short variant should be the tightest useful answer.",
    "- The sales variant may add one relevant value angle, but cannot become pushy.",
    "- If policy or compatibility is uncertain, acknowledge the uncertainty instead of inventing facts.",
    "",
    "Conversation context:",
    JSON.stringify(
      {
        channel: request.channel.label,
        customer: request.conversation.customerName,
        intent: request.conversation.intent,
        latestCustomerMessage: request.conversation.latestCustomerMessage,
        summary: request.conversation.summary,
        nextBestAction: request.conversation.nextBestAction,
        tags: request.conversation.tags,
        recentMessages,
        knowledgeCards: request.knowledgeCards.map((card) => ({
          title: card.title,
          type: card.type,
          body: card.body,
        })),
        guidance: {
          brand: GLOBAL_BRAND_GUIDE,
          channel: guidance.channelInstruction,
          styles: styleGuidance,
        },
      },
      null,
      2,
    ),
  ].join("\n");
}

async function generateViaOpenAiCompatible(
  route: ProviderRoute,
  request: DraftGenerationRequest,
  guidance: ReturnType<typeof resolveGuidance>,
) {
  const token = route.tokenEnv ? process.env[route.tokenEnv] : undefined;

  if (!route.baseUrl || !route.tokenEnv || !token) {
    throw new Error(
      route.tokenEnv
        ? `Missing ${route.tokenEnv}. Falling back to local mock drafting.`
        : "Provider route is not configured for external generation.",
    );
  }

  const profile = MODEL_PROFILES[request.profileId];
  const model = cleanModelOverride(request.modelOverride) ?? route.defaultModels[request.profileId];
  const response = await fetch(`${route.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      temperature: profile.temperature,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert human-in-the-loop customer support drafting assistant. Produce only JSON and no markdown fences.",
        },
        {
          role: "user",
          content: buildPromptBody(request, guidance),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Provider returned ${response.status}. ${errorText.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const content = extractCompletionText(payload.choices?.[0]?.message?.content);
  const parsed = extractJsonObject(content);

  return {
    drafts: normaliseDrafts(request, parsed),
    model,
  };
}

export async function generateDraftResponse(
  request: DraftGenerationRequest,
): Promise<DraftGenerationResponse> {
  const route = PROVIDER_ROUTES[request.providerRouteId] ?? PROVIDER_ROUTES.mock;
  const profile = MODEL_PROFILES[request.profileId];
  const guidance = resolveGuidance(request.conversation, request.guidanceOverrides);

  try {
    if (route.id === "mock") {
      return {
        diagnostics: {
          generatedAt: new Date().toISOString(),
          guidanceNotes: guidance.guidanceNotes,
          model: route.defaultModels[request.profileId],
          profileDescription: profile.description,
          profileId: profile.id,
          profileLabel: profile.label,
          providerLabel: route.label,
          providerRouteId: route.id,
          usedFallback: true,
          warning: "Mock Studio is active. Add provider credentials to test real model behavior.",
        },
        drafts: getFallbackDrafts(request),
      };
    }

    const generated = await generateViaOpenAiCompatible(route, request, guidance);

    return {
      diagnostics: {
        generatedAt: new Date().toISOString(),
        guidanceNotes: guidance.guidanceNotes,
        model: generated.model,
        profileDescription: profile.description,
        profileId: profile.id,
        profileLabel: profile.label,
        providerLabel: route.label,
        providerRouteId: route.id,
        usedFallback: false,
      },
      drafts: generated.drafts,
    };
  } catch (error) {
    const warning =
      error instanceof Error ? error.message : "Draft generation failed. Falling back to local mock drafting.";

    return {
      diagnostics: {
        generatedAt: new Date().toISOString(),
        guidanceNotes: guidance.guidanceNotes,
        model: cleanModelOverride(request.modelOverride) ?? route.defaultModels[request.profileId],
        profileDescription: profile.description,
        profileId: profile.id,
        profileLabel: profile.label,
        providerLabel: PROVIDER_ROUTES.mock.label,
        providerRouteId: PROVIDER_ROUTES.mock.id,
        usedFallback: true,
        warning,
      },
      drafts: getFallbackDrafts(request),
    };
  }
}
