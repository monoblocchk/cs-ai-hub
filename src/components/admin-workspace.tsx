"use client";

import { useState } from "react";
import { MODEL_PROFILES, PROVIDER_ROUTES } from "@/lib/ai/catalog";
import type { DraftStyle, ProviderConnectionStatus } from "@/lib/ai/types";
import type { AdminState, ManagedKnowledgeCard, ManagedWebSource } from "@/lib/admin/types";
import type { GorgiasConnectionStatus } from "@/lib/gorgias/types";
import type { Channel } from "@/lib/mock-data";

const STYLE_FIELDS: Array<{ key: DraftStyle; label: string }> = [
  { key: "support", label: "Support" },
  { key: "sales", label: "Sales" },
  { key: "short", label: "Short" },
  { key: "formal", label: "Formal" },
  { key: "hype", label: "Hype" },
];

type AdminWorkspaceProps = {
  adminSaveMessage: string | null;
  channels: Channel[];
  credentialMessage: string | null;
  gorgiasConnectionStatus: GorgiasConnectionStatus | null;
  gorgiasCredentialMessage: string | null;
  gorgiasPreviewMessage: string | null;
  isAdminDirty: boolean;
  isRunningGorgiasPreview: boolean;
  isSavingAdminState: boolean;
  isSavingCredential: boolean;
  isSavingGorgiasCredential: boolean;
  knowledgeCards: ManagedKnowledgeCard[];
  onAddKnowledgeCard: () => void;
  onAddWebSource: () => void;
  onBackToInbox: () => void;
  onChannelGuidanceChange: (channelId: string, value: string) => void;
  onDeleteKnowledgeCard: (knowledgeId: string) => void;
  onDeleteWebSource: (sourceId: string) => void;
  onKnowledgeCardChange: (
    knowledgeId: string,
    patch: Partial<ManagedKnowledgeCard>,
  ) => void;
  onModelOverrideChange: (value: string) => void;
  onGorgiasFieldChange: (
    field: keyof AdminState["gorgias"],
    value: AdminState["gorgias"][keyof AdminState["gorgias"]],
  ) => void;
  onProviderRouteChange: (value: AdminState["ai"]["providerRouteId"]) => void;
  onProfileChange: (value: AdminState["ai"]["profileId"]) => void;
  onRunGorgiasPreview: () => void;
  onSaveAdminState: () => void;
  onSaveGorgiasApiKey: (apiKey: string) => void;
  onSaveProviderKey: (providerRouteId: string, apiKey: string) => void;
  onStyleGuidanceChange: (style: DraftStyle, value: string) => void;
  onWebSourceChange: (
    sourceId: string,
    patch: Partial<ManagedWebSource>,
  ) => void;
  providerStatuses: ProviderConnectionStatus[];
  state: AdminState;
  webSources: ManagedWebSource[];
};

