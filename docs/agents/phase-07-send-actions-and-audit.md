# Phase 7: Send Actions and Audit

## Goal
Close the loop from generated draft to final sent Gorgias message.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [gorgias-capability-matrix.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/gorgias-capability-matrix.md)
- [phase-06-gorgias-read-sync.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-06-gorgias-read-sync.md)

## Work Scope
- send approved reply through Gorgias
- persist generated variants
- persist chosen variant
- persist edited text
- persist final send result
- audit provider, model, prompt policy, and knowledge snippets used
- failure and retry handling

## Guardrail
Do not add undocumented moderation or reaction actions in this phase.

## Required Behaviors
- historical Intercom records remain not sendable
- Gorgias read-only preview records remain not sendable
- live Gorgias records can send only after audit record creation succeeds or is safely queued
- every send has a draft generation lineage

## Done Criteria
- every sent message has an auditable generation trail
- operator can trust what was generated, changed, and sent
