# Phase 5: Send Actions and Audit

## Goal
Close the loop from draft to final sent message.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [gorgias-capability-matrix.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/gorgias-capability-matrix.md)

## Work Scope
- send approved reply through Gorgias
- persist generated variants
- persist chosen variant
- persist edited text
- persist final send result
- failure and retry handling

## Guardrail
Do not add undocumented moderation or reaction actions in this phase.

## Done Criteria
- every sent message has an auditable generation trail
- operator can trust what was generated, changed, and sent
