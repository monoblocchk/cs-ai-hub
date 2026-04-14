# Phase 5: Intercom Historical Import

## Goal
Import old Intercom conversations into the normalized system as history, eval fuel, and future memory before Gorgias is fully live.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [implementation-phases.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/implementation-phases.md)

## Work Scope
- private Intercom app token storage
- Intercom workspace configuration in admin settings
- read-only conversation import by date range and limit
- conversation and conversation-part normalization
- source-aware UI badges and filters
- historical/read-only state handling
- identity extraction for email, name, phone, and handles
- first-pass duplicate candidate metadata
- imported-history eval scenarios

## Source and Channel Rules
- `source` must be `intercom`
- `channel` should map to the customer surface when known, not to `intercom`
- imported Intercom history is not sendable by default
- raw external IDs must be preserved
- raw external payloads may be stored later, but UI/AI should consume normalized records

## Prompt/Memory Rules
- Do not inject entire Intercom history into every draft prompt
- First import normalized history and make it reviewable
- Later phases can build summaries, macros, style candidates, and retrieval indexes from approved/imported records

## Required Behaviors
- admin can save an Intercom access token
- admin can run a small read-only import or preview
- imported conversations show source badges and historical state
- imported conversations can be selected as eval scenarios
- importing the same external conversation twice should not duplicate the normalized thread

## Do Not Do
- build a public Intercom marketplace app
- send replies through Intercom
- auto-merge uncertain duplicates
- auto-promote generated macros or style guidance without approval

## Done Criteria
- private Intercom import works against the configured workspace
- imported history is visible but clearly historical/read-only
- imported records can improve eval coverage without requiring Gorgias

## Current Implementation Notes
- Intercom credentials are saved through `/api/intercom/credentials` using `INTERCOM_ACCESS_TOKEN` in `.env.local`
- Intercom history import runs through `/api/intercom/import` and persists the latest import to `data/intercom-import.json`
- Imported conversations are normalized to the shared `Conversation` shape with `source: "intercom"`, `historical: true`, and `readOnly: true`
- Inbox and evaluation workspaces show source badges so imported Intercom conversations can be used as eval scenarios without becoming sendable live threads
- Cross-source dedupe remains a later phase; the current phase preserves external IDs and customer identity hints but does not merge Intercom and Gorgias records
