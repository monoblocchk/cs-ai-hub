# Phase 2: AI Drafting on Template Data

## Goal
Make the app genuinely useful with AI before any Gorgias sync exists.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [model-provider-strategy.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/model-provider-strategy.md)

## Work Scope
- normalized conversation-to-prompt contract
- draft generation route/service
- structured variant output
- provider adapter layer
- model profile config
- mocked result logging

## Required Behaviors
- generate 5 styles in fixed order
- support one recommended flag
- accept channel and style guidance inputs
- support model selection by profile

## Do Not Do
- real Gorgias sync
- advanced auto-routing by confidence
- autonomous send

## Done Criteria
- template conversations can generate usable drafts
- switching model profiles does not require UI rewrites
- prompt policy inputs are already represented in the AI request contract
