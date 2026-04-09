"use client";

import { useState } from "react";
import type {
  DraftStyle,
  GuidanceOverrides,
  ProviderConnectionStatus,
} from "@/lib/ai/types";

const STYLE_FIELDS: Array<{ key: DraftStyle; label: string }> = [
  { key: "support", label: "Support" },
  { key: "sales", label: "Sales" },
  { key: "short", label: "Short" },
  { key: "formal", label: "Formal" },
  { key: "hype", label: "Hype" },
];

type AiSettingsModalProps = {
  channelLabel: string;
  credentialMessage: string | null;
  draftProfiles: Array<{ description: string; id: string; label: string }>;
  guidance: GuidanceOverrides;
  isSavingCredential: boolean;
  modelOverride: string;
  onClose: () => void;
  onGuidanceChange: (guidance: GuidanceOverrides) => void;
  onModelOverrideChange: (value: string) => void;
  onSave: () => void;
  onSaveProviderKey: (providerRouteId: string, apiKey: string) => void;
  open: boolean;
  providerRoutes: Array<{ description: string; id: string; label: string }>;
  providerStatuses: ProviderConnectionStatus[];
  selectedProfileId: string;
  selectedRouteId: string;
  setSelectedProfileId: (value: string) => void;
  setSelectedRouteId: (value: string) => void;
};

export function AiSettingsModal({
  channelLabel,
  credentialMessage,
  draftProfiles,
  guidance,
  isSavingCredential,
  modelOverride,
  onClose,
  onGuidanceChange,
  onModelOverrideChange,
  onSave,
  onSaveProviderKey,
  open,
  providerRoutes,
  providerStatuses,
  selectedProfileId,
  selectedRouteId,
  setSelectedProfileId,
  setSelectedRouteId,
}: AiSettingsModalProps) {
  const [credentialInputs, setCredentialInputs] = useState<
    Record<string, string>
  >({});

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(17,24,39,0.38)] px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-[1080px] overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--white)] shadow-[0_28px_70px_rgba(17,24,39,0.18)]">
        <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mono text-[11px] uppercase tracking-[0.2em] text-[var(--text-soft)]">
                AI settings
              </div>
              <div className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">
                Model routing and provider setup
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--white)] text-[var(--text-soft)] transition hover:border-[var(--orange)] hover:text-[var(--orange)]"
              aria-label="Close AI settings"
            >
              <CloseIcon />
            </button>
          </div>
          <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-[var(--text-soft)]">
            This is the home for channel guidance, style guidance, and provider
            credentials. For this local phase, provider keys are saved into{" "}
            <span className="font-semibold text-[var(--text)]">.env.local</span>{" "}
            on the server side, not in browser storage.
          </p>
        </div>

        <div className="scroll-subtle max-h-[calc(90vh-168px)] overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <section className="rounded-[16px] border border-[var(--border)] bg-[var(--white)] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Provider credentials
                  </div>
                  <div className="mt-1 text-[13px] leading-6 text-[var(--text-soft)]">
                    Add a provider key below, then restart the dev server so the
                    drafting runtime can use it.
                  </div>
                </div>
                <div className="rounded-full bg-[var(--surface)] px-3 py-1 text-[12px] text-[var(--text-soft)]">
                  Local development helper
                </div>
              </div>

              {credentialMessage ? (
                <div className="mt-4 rounded-[12px] bg-[#fff1ec] px-3 py-2 text-[12px] leading-5 text-[var(--orange)]">
                  {credentialMessage}
                </div>
              ) : null}

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
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
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[15px] font-semibold">
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
                        <div className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                          {status.tokenEnv
                            ? "Saved to .env.local and loaded by the server runtime."
                            : "This route uses built-in template drafts and does not need a key."}
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
                            className="h-11 min-w-0 flex-1 rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onSaveProviderKey(status.id, inputValue)
                            }
                            disabled={isSavingCredential || !inputValue.trim()}
                            className={`h-11 rounded-[12px] px-4 text-[13px] font-semibold text-white transition ${
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

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-5">
                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                  <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Provider route
                  </div>
                  <select
                    value={selectedRouteId}
                    onChange={(event) => setSelectedRouteId(event.target.value)}
                    className="mt-3 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                  >
                    {providerRoutes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                    {providerRoutes.find((route) => route.id === selectedRouteId)
                      ?.description}
                  </p>
                </div>

                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                  <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Draft profile
                  </div>
                  <select
                    value={selectedProfileId}
                    onChange={(event) =>
                      setSelectedProfileId(event.target.value)
                    }
                    className="mt-3 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)]"
                  >
                    {draftProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                    {
                      draftProfiles.find(
                        (profile) => profile.id === selectedProfileId,
                      )?.description
                    }
                  </p>
                </div>

                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                  <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Model override
                  </div>
                  <input
                    value={modelOverride}
                    onChange={(event) =>
                      onModelOverrideChange(event.target.value)
                    }
                    placeholder="Optional explicit model string"
                    className="mt-3 h-11 w-full rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-3 text-[13px] outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                  />
                  <p className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                    Useful when you want to compare a specific model without
                    changing the overall task profile.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--white)] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                      Extra channel guidance
                    </div>
                    <div className="text-[12px] text-[var(--text-soft)]">
                      {channelLabel}
                    </div>
                  </div>
                  <textarea
                    value={guidance.channel}
                    onChange={(event) =>
                      onGuidanceChange({
                        ...guidance,
                        channel: event.target.value,
                      })
                    }
                    rows={5}
                    placeholder="Optional extra instructions for this channel, for example how public replies should feel or what to avoid."
                    className="mt-3 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)] focus:bg-[var(--white)]"
                  />
                </div>

                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--white)] px-4 py-4">
                  <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    Extra style guidance
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {STYLE_FIELDS.map((style) => (
                      <label key={style.key} className="block">
                        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
                          {style.label}
                        </span>
                        <textarea
                          value={guidance.styles[style.key]}
                          onChange={(event) =>
                            onGuidanceChange({
                              ...guidance,
                              styles: {
                                ...guidance.styles,
                                [style.key]: event.target.value,
                              },
                            })
                          }
                          rows={4}
                          placeholder={`Optional extra steer for the ${style.label.toLowerCase()} variant.`}
                          className="mt-2 w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)] focus:bg-[var(--white)]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-[var(--border)] bg-[var(--white)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-4 text-[13px] font-medium text-[var(--text)] transition hover:bg-[var(--surface)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-10 rounded-[10px] bg-[var(--orange)] px-4 text-[13px] font-semibold text-white transition hover:opacity-92"
          >
            Save and close
          </button>
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M5 5 15 15" />
      <path d="M15 5 5 15" />
    </svg>
  );
}
