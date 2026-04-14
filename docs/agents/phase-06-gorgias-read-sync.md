# Phase 6: Gorgias Read Sync

## Goal
Bring live Gorgias data into the normalized system after the drafting/eval layer is already usable.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [gorgias-capability-matrix.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/gorgias-capability-matrix.md)
- [phase-05-intercom-historical-import.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-05-intercom-historical-import.md)

## Work Scope
- Gorgias auth and secrets handling
- initial backfill or preview sync
- live sync or polling/webhook flow
- normalization into internal conversation/message schema
- source-aware badges and live/read-only states
- dedupe candidates against imported Intercom history
- retry and rate-limit handling

## Guardrail
Do not leak raw Gorgias payload assumptions into the UI or AI layer. Map them into internal types first.

## Required Behaviors
- source is `gorgias`
- channel maps to email, Instagram, WhatsApp, Facebook, etc. when known
- read-only preview must not enable send
- live mode can later enable send only after Phase 7 audit support exists
- migrated Intercom history should be linkable, not blindly duplicated

## Done Criteria
- live or preview Gorgias conversations load into the existing inbox without UI rewrites
- outbound and inbound history both exist in the normalized store
- Gorgias records can be compared or linked to imported Intercom records
