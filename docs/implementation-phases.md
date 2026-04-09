# Implementation Phases

## Phase 0: Specification and UX Lock
Goal: freeze the product shape before real integration work.

Outputs:
- product spec
- capability matrix
- provider strategy
- agent phase docs

Exit criteria:
- inbox workflow is agreed
- draft behavior is agreed
- known Gorgias unknowns are documented

## Phase 1: UI and Mock Conversations
Goal: prove the operator workflow with no external dependency.

Outputs:
- dense inbox UI
- conversation list behavior
- inline draft bubbles
- editor and send mock flow
- knowledge side rail

Exit criteria:
- operator can simulate real work on template data
- UX changes can happen quickly without backend drag

## Phase 2: AI Drafting on Template Data
Goal: create a functional AI product before Gorgias sync exists.

Outputs:
- normalized conversation input contract
- draft generation route/service
- structured 5-variant output
- provider abstraction
- model profiles

Exit criteria:
- app can generate drafts for stored mock threads
- model can be swapped by config
- send/edit behavior works on generated drafts

## Phase 3: Knowledge and Guidance Controls
Goal: make reply quality steerable.

Outputs:
- per-channel guidance
- per-style guidance
- knowledge source ingestion
- retrieval for knowledge rail and prompts
- admin editing controls or seed config

Exit criteria:
- operators can tune channel/style behavior without code edits
- retrieved snippets improve grounding

## Phase 4: Gorgias Read Sync
Goal: bring live data into the normalized system.

Outputs:
- Gorgias auth
- initial backfill
- webhook or pull sync
- channel and conversation normalization
- dedupe and retry handling

Exit criteria:
- live Gorgias threads populate the app reliably
- conversation states match Gorgias closely enough for operator use

## Phase 5: Send and Audit
Goal: close the human-in-the-loop loop.

Outputs:
- send approved messages through Gorgias
- audit records for draft, edit, and send
- error handling around send failures

Exit criteria:
- a draft can be generated, edited, sent, and audited end to end

## Phase 6: Evals, Analytics, and Experiments
Goal: improve quality and cost over time.

Outputs:
- operator feedback capture
- model/profile experiment framework
- latency and cost logging
- edit-distance style quality signals

Exit criteria:
- we can compare prompt sets and model profiles with real usage evidence

## Delivery Rule
Each phase should be buildable and testable in isolation. Do not block early AI validation on the Gorgias integration phase.
