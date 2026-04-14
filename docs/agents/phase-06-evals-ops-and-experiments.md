# Superseded: Evals, Ops, and Experiments Moved to Phase 4

This file is retained for backward compatibility. Use [phase-04-evals-ops-and-experiments.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/agents/phase-04-evals-ops-and-experiments.md) for current implementation instructions.

# Former Phase 6: Evals, Ops, and Experiments

## Goal
Improve quality, speed, and cost with evidence.

## Inputs
- [spec-v1.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/spec-v1.md)
- [model-provider-strategy.md](D:/OneDrive/Monoblocc%20CS%20AI%20Hub/docs/model-provider-strategy.md)

## Work Scope
- experiment registry
- model/profile comparison
- prompt version comparison
- latency, token, and error logging
- lightweight operator feedback signals

## Suggested Early Metrics
- sent as-is rate
- edited before send rate
- discarded draft rate
- average edit distance before send
- generation latency

## Done Criteria
- model and prompt changes can be judged with real usage data
- the team can answer which model profile works best for which channel/style combination