export function AdminWorkspace({
  adminSaveMessage,
  channels,
  credentialMessage,
  gorgiasConnectionStatus,
  gorgiasCredentialMessage,
  gorgiasPreviewMessage,
  isAdminDirty,
  isRunningGorgiasPreview,
  isSavingAdminState,
  isSavingCredential,
  isSavingGorgiasCredential,
  knowledgeCards,
  onAddKnowledgeCard,
  onAddWebSource,
  onBackToInbox,
  onChannelGuidanceChange,
  onDeleteKnowledgeCard,
  onDeleteWebSource,
  onKnowledgeCardChange,
  onModelOverrideChange,
  onGorgiasFieldChange,
  onProfileChange,
  onProviderRouteChange,
  onRunGorgiasPreview,
  onSaveAdminState,
  onSaveGorgiasApiKey,
  onSaveProviderKey,
  onStyleGuidanceChange,
  onWebSourceChange,
  providerStatuses,
  state,
  webSources,
}: AdminWorkspaceProps) {
  const [credentialInputs, setCredentialInputs] = useState<
    Record<string, string>
  >({});
  const [gorgiasKeyInput, setGorgiasKeyInput] = useState("");

  return (
    <section className="scroll-subtle min-h-[calc(100vh-1.5rem)] overflow-y-auto lg:col-span-2 xl:col-span-3">
      <div className="min-h-full bg-[var(--surface)] px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <div className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-6 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  Admin workspace
                </div>
                <div className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">
                  AI defaults and persistence
                </div>
                <p className="mt-2 max-w-[860px] text-[13px] leading-6 text-[var(--text-soft)]">
                  This is the control plane for the drafting layer. Changes here
                  persist to the server-backed admin state and feed the inbox,
                  knowledge rail, and AI generation routes.
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
                    isAdminDirty
                      ? "bg-[#fff1ec] text-[var(--orange)]"
                      : "bg-[#dcfce7] text-[#15803d]"
                  }`}
                >
                  {isAdminDirty ? "Unsaved changes" : "Saved"}
                </span>
                <button
                  type="button"
                  onClick={onSaveAdminState}
                  disabled={isSavingAdminState || !isAdminDirty}
                  className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold text-white transition ${
                    isSavingAdminState || !isAdminDirty
                      ? "cursor-not-allowed bg-[#f1b8a6]"
                      : "bg-[var(--orange)] hover:opacity-92"
                  }`}
                >
                  {isSavingAdminState ? "Saving..." : "Save admin state"}
                </button>
              </div>
            </div>

            {adminSaveMessage ? (
              <div className="mt-4 rounded-[12px] bg-[var(--surface)] px-4 py-3 text-[12px] leading-5 text-[var(--text-soft)]">
                {adminSaveMessage}
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-6">
              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Draft defaults
                </div>

                <label className="mt-4 block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                    Provider route
                  </span>
                  <select
                    value={state.ai.providerRouteId}
                    onChange={(event) =>
                      onProviderRouteChange(
                        event.target.value as AdminState["ai"]["providerRouteId"],
                      )
                    }
                    className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)] focus:bg-[var(--white)]"
                  >
                    {Object.values(PROVIDER_ROUTES).map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                    Draft profile
                  </span>
                  <select
                    value={state.ai.profileId}
                    onChange={(event) =>
                      onProfileChange(
                        event.target.value as AdminState["ai"]["profileId"],
                      )
                    }
                    className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)] focus:bg-[var(--white)]"
                  >
                    {Object.values(MODEL_PROFILES).map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                    Model override
                  </span>
                  <input
                    value={state.ai.modelOverride}
                    onChange={(event) =>
                      onModelOverrideChange(event.target.value)
                    }
                    placeholder="Optional explicit model string"
                    className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)] focus:bg-[var(--white)]"
                  />
                </label>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Provider connections
                </div>

                {credentialMessage ? (
                  <div className="mt-4 rounded-[12px] bg-[#fff1ec] px-4 py-3 text-[12px] leading-5 text-[var(--orange)]">
                    {credentialMessage}
                  </div>
                ) : null}

                <div className="mt-4 space-y-4">
                  {providerStatuses.map((status) => {
                    const inputValue = credentialInputs[status.id] ?? "";
                    const statusLabel = status.isBuiltIn
                      ? "Built in"
                      : status.activeInRuntime
                        ? "Connected"
                        : status.savedToEnvFile
                          ? "Saved, restart needed"
                          : "Needs key";
                    const statusTone = status.isBuiltIn
                      ? "bg-[var(--gray)] text-[var(--graphite)]"
                      : status.activeInRuntime
                        ? "bg-[#dcfce7] text-[#15803d]"
                        : status.savedToEnvFile
                          ? "bg-[#fef3c7] text-[#b45309]"
                          : "bg-[#fff1ec] text-[var(--orange)]";

                    return (
                      <article
                        key={status.id}
                        className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-[14px] font-semibold">
                              {status.label}
                            </div>
                            <p className="mt-1 text-[12px] leading-5 text-[var(--text-soft)]">
                              {status.description}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <div className="mt-3 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 py-3">
                          <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                            {status.tokenEnv ?? "No credential required"}
                          </div>
                        </div>

                        {status.tokenEnv ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <input
                              type="password"
                              value={inputValue}
                              onChange={(event) =>
                                setCredentialInputs((current) => ({
                                  ...current,
                                  [status.id]: event.target.value,
                                }))
                              }
                              placeholder={`Paste ${status.label} API key`}
                              className="h-10 min-w-0 flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                onSaveProviderKey(status.id, inputValue)
                              }
                              disabled={isSavingCredential || !inputValue.trim()}
                              className={`h-10 rounded-[10px] px-4 text-[12px] font-semibold text-white transition ${
                                isSavingCredential || !inputValue.trim()
                                  ? "cursor-not-allowed bg-[#f1b8a6]"
                                  : "bg-[var(--orange)] hover:opacity-92"
                              }`}
                            >
                              Save key
                            </button>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Gorgias read-only sync
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-soft)]">
                      Configure the first live inbox preview without enabling send.
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      gorgiasConnectionStatus?.activeInRuntime
                        ? "bg-[#dcfce7] text-[#15803d]"
                        : gorgiasConnectionStatus?.savedToEnvFile
                          ? "bg-[#fef3c7] text-[#b45309]"
                          : "bg-[#fff1ec] text-[var(--orange)]"
                    }`}
                  >
                    {gorgiasConnectionStatus?.activeInRuntime
                      ? "Connected"
                      : gorgiasConnectionStatus?.savedToEnvFile
                        ? "Restart needed"
                        : "Needs API key"}
                  </span>
                </div>

                {gorgiasCredentialMessage ? (
                  <div className="mt-4 rounded-[12px] bg-[#fff1ec] px-4 py-3 text-[12px] leading-5 text-[var(--orange)]">
                    {gorgiasCredentialMessage}
                  </div>
                ) : null}

                {gorgiasPreviewMessage ? (
                  <div className="mt-4 rounded-[12px] bg-[var(--surface)] px-4 py-3 text-[12px] leading-5 text-[var(--text-soft)]">
                    {gorgiasPreviewMessage}
                  </div>
                ) : null}

                <div className="mt-4 grid gap-3">
                  <label className="block">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                      Account domain
                    </span>
                    <input
                      value={state.gorgias.accountDomain}
                      onChange={(event) =>
                        onGorgiasFieldChange("accountDomain", event.target.value)
                      }
                      placeholder="monoblocc or monoblocc.gorgias.com"
                      className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)] focus:bg-[var(--white)]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                      Gorgias login email
                    </span>
                    <input
                      value={state.gorgias.email}
                      onChange={(event) =>
                        onGorgiasFieldChange("email", event.target.value)
                      }
                      placeholder="support@monoblocc.com"
                      className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)] focus:bg-[var(--white)]"
                    />
                  </label>

                  <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
                    <label className="block">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                        Ticket limit
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={state.gorgias.ticketLimit}
                        onChange={(event) =>
                          onGorgiasFieldChange(
                            "ticketLimit",
                            Number(event.target.value) || 1,
                          )
                        }
                        className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)] focus:bg-[var(--white)]"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                        Inbox default
                      </span>
                      <select
                        value={state.gorgias.defaultInboxMode}
                        onChange={(event) =>
                          onGorgiasFieldChange(
                            "defaultInboxMode",
                            event.target.value as AdminState["gorgias"]["defaultInboxMode"],
                          )
                        }
                        className="mt-2 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)] focus:bg-[var(--white)]"
                      >
                        <option value="mock">Mock inbox</option>
                        <option value="gorgias-preview">Gorgias preview when loaded</option>
                      </select>
                    </label>
                  </div>

                  <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                    <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                      {gorgiasConnectionStatus?.tokenEnv ?? "GORGIAS_API_KEY"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <input
                        type="password"
                        value={gorgiasKeyInput}
                        onChange={(event) => setGorgiasKeyInput(event.target.value)}
                        placeholder="Paste Gorgias private app API key"
                        className="h-10 min-w-0 flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                      />
                      <button
                        type="button"
                        onClick={() => onSaveGorgiasApiKey(gorgiasKeyInput)}
                        disabled={isSavingGorgiasCredential || !gorgiasKeyInput.trim()}
                        className={`h-10 rounded-[10px] px-4 text-[12px] font-semibold text-white transition ${
                          isSavingGorgiasCredential || !gorgiasKeyInput.trim()
                            ? "cursor-not-allowed bg-[#f1b8a6]"
                            : "bg-[var(--orange)] hover:opacity-92"
                        }`}
                      >
                        Save key
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onRunGorgiasPreview}
                    disabled={isRunningGorgiasPreview}
                    className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold text-white transition ${
                      isRunningGorgiasPreview
                        ? "cursor-not-allowed bg-[#373737]/60"
                        : "bg-[#373737] hover:opacity-92"
                    }`}
                  >
                    {isRunningGorgiasPreview
                      ? "Loading Gorgias preview..."
                      : "Load read-only preview into inbox"}
                  </button>

                  {state.gorgias.lastConnectionSummary ? (
                    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[12px] leading-5 text-[var(--text-soft)]">
                      {state.gorgias.lastConnectionSummary}
                      {state.gorgias.lastPreviewAt
                        ? ` Last preview: ${new Date(
                            state.gorgias.lastPreviewAt,
                          ).toLocaleString()}.`
                        : ""}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Channel guidance
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-soft)]">
                      Saved instructions layered on top of the base channel rules.
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  {channels.map((channel) => (
                    <label key={channel.id} className="block rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                      <span className="text-[13px] font-semibold text-[var(--text)]">
                        {channel.label}
                      </span>
                      <p className="mt-1 text-[12px] leading-5 text-[var(--text-soft)]">
                        {channel.description}
                      </p>
                      <textarea
                        value={state.ai.channelGuidanceByChannelId[channel.id] ?? ""}
                        onChange={(event) =>
                          onChannelGuidanceChange(channel.id, event.target.value)
                        }
                        rows={5}
                        placeholder="Optional channel-specific prompt guidance."
                        className="mt-3 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Style guidance
                </div>
                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                  {STYLE_FIELDS.map((style) => (
                    <label key={style.key} className="block rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                        {style.label}
                      </span>
                      <textarea
                        value={state.ai.styleGuidance[style.key]}
                        onChange={(event) =>
                          onStyleGuidanceChange(style.key, event.target.value)
                        }
                        rows={5}
                        placeholder={`Optional extra steer for the ${style.label.toLowerCase()} draft.`}
                        className="mt-3 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Knowledge cards
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-soft)]">
                      Manual product, policy, and usage notes that can be attached to drafts.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onAddKnowledgeCard}
                    className="h-10 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-4 text-[12px] font-semibold text-[var(--text)] transition hover:bg-[var(--surface)]"
                  >
                    Add knowledge card
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {knowledgeCards.map((card) => (
                    <article
                      key={card.id}
                      className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px]">
                            <input
                              value={card.title}
                              onChange={(event) =>
                                onKnowledgeCardChange(card.id, {
                                  title: event.target.value,
                                })
                              }
                              placeholder="Knowledge title"
                              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                            />
                            <select
                              value={card.type}
                              onChange={(event) =>
                                onKnowledgeCardChange(card.id, {
                                  type: event.target.value as ManagedKnowledgeCard["type"],
                                })
                              }
                              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                            >
                              <option value="Product">Product</option>
                              <option value="Policy">Policy</option>
                              <option value="Usage">Usage</option>
                            </select>
                            <select
                              value={card.status}
                              onChange={(event) =>
                                onKnowledgeCardChange(card.id, {
                                  status: event.target.value as ManagedKnowledgeCard["status"],
                                })
                              }
                              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                            >
                              <option value="active">Active</option>
                              <option value="draft">Draft</option>
                            </select>
                          </div>

                          <div className="mt-3 grid gap-3 md:grid-cols-[160px_minmax(0,1fr)_150px]">
                            <select
                              value={card.sourceType}
                              onChange={(event) =>
                                onKnowledgeCardChange(card.id, {
                                  sourceType: event.target.value as ManagedKnowledgeCard["sourceType"],
                                })
                              }
                              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                            >
                              <option value="manual">Manual</option>
                              <option value="web">Web</option>
                            </select>
                            <input
                              value={card.source}
                              onChange={(event) =>
                                onKnowledgeCardChange(card.id, {
                                  source: event.target.value,
                                })
                              }
                              placeholder="Source URL or internal note reference"
                              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                            />
                            <input
                              value={card.freshness}
                              onChange={(event) =>
                                onKnowledgeCardChange(card.id, {
                                  freshness: event.target.value,
                                })
                              }
                              placeholder="Freshness label"
                              className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                            />
                          </div>

                          <textarea
                            value={card.body}
                            onChange={(event) =>
                              onKnowledgeCardChange(card.id, {
                                body: event.target.value,
                              })
                            }
                            rows={4}
                            placeholder="Knowledge card content"
                            className="mt-3 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-[13px] leading-6 outline-none transition focus:border-[var(--orange)]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteKnowledgeCard(card.id)}
                          className="h-10 rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-4 text-[12px] font-semibold text-[#b91c1c] transition hover:bg-[#ffe4e6]"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[18px] border border-[var(--border)] bg-[var(--white)] px-5 py-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Web knowledge sources
                    </div>
                    <div className="mt-1 text-[13px] text-[var(--text-soft)]">
                      URL watchlist for future ingestion and controlled grounding.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onAddWebSource}
                    className="h-10 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-4 text-[12px] font-semibold text-[var(--text)] transition hover:bg-[var(--surface)]"
                  >
                    Add web source
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {webSources.map((source) => (
                    <article
                      key={source.id}
                      className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4"
                    >
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_120px]">
                        <input
                          value={source.label}
                          onChange={(event) =>
                            onWebSourceChange(source.id, {
                              label: event.target.value,
                            })
                          }
                          placeholder="Source label"
                          className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                        />
                        <select
                          value={source.status}
                          onChange={(event) =>
                            onWebSourceChange(source.id, {
                              status: event.target.value as ManagedWebSource["status"],
                            })
                          }
                          className="h-11 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteWebSource(source.id)}
                          className="h-11 rounded-[12px] border border-[#fecaca] bg-[#fff1f2] px-4 text-[12px] font-semibold text-[#b91c1c] transition hover:bg-[#ffe4e6]"
                        >
                          Delete
                        </button>
                      </div>

                      <input
                        value={source.url}
                        onChange={(event) =>
                          onWebSourceChange(source.id, {
                            url: event.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="mt-3 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                      />
                      <textarea
                        value={source.note}
                        onChange={(event) =>
                          onWebSourceChange(source.id, {
                            note: event.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Why should this source be watched?"
                        className="mt-3 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-[13px] leading-6 outline-none transition focus:border-[var(--orange)]"
                      />
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
