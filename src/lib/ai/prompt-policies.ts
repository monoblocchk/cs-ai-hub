import type { DraftStyle, ResolvedGuidance } from "@/lib/ai/types";
import type { Conversation } from "@/lib/mock-data";

export const GLOBAL_BRAND_GUIDE = `
You are drafting outbound customer replies for Monoblocc.

Be clear, commercially aware, and grounded in the known product facts.
Do not invent compatibility claims, shipping guarantees, or policy promises.
Keep public replies lean. Keep private replies useful and direct.
The operator remains in control and may edit or send your draft.
`.trim();

const DEFAULT_CHANNEL_GUIDANCE: Record<string, string> = {
  "instagram-comments":
    "This is a public short-form space. Keep the reply compact, useful, and human. Avoid sounding like support macros.",
  "instagram-dm":
    "This is a private social conversation. Be conversational, creator-aware, and concise without becoming sloppy.",
  email:
    "Use a more precise and complete support tone. Avoid overpromising and answer with structured clarity.",
  whatsapp:
    "Keep replies short, mobile-friendly, and natural. Favor quick clarity over full-form explanation.",
};

const DEFAULT_STYLE_GUIDANCE: Record<DraftStyle, string> = {
  support: "Answer the customer's question directly first. Remove fluff. Be practical and reassuring.",
  sales: "Answer the question while adding one relevant product-value angle, but do not sound pushy.",
  short: "Use the shortest useful version that still answers the customer clearly.",
  formal: "Sound composed, precise, and tidy. Reduce slang and hype language.",
  hype: "Sound energetic and brand-forward, but stay grounded and avoid cringe or exaggeration.",
};

export function resolveGuidance(
  conversation: Conversation,
  overrides: {
    channel: string;
    styles: Record<DraftStyle, string>;
  },
): ResolvedGuidance {
  const channelBase =
    DEFAULT_CHANNEL_GUIDANCE[conversation.channelId] ??
    "Keep the reply context-aware, useful, and aligned with Monoblocc's brand voice.";
  const channelOverride = overrides.channel.trim();

  const guidanceNotes: string[] = [];

  if (channelOverride) {
    guidanceNotes.push("Custom channel guidance active");
  }

  const styleInstructions = Object.fromEntries(
    (Object.keys(DEFAULT_STYLE_GUIDANCE) as DraftStyle[]).map((style) => {
      const styleOverride = overrides.styles[style]?.trim() ?? "";

      if (styleOverride) {
        guidanceNotes.push(`${style} guidance override active`);
      }

      return [
        style,
        [DEFAULT_STYLE_GUIDANCE[style], styleOverride].filter(Boolean).join("\nAdditional guidance: "),
      ];
    }),
  ) as Record<DraftStyle, string>;

  return {
    channelInstruction: [channelBase, channelOverride].filter(Boolean).join("\nAdditional channel guidance: "),
    guidanceNotes,
    styleInstructions,
  };
}
