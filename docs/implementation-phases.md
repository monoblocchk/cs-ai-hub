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

## Phase 4: Evals, Analytics, and Experiments
Goal: improve draft quality, speed, and cost before live send exists.

Outputs:
- experiment registry
- model/profile comparison
- prompt version comparison
- latency, fallback, and error logging
- lightweight operator feedback signals
- promote-winning-experiment workflow

Exit criteria:
- model and prompt changes can be judged with evidence
- the team can promote a winner into the admin baseline
- eval scenarios work on mock/template data without external support data

## Phase 5: Intercom Historical Import
Goal: bring old Intercom conversations into the normalized system as history, eval fuel, and memory.

Outputs:
- private Intercom app token handling
- read-only conversation import
- source-aware conversation/message normalization
- source badges and historical/read-only UI labels
- customer identity extraction
- first-pass dedupe candidates
- imported-history eval scenarios
- future macro/style/knowledge extraction hooks

Exit criteria:
- Intercom conversations can be imported without Gorgias existing yet
- imported conversations do not appear as live-sendable threads
- imported history can be used for eval scenarios and memory review

## Phase 6: Gorgias Read Sync
Goal: bring live Gorgias data into the normalized system.

Outputs:
- Gorgias auth
- initial backfill or preview sync
- webhook or pull sync
- channel and conversation normalization
- dedupe and retry handling
- source badges and live/read-only states

Exit criteria:
- live Gorgias threads populate the app reliably
- conversation states match Gorgias closely enough for operator use
- Gorgias records can be compared or linked to imported Intercom history

## Phase 7: Send and Audit
Goal: close the human-in-the-loop loop.

Outputs:
- send approved reply through Gorgias
- persist generated variants
- persist chosen variant
- persist edited text
- persist final send result
- failure and retry handling

Exit criteria:
- every sent message has an auditable generation trail
- operator can trust what was generated, changed, and sent

## Phase 8: Cross-Source Memory, Dedupe, and Automation Candidates
Goal: use imported support history to improve future answers without bloating prompts.

Outputs:
- customer-level summaries
- intent-level summaries
- similar-conversation retrieval
- macro candidates from recurring Intercom/Gorgias answers
- style-guide candidate extraction
- product/policy knowledge candidates
- duplicate/merged-history review UI

Exit criteria:
- the app can retrieve relevant historical examples for a new draft
- generated macro/style/knowledge suggestions require human approval before becoming active
- likely Intercom-to-Gorgias duplicates can be reviewed without losing raw records

## Delivery Rule
Each phase should be buildable and testable in isolation. Do not block early AI validation on the Gorgias integration phase, and do not block Intercom historical import on Gorgias subscription status.
