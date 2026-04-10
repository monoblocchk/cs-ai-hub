"use client";

import { useMemo, useState } from "react";
import {
  DRAFT_STYLE_LABELS,
  DRAFT_STYLE_ORDER,
  MODEL_PROFILES,
  PROVIDER_ROUTES,
} from "@/lib/ai/catalog";
import type { ProviderConnectionStatus } from "@/lib/ai/types";
import type { AdminState } from "@/lib/admin/types";
import type {
  EvalExperiment,
  EvalRunResult,
  EvalState,
} from "@/lib/evals/types";
import type { Channel, Conversation } from "@/lib/mock-data";

type EvaluationWorkspaceProps = {
  adminState: AdminState;
  baselineExperiment: EvalExperiment;
  channels: Channel[];
  conversations: Conversation[];
  evalSaveMessage: string | null;
  isEvalDirty: boolean;
  isRunningEvaluations: boolean;
  isSavingEvalState: boolean;
  onAddExperiment: () => void;
  onBackToInbox: () => void;
  onDeleteExperiment: (experimentId: string) => void;
  onExperimentChange: (
    experimentId: string,
    patch: Partial<EvalExperiment>,
  ) => void;
  onResultChange: (
    runId: string,
    resultId: string,
    patch: Partial<Pick<EvalRunResult, "notes" | "score" | "winner">>,
  ) => void;
  onRunEvaluations: () => void;
  onSaveEvalState: () => void;
  onSelectConversation: (conversationId: string) => void;
  onSetWinner: (runId: string, resultId: string) => void;
  providerStatuses: ProviderConnectionStatus[];
  state: EvalState;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  return `${(durationMs / 1000).toFixed(1)} s`;
}

function buildProviderTone(
  providerRouteId: EvalExperiment["providerRouteId"],
  providerStatuses: ProviderConnectionStatus[],
) {
  const status = providerStatuses.find((entry) => entry.id === providerRouteId);

  if (providerRouteId === "mock") {
    return {
      label: "Mock",
      className: "bg-[var(--gray)] text-[var(--graphite)]",
    };
  }

  if (status?.activeInRuntime) {
    return {
      label: "Live",
      className: "bg-[#dcfce7] text-[#15803d]",
    };
  }

  if (status?.savedToEnvFile) {
    return {
      label: "Restart needed",
      className: "bg-[#fef3c7] text-[#b45309]",
    };
  }

  return {
    label: "Needs key",
    className: "bg-[#fff1ec] text-[var(--orange)]",
  };
}

