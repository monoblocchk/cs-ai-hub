# Phase 4: Gorgias Read Sync

## Goal
Replace mock conversation input with real Gorgias data while keeping the UI and AI contract stable.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [gorgias-capability-matrix.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/gorgias-capability-matrix.md)

## Work Scope
- auth and secrets handling
- backfill jobs
- live sync or polling/webhook flow
- normalization into internal conversation/message schema
- dedupe logic
- retry logic

## Guardrail
Do not leak raw Gorgias payload assumptions into the UI or AI layer. Map them into internal types first.

## Done Criteria
- live conversations load into the existing inbox without UI rewrites
- outbound and inbound history both exist in the normalized store
