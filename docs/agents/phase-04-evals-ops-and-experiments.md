# Phase 4: Evals, Ops, and Experiments

## Goal
Improve draft quality, speed, and cost with evidence before live send exists.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [model-provider-strategy.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/model-provider-strategy.md)

## Work Scope
- experiment registry
- model/profile comparison
- prompt version comparison
- latency, fallback, warning, and error logging
- operator feedback signals
- promote-winning-experiment workflow

## Required Behaviors
- run the same conversation through multiple experiment slots
- include the current admin baseline in each comparison
- persist run history, scores, notes, and winners
- allow a winner to be promoted into the admin baseline
- keep evals provider-agnostic

## Do Not Do
- send messages to Gorgias
- mutate historical imported conversations
- fine-tune a model automatically

## Done Criteria
- template conversations can be compared across models/prompts
- winning experiments can be promoted into saved admin settings
- operator can see latency, fallback/live status, provider, model, and warnings