export function EvaluationWorkspace({
  adminState,
  baselineExperiment,
  channels,
  conversations,
  evalSaveMessage,
  isEvalDirty,
  isRunningEvaluations,
  isSavingEvalState,
  onAddExperiment,
  onBackToInbox,
  onDeleteExperiment,
  onExperimentChange,
  onResultChange,
  onRunEvaluations,
  onSaveEvalState,
  onSelectConversation,
  onSetWinner,
  providerStatuses,
  state,
}: EvaluationWorkspaceProps) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === state.selectedConversationId,
    ) ?? conversations[0];
  const selectedChannel =
    channels.find((channel) => channel.id === selectedConversation?.channelId) ??
    channels[0];
  const selectedRun =
    (selectedRunId
      ? state.runs.find((run) => run.id === selectedRunId)
      : null) ??
    state.runs[0] ??
    null;
  const enabledExperiments = state.experiments.filter(
    (experiment) => experiment.enabled,
  );
  const totalRunCount = enabledExperiments.length + 1;
  const baselineProviderTone = buildProviderTone(
    baselineExperiment.providerRouteId,
    providerStatuses,
  );
  const baselineChannelGuidance =
    adminState.ai.channelGuidanceByChannelId[selectedChannel.id] ?? "";
  const styleSummary = useMemo(
    () =>
      DRAFT_STYLE_ORDER.filter(
        (style) => adminState.ai.styleGuidance[style].trim().length > 0,
      ),
    [adminState.ai.styleGuidance],
  );

  return (
    <section className="scroll-subtle min-h-[calc(100vh-1.5rem)] overflow-y-auto lg:col-span-2 xl:col-span-3">
      <div className="min-h-full bg-[var(--surface)] px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-6 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  Evaluation harness
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">
                  Scenario comparisons and model experiments
                </div>
                <p className="mt-2 max-w-[900px] text-[13px] leading-6 text-[var(--text-soft)]">
                  Run the same mock conversation against the current admin
                  baseline and any saved experiment slots, then score the
                  outputs before we connect live Gorgias data.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onBackToInbox}
                  className="h-10 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-4 text-[13px] font-medium text-[var(--text)] transition hover:bg-[var(--surface)]"
                >
                  Back to inbox
                </button>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    isEvalDirty
                      ? "bg-[#fff1ec] text-[var(--orange)]"
                      : "bg-[#dcfce7] text-[#15803d]"
                  }`}
                >
                  {isEvalDirty ? "Unsaved changes" : "Saved"}
                </span>
                <button
                  type="button"
                  onClick={onSaveEvalState}
                  disabled={isSavingEvalState || !isEvalDirty}
                  className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold text-white transition ${
                    isSavingEvalState || !isEvalDirty
                      ? "cursor-not-allowed bg-[#f1b8a6]"
                      : "bg-[var(--orange)] hover:opacity-92"
                  }`}
                >
                  {isSavingEvalState ? "Saving..." : "Save eval state"}
                </button>
                <button
                  type="button"
                  onClick={onRunEvaluations}
                  disabled={isRunningEvaluations}
                  className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold text-white transition ${
                    isRunningEvaluations
                      ? "cursor-not-allowed bg-[#373737]/60"
                      : "bg-[#373737] hover:opacity-92"
                  }`}
                >
                  {isRunningEvaluations
                    ? "Running experiments..."
                    : `Run ${totalRunCount} experiments`}
                </button>
              </div>
            </div>

            {evalSaveMessage ? (
              <div className="mt-4 rounded-[12px] bg-[var(--surface)] px-4 py-3 text-[12px] leading-5 text-[var(--text-soft)]">
                {evalSaveMessage}
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-6">
              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Scenario
                </div>

                <div className="mt-4 space-y-3">
                  {conversations.map((conversation) => {
                    const isSelected = conversation.id === selectedConversation?.id;
                    const channel =
                      channels.find((entry) => entry.id === conversation.channelId) ??
                      channels[0];

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => onSelectConversation(conversation.id)}
                        className={`block w-full rounded-[14px] border px-4 py-4 text-left transition ${
                          isSelected
                            ? "border-[var(--orange)] bg-[#fff1ec]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--orange)]/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gray)] text-[11px] font-semibold text-[var(--text)]">
                            {getInitials(conversation.customerName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="truncate text-[13px] font-semibold text-[var(--text)]">
                                {conversation.customerName}
                              </div>
                              <div className="mono text-[11px] text-[var(--text-soft)]">
                                {conversation.updatedAt}
                              </div>
                            </div>
                            <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                              {channel.label}
                            </div>
                            <p className="mt-2 line-clamp-3 text-[12px] leading-5 text-[var(--text-soft)]">
                              {conversation.latestCustomerMessage}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Latest customer prompt
                </div>
                <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                  <div className="text-[14px] font-semibold text-[var(--text)]">
                    {selectedConversation.customerName}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                    {selectedChannel.label} · {selectedConversation.intent}
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-[var(--text)]">
                    {selectedConversation.latestCustomerMessage}
                  </p>
                </div>
                <p className="mt-3 text-[12px] leading-5 text-[var(--text-soft)]">
                  {selectedConversation.summary}
                </p>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Run history
                </div>
                <div className="mt-4 space-y-2">
                  {state.runs.length ? (
                    state.runs.map((run) => (
                      <button
                        key={run.id}
                        type="button"
                        onClick={() => setSelectedRunId(run.id)}
                        className={`block w-full rounded-[12px] border px-4 py-3 text-left transition ${
                          selectedRun?.id === run.id
                            ? "border-[var(--orange)] bg-[#fff1ec]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--orange)]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-semibold text-[var(--text)]">
                              {run.summary}
                            </div>
                            <div className="mt-1 text-[11px] text-[var(--text-soft)]">
                              {run.results.length} experiment results
                            </div>
                          </div>
                          <div className="mono text-[11px] text-[var(--text-soft)]">
                            {new Date(run.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[12px] leading-5 text-[var(--text-soft)]">
                      No evaluation runs yet. Pick a scenario and run the baseline
                      plus your saved experiments.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Admin baseline
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-soft)]">
                      This always runs first and reflects the current AI setup workspace.
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${baselineProviderTone.className}`}
                  >
                    {baselineProviderTone.label}
                  </span>
                </div>

                <div className="mt-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-semibold text-[var(--text)]">
                        {baselineExperiment.label}
                      </div>
                      <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                        {PROVIDER_ROUTES[baselineExperiment.providerRouteId].label} /{" "}
                        {MODEL_PROFILES[baselineExperiment.profileId].label}
                        {baselineExperiment.modelOverride.trim()
                          ? ` / ${baselineExperiment.modelOverride.trim()}`
                          : ""}
                      </div>
                    </div>
                    <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                      fixed baseline
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3">
                      <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                        Channel guidance
                      </div>
                      <p className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                        {baselineChannelGuidance.trim() || "No additional channel guidance saved yet."}
                      </p>
                    </div>
                    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3">
                      <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                        Active style overrides
                      </div>
                      {styleSummary.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {styleSummary.map((style) => (
                            <span
                              key={style}
                              className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--text-soft)]"
                            >
                              {DRAFT_STYLE_LABELS[style]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                          No extra style guidance saved yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Saved experiments
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-soft)]">
                      Each slot adds a model path or prompt hypothesis on top of the baseline.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onAddExperiment}
                    className="h-10 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-4 text-[12px] font-semibold text-[var(--text)] transition hover:bg-[var(--surface)]"
                  >
                    Add experiment
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {state.experiments.map((experiment) => {
                    const providerTone = buildProviderTone(
                      experiment.providerRouteId,
                      providerStatuses,
                    );

                    return (
                      <article
                        key={experiment.id}
                        className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                              <input
                                value={experiment.label}
                                onChange={(event) =>
                                  onExperimentChange(experiment.id, {
                                    label: event.target.value,
                                  })
                                }
                                placeholder="Experiment label"
                                className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                              />
                              <select
                                value={experiment.providerRouteId}
                                onChange={(event) =>
                                  onExperimentChange(experiment.id, {
                                    providerRouteId:
                                      event.target.value as EvalExperiment["providerRouteId"],
                                  })
                                }
                                className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                              >
                                {Object.values(PROVIDER_ROUTES).map((route) => (
                                  <option key={route.id} value={route.id}>
                                    {route.label}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={experiment.profileId}
                                onChange={(event) =>
                                  onExperimentChange(experiment.id, {
                                    profileId:
                                      event.target.value as EvalExperiment["profileId"],
                                  })
                                }
                                className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                              >
                                {Object.values(MODEL_PROFILES).map((profile) => (
                                  <option key={profile.id} value={profile.id}>
                                    {profile.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
                              <input
                                value={experiment.modelOverride}
                                onChange={(event) =>
                                  onExperimentChange(experiment.id, {
                                    modelOverride: event.target.value,
                                  })
                                }
                                placeholder="Optional explicit model override"
                                className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                              />
                              <label className="flex h-11 items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] text-[var(--text)]">
                                <span>Enabled in runs</span>
                                <input
                                  type="checkbox"
                                  checked={experiment.enabled}
                                  onChange={(event) =>
                                    onExperimentChange(experiment.id, {
                                      enabled: event.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 accent-[var(--orange)]"
                                />
                              </label>
                            </div>

                            <textarea
                              value={experiment.additionalGuidance}
                              onChange={(event) =>
                                onExperimentChange(experiment.id, {
                                  additionalGuidance: event.target.value,
                                })
                              }
                              rows={4}
                              placeholder="Optional extra prompt steer for this experiment."
                              className="mt-3 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                            />
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${providerTone.className}`}
                            >
                              {providerTone.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => onDeleteExperiment(experiment.id)}
                              className="h-10 rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-4 text-[12px] font-semibold text-[#b91c1c] transition hover:bg-[#ffe4e6]"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Comparison results
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-soft)]">
                      Score outputs, mark a winner, and save notes for later tuning.
                    </div>
                  </div>
                  {selectedRun ? (
                    <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                      {new Date(selectedRun.createdAt).toLocaleString()}
                    </div>
                  ) : null}
                </div>

                {selectedRun ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                      <div className="text-[14px] font-semibold text-[var(--text)]">
                        {selectedRun.summary}
                      </div>
                      <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                        {selectedRun.results.length} results in this run
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      {selectedRun.results.map((result) => {
                        const recommendedDraft =
                          result.response.drafts.find((draft) => draft.recommended) ??
                          result.response.drafts[0];
                        const providerTone = buildProviderTone(
                          result.providerRouteId,
                          providerStatuses,
                        );

                        return (
                          <article
                            key={result.experimentId}
                            className={`rounded-[16px] border px-4 py-4 ${
                              result.winner
                                ? "border-[var(--orange)] bg-[#fff1ec]"
                                : "border-[var(--border)] bg-[var(--surface)]"
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-[15px] font-semibold text-[var(--text)]">
                                  {result.experimentLabel}
                                </div>
                                <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                                  {PROVIDER_ROUTES[result.providerRouteId].label} /{" "}
                                  {MODEL_PROFILES[result.profileId].label} /{" "}
                                  {result.response.diagnostics.model}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${providerTone.className}`}
                                >
                                  {providerTone.label}
                                </span>
                                <span className="rounded-full bg-[var(--white)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-soft)]">
                                  {formatDuration(result.durationMs)}
                                </span>
                              </div>
                            </div>

                            {recommendedDraft ? (
                              <div className="mt-4 rounded-[12px] border border-[var(--orange)] bg-[var(--white)] px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                                    {recommendedDraft.label}
                                  </span>
                                  <span className="rounded-full bg-[var(--orange)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                                    Recommended
                                  </span>
                                </div>
                                <p className="mt-2 text-[13px] leading-6 text-[var(--text)]">
                                  {recommendedDraft.body}
                                </p>
                              </div>
                            ) : null}

                            <div className="mt-4 space-y-3">
                              {result.response.drafts.map((draft) => (
                                <div
                                  key={draft.key}
                                  className="rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--white)] px-4 py-3"
                                >
                                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text)]">
                                    {draft.label}
                                  </div>
                                  <p className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                                    {draft.body}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                                  Human score
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onSetWinner(selectedRun.id, result.experimentId)}
                                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                    result.winner
                                      ? "bg-[var(--orange)] text-white"
                                      : "bg-[var(--surface)] text-[var(--text-soft)] hover:bg-[#fff1ec] hover:text-[var(--orange)]"
                                  }`}
                                >
                                  {result.winner ? "Winner" : "Mark winner"}
                                </button>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((score) => (
                                  <button
                                    key={score}
                                    type="button"
                                    onClick={() =>
                                      onResultChange(selectedRun.id, result.experimentId, {
                                        score,
                                      })
                                    }
                                    className={`h-9 min-w-9 rounded-full px-3 text-[12px] font-semibold transition ${
                                      result.score === score
                                        ? "bg-[var(--orange)] text-white"
                                        : "border border-[var(--border)] bg-[var(--white)] text-[var(--text-soft)] hover:border-[var(--orange)] hover:text-[var(--orange)]"
                                    }`}
                                  >
                                    {score}
                                  </button>
                                ))}
                              </div>

                              <textarea
                                value={result.notes}
                                onChange={(event) =>
                                  onResultChange(selectedRun.id, result.experimentId, {
                                    notes: event.target.value,
                                  })
                                }
                                rows={3}
                                placeholder="What felt stronger or weaker here?"
                                className="mt-3 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)] focus:bg-[var(--white)]"
                              />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-[12px] leading-5 text-[var(--text-soft)]">
                    No results yet. Run the current baseline and any enabled
                    experiments to populate side-by-side comparisons here.
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
