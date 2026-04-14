# Phase 8: Cross-Source Memory, Dedupe, and Automation Candidates

## Goal
Use imported Intercom and Gorgias history to improve future answers without bloating prompts or losing source truth.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [phase-05-intercom-historical-import.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-05-intercom-historical-import.md)
- [phase-06-gorgias-read-sync.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-06-gorgias-read-sync.md)

## Work Scope
- customer identity graph
- duplicate candidate scoring
- merged-history UI state
- customer-level summaries
- intent-level summaries
- similar-conversation retrieval
- macro candidates from recurring answers
- style-guide candidate extraction
- product/policy knowledge candidates

## Dedupe Signals
- email
- phone
- Instagram/social handle
- customer name
- order IDs
- subject similarity
- message text similarity
- timestamp proximity
- migration metadata if available

## Memory Rules
- preserve raw source records
- never auto-merge low-confidence records
- do not treat unreviewed historical answers as final policy truth
- require human approval before generated macros, style guidance, or knowledge cards become active
- retrieve only compact summaries/examples into draft prompts

## Done Criteria
- likely Intercom-to-Gorgias duplicates can be reviewed
- the app can retrieve relevant historical examples for a new draft
- macro/style/knowledge suggestions are generated as reviewable candidates, not hidden prompt changes
