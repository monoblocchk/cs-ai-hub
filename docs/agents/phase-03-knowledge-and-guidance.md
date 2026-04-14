# Phase 3: Knowledge and Guidance

## Goal
Make outputs steerable and grounded.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [model-provider-strategy.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/model-provider-strategy.md)

## Work Scope
- prompt policy storage
- per-channel guidance
- per-style guidance
- knowledge source registry
- ingestion jobs or seed ingest flow
- retrieval contract for drafting

## Required Behaviors
- admin can edit guidance without code changes eventually
- AI request includes resolved guidance stack
- right rail and prompt retrieval use the same knowledge selection logic where practical

## Done Criteria
- output quality is steerable by channel and style
- product facts can be grounded from curated knowledge, not only memory

## Current Implementation Notes
- Admin state now stores editable per-channel guidance, per-style guidance, managed knowledge cards, and web source watchlist entries.
- Managed knowledge cards support `matchTerms` and `channelIds`; empty `channelIds` means the card can apply to all channels.
- `src/lib/knowledge/retrieval.ts` is the shared retrieval contract. It ranks active knowledge cards by explicit thread links, channel scope, keyword matches, and text similarity.
- Inbox drafting, the right-side knowledge rail, and eval runs all use the same retrieval path before sending knowledge cards into the draft prompt.
- Draft diagnostics include the number and IDs of selected knowledge snippets so generation runs remain auditable later.
