# Model and Provider Strategy

## Goal
Keep the product provider-agnostic so Monoblocc can test models by task, by channel, and by style without rewriting application code.

## Decision
Do not commit the product to a single provider contract.

Instead:
- build a small provider adapter layer
- store model profiles in config or database
- route each AI task through a named model profile
- support overrides for experiments

## Recommendation

### Product Recommendation
Use a provider abstraction from day one.

### Operational Recommendation
For the first usable AI phase, prefer one of these setups:

1. Direct provider adapters plus a registry
2. Vercel AI Gateway if you want one endpoint, provider switching, and easier experiments

### Why Not Hardwire OpenRouter
OpenRouter is useful for experimentation and model access breadth, but I would not make it the only production dependency on day one. It is better as an adapter in the provider layer than as the entire architecture.

## Suggested Architecture

### Runtime Shape
- `ProviderAdapter`: one adapter per provider
- `ModelProfile`: reusable config for a specific task
- `GenerationRequest`: normalized internal request
- `GenerationResult`: normalized internal output

### Example Provider Adapters
- `openai-direct`
- `google-direct`
- `openrouter`
- `vercel-ai-gateway`

### Example Model Profiles
- `draft_fast`
- `draft_quality`
- `summary_fast`
- `summary_quality`
- `classify_fast`
- `knowledge_ingest_long_context`

### Override Scopes
- global default
- channel default
- style default
- experiment override
- manual operator override later

## Practical Recommendation for Monoblocc

### Phase 2
Start with:
- one fast draft profile
- one higher-quality draft profile
- one summary profile

### Phase 3
Add:
- per-channel default model profile
- per-style override
- experiment logging and A/B comparison support

### Phase 4+
Only after real traffic:
- add fallbacks
- add quality routing for channel classes
- add automatic experiment scoring if useful

## Evaluation Strategy
Do not evaluate models only by vibes. Store:
- prompt version
- provider
- model
- latency
- tokens
- operator edits
- whether the draft was sent as-is, edited, or discarded

This gives a practical quality proxy before any heavier eval framework exists.

## Current Provider View
As of 2026-04-09:

### OpenAI
- Best choice when reliability, direct support, and stable first-party access matter most
- Good default for production if you want fewer moving parts

### Google Gemini
- Attractive for low-cost experimentation and free-tier testing
- Good candidate for summary, classification, and some draft profiles if quality fits

### OpenRouter
- Good for fast experimentation across many models behind one OpenAI-compatible API
- Better treated as an optional provider adapter than the only backbone

### Vercel AI Gateway
- Good fit if the product remains on Next.js/Vercel and you want unified routing plus provider switching

## Why This Fits the User Request
This setup allows:
- different models for different purposes
- per-channel testing
- per-style testing
- gradual optimization without architecture rewrites

## Initial Implementation Rule
Phase 2 must work with mock/template conversations before Gorgias sync exists.

That means the AI stack should depend only on normalized internal conversation objects, not on raw Gorgias payloads.

## Current Source Notes
- Vercel documents that AI Gateway can act as the default provider for the AI SDK and centralize provider selection: [Vercel AI Gateway models and providers](https://vercel.com/docs/ai-gateway/models-and-providers)
- OpenRouter documents an OpenAI-compatible API, routing options, and free-model considerations: [OpenRouter docs](https://openrouter.ai/docs/quickstart), [OpenRouter model routing](https://openrouter.ai/docs/features/provider-routing)
- Google documents Gemini API pricing and rate-limit concepts separately from model docs, including free-tier availability for some usage tiers: [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- OpenAI documents current API model access and pricing through first-party docs: [OpenAI docs](https://platform.openai.com/docs), [OpenAI pricing](https://platform.openai.com/docs/pricing)
