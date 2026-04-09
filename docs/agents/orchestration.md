# Agent Orchestration Guide

## Purpose
Run implementation in narrow slices so future agents can work longer with less context overhead.

## Global Rules
- Read [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md) first
- Read only the specific phase file needed for the current task
- Do not load every phase document unless the task truly spans multiple phases
- Prefer normalized internal contracts over provider-specific payloads
- Keep write scope limited to the phase you are executing

## Recommended Execution Order
1. [phase-01-ui-and-mock-data.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-01-ui-and-mock-data.md)
2. [phase-02-ai-drafting-on-template-data.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-02-ai-drafting-on-template-data.md)
3. [phase-03-knowledge-and-guidance.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-03-knowledge-and-guidance.md)
4. [phase-04-gorgias-read-sync.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-04-gorgias-read-sync.md)
5. [phase-05-send-actions-and-audit.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-05-send-actions-and-audit.md)
6. [phase-06-evals-ops-and-experiments.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-06-evals-ops-and-experiments.md)

## Handoff Rules
- At the end of each phase, write down assumptions in code comments or docs only when they affect the next phase
- Keep provider, model, and prompt policy identifiers explicit
- Avoid hidden behavior or magic defaults

## Context Minimization
- UI work should not require reading Gorgias docs files
- Gorgias sync work should not require reading every UI refinement
- Evals work should consume normalized logs instead of raw thread implementation details

## If a Phase Is Blocked
- document the blocker
- do not expand scope into the next phase
- leave the smallest useful artifact that unblocks the next run
