import type { DraftStyle, ModelProfile, ProviderRoute } from "@/lib/ai/types";

export const DRAFT_STYLE_ORDER: DraftStyle[] = ["support", "sales", "short", "formal", "hype"];

export const DRAFT_STYLE_LABELS: Record<DraftStyle, string> = {
  support: "Support",
  sales: "Sales",
  short: "Short",
  formal: "Formal",
  hype: "Hype",
};

export const MODEL_PROFILES: Record<ModelProfile["id"], ModelProfile> = {
  draft_fast: {
    id: "draft_fast",
    label: "Draft Fast",
    description: "Lower-latency drafting for quick iteration and lightweight channels.",
    temperature: 0.55,
  },
  draft_quality: {
    id: "draft_quality",
    label: "Draft Quality",
    description: "Higher-context drafting for more polished customer-ready variants.",
    temperature: 0.4,
  },
};

export const PROVIDER_ROUTES: Record<ProviderRoute["id"], ProviderRoute> = {
  mock: {
    id: "mock",
    label: "Mock Studio",
    description: "Local template-backed drafts. Works without any API credentials.",
    defaultModels: {
      draft_fast: "template-fast-v1",
      draft_quality: "template-quality-v1",
    },
  },
  "openai-direct": {
    id: "openai-direct",
    label: "OpenAI Direct",
    description: "Uses OpenAI directly through the OpenAI-compatible Chat Completions endpoint.",
    baseUrl: "https://api.openai.com/v1",
    tokenEnv: "OPENAI_API_KEY",
    defaultModels: {
      draft_fast: "gpt-5-mini",
      draft_quality: "gpt-5.1",
    },
  },
  "gemini-direct": {
    id: "gemini-direct",
    label: "Gemini Direct",
    description: "Uses Gemini through Google's OpenAI-compatible endpoint.",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    tokenEnv: "GEMINI_API_KEY",
    defaultModels: {
      draft_fast: "gemini-2.5-flash",
      draft_quality: "gemini-2.5-pro",
    },
  },
  "vercel-ai-gateway": {
    id: "vercel-ai-gateway",
    label: "Vercel AI Gateway",
    description: "Routes model calls through Vercel AI Gateway using its OpenAI-compatible endpoint.",
    baseUrl: "https://ai-gateway.vercel.sh/v1",
    tokenEnv: "AI_GATEWAY_API_KEY",
    defaultModels: {
      draft_fast: "google/gemini-2.5-flash",
      draft_quality: "openai/gpt-5.1",
    },
  },
};
