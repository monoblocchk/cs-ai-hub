# Monoblocc Gorgias Drafting App Spec v1

## Purpose
Build an internal web app for Monoblocc that reads customer conversations from Gorgias, shows them in a dense operator-first inbox, and generates human-reviewed AI drafts inside the reply flow.

The system is not an autonomous chatbot in v1. It drafts, the user reviews, and the user sends.

## Product Outcome
The operator can:

1. Open a channel.
2. See individual conversations sorted by latest activity.
3. Spot unreplied customer messages immediately.
4. Open a thread and see recent history in a readable left/right conversation layout.
5. See draft options directly inside the thread.
6. Click a draft bubble to send immediately, or click the pen icon to load it into the editor first.
7. Ground replies on product knowledge and saved guidance without copying anything into a separate AI tool.

## Primary Users
- Primary user: Wolfgang / Monoblocc internal operator
- Future user: small internal team with admin and agent roles

## Core Scope v1
- Read conversations from Gorgias across supported channels
- Store normalized thread and message history
- Draft responses from full thread context plus product knowledge
- Let the user edit or send drafts manually
- Track what was generated, edited, and sent
- Support guidance prompts by channel and by style
- Support configurable model selection by task and override level

## Explicit Non-Goals v1
- No autonomous send
- No always-on chatbot behavior owned by this app
- No live self-training loop that rewrites prompts after every message
- No full CRM or helpdesk replacement
- No moderation actions unless public Gorgias API support is documented and verified

## UX Requirements

### Inbox Layout
- Left rail: channels
- Second column: conversations within selected channel
- Main column: message history and bottom reply editor
- Right rail: knowledge cards only in v1

### Conversation List
- Search at top
- Rows sorted by latest activity
- Unresponded customer messages stay light red until a human or approved draft reply is sent
- Selected row uses a neutral selected state, not a read-state assumption

### Thread View
- Customer and operator messages are visually separated by alignment and indentation
- Internal notes can exist as a separate visual treatment later
- Draft variants appear inline in the thread only when the latest state needs a reply

### Draft Bubble Interaction
- Fixed styles in this order: `Support`, `Sales`, `Short`, `Formal`, `Hype`
- One recommendation is highlighted
- Clicking the bubble sends directly
- Clicking the pen icon loads the draft into the editor for manual changes
- Draft bubbles must always look clearly provisional, not like already-sent messages

## Guidance System

### Why It Exists
The reply quality needs steering beyond a single static brand prompt. Monoblocc needs different guidance per channel and per reply intent.

### Guidance Layers
- Global brand guide
- Channel guide
- Style guide
- Optional product or campaign guide
- Optional one-off operator instruction for the current draft

### Channel Examples
- Instagram comments
- Instagram DMs
- Facebook comments
- Email
- WhatsApp

### Style Examples
- `Support`
- `Sales`
- `Short`
- `Formal`
- `Hype`

### Prompt Merge Order
Use this precedence, lowest to highest:

1. System base prompt
2. Global brand guide
3. Channel guide
4. Style guide
5. Conversation-specific operator note

Higher-precedence guidance can narrow or sharpen tone, but should not override hard safety rules.

### Admin Editing Requirement
Admins must be able to edit:
- per-channel guidance
- per-style guidance
- default recommendation rules by channel
- send/edit behavior labels later if needed

## AI Drafting Requirements

### Draft Outputs
- Generate exactly 5 variants in the v1 bubble set
- Return structured output with label, body, recommendation flag, and rationale fields
- The UI does not need to show rationale by default

### Context Assembly
Use layered context instead of dumping the full thread every time:

1. Latest customer message
2. Recent turns window
3. Rolling thread summary
4. Relevant knowledge snippets
5. Guidance stack
6. Channel metadata

### Thread Compression
- Keep a token-bounded recent-turn window
- Maintain a rolling summary refreshed on a cadence, not every message
- Refresh summary after meaningful changes such as every 10 messages, or after a human send on longer threads

### Recommendation Rules
Initial recommendation logic can be rule-based:
- `Short` for public short-form channels such as Instagram comments
- `Support` for support-style channels by default

Later this can become configurable in admin settings.

## Knowledge System
- Curated product URLs
- Curated support/help URLs
- Manual long-form internal notes
- Retrieved snippets shown in the right rail
- Retrieval is over the knowledge base, not the full message archive, in v1

## Data Model Summary
- `channels`
- `conversations`
- `messages`
- `draft_generations`
- `draft_variants`
- `knowledge_sources`
- `knowledge_documents`
- `prompt_policies`
- `model_profiles`
- `audit_events`

## Prompt Policy Model
`prompt_policies` should support:
- scope type: `global`, `channel`, `style`, `channel_style`
- scope key: for example `instagram-comments` or `support`
- status: `draft`, `active`, `archived`
- instruction body
- updated by / updated at

This gives the team a way to tune responses without redeploying code.

## Model Selection Requirements
- The app must not hardcode one provider or one model
- Model selection must exist per task, not only globally
- Phase 2 must support swapping models without changing application logic

Recommended task-level profiles:
- `draft_fast`
- `draft_quality`
- `thread_summary`
- `message_classification`
- `knowledge_ingest`

## Safety and Operations
- Always require human send approval in v1
- Keep full audit trail for generated text, edited text, and final sent text
- Store the model, provider, prompt policy versions, and knowledge snippets used for each generation
- Log provider errors, rate-limit responses, and generation latency

## Delivery Sequence
1. UI and mock data shell
2. AI on template/mock conversations
3. Knowledge and guidance controls
4. Gorgias read sync
5. Send through Gorgias
6. Evals, analytics, and provider experiments

## References
- See [model-provider-strategy.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/model-provider-strategy.md)
- See [gorgias-capability-matrix.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/gorgias-capability-matrix.md)
- See [implementation-phases.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/implementation-phases.md)
