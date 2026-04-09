"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";
import { AiSettingsModal } from "@/components/ai-settings-modal";
import {
  DRAFT_STYLE_LABELS,
  DRAFT_STYLE_ORDER,
  MODEL_PROFILES,
  PROVIDER_ROUTES,
} from "@/lib/ai/catalog";
import type {
  DraftCandidate,
  DraftGenerationResponse,
  DraftStyle,
  GuidanceOverrides,
  ModelProfileId,
  ProviderConnectionStatus,
  ProviderRouteId,
} from "@/lib/ai/types";
import {
  channels,
  conversations,
  knowledgeCards,
  type Conversation,
  type Message,
} from "@/lib/mock-data";

const AI_SETTINGS_STORAGE_KEY = "monoblocc-ai-draft-settings-v1";

type PersistedAiSettings = {
  channelGuidanceByChannelId: Record<string, string>;
  modelOverride: string;
  profileId: ModelProfileId;
  providerRouteId: ProviderRouteId;
  styleGuidance: Record<DraftStyle, string>;
};

function createEmptyStyleGuidance(): Record<DraftStyle, string> {
  return {
    support: "",
    sales: "",
    short: "",
    formal: "",
    hype: "",
  };
}

function createDefaultSettings(): PersistedAiSettings {
  return {
    channelGuidanceByChannelId: {},
    modelOverride: "",
    profileId: "draft_quality",
    providerRouteId: "mock",
    styleGuidance: createEmptyStyleGuidance(),
  };
}

function getRecommendedStyle(channelId: string): DraftStyle {
  return channelId === "instagram-comments" || channelId === "whatsapp"
    ? "short"
    : "support";
}

function buildLocalDraftChoices(conversation: Conversation): DraftCandidate[] {
  const supportDrafts = conversation.drafts.support;
  const salesDrafts = conversation.drafts.sales;
  const hypeDrafts = conversation.drafts.hype;
  const recommendedKey = getRecommendedStyle(conversation.channelId);
  const styleBodies: Record<DraftStyle, string> = {
    support: supportDrafts[0]?.body ?? conversation.latestCustomerMessage,
    sales:
      salesDrafts[0]?.body ??
      supportDrafts[0]?.body ??
      conversation.latestCustomerMessage,
    short:
      supportDrafts[1]?.body ??
      supportDrafts[0]?.body ??
      conversation.latestCustomerMessage,
    formal:
      supportDrafts[2]?.body ??
      supportDrafts[0]?.body ??
      conversation.latestCustomerMessage,
    hype:
      hypeDrafts[0]?.body ??
      supportDrafts[0]?.body ??
      conversation.latestCustomerMessage,
  };

  return DRAFT_STYLE_ORDER.map((style) => ({
    key: style,
    label: DRAFT_STYLE_LABELS[style],
    body: styleBodies[style],
    rationale: "Template-backed local preview while AI generation loads.",
    recommended: style === recommendedKey,
  }));
}

function buildDraftCacheKey(
  conversation: Conversation,
  profileId: ModelProfileId,
  providerRouteId: ProviderRouteId,
  modelOverride: string,
  guidance: GuidanceOverrides,
) {
  return JSON.stringify({
    channelId: conversation.channelId,
    conversationId: conversation.id,
    guidance,
    lastMessageId: conversation.messages[conversation.messages.length - 1]?.id ?? "",
    messageCount: conversation.messages.length,
    modelOverride: modelOverride.trim(),
    profileId,
    providerRouteId,
    unreadCount: conversation.unreadCount,
    updatedAt: conversation.updatedAt,
  });
}

function buildStyleLoadingKey(draftKey: string, style: DraftStyle) {
  return `${draftKey}:${style}`;
}

function mergeDraftChoices(
  currentDrafts: DraftCandidate[],
  nextDrafts: DraftCandidate[],
) {
  const nextMap = new Map(nextDrafts.map((draft) => [draft.key, draft]));

  return currentDrafts.map((draft) => nextMap.get(draft.key) ?? draft);
}

function normalisePersistedSettings(raw: string | null): PersistedAiSettings {
  const defaults = createDefaultSettings();

  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAiSettings>;
    const providerRouteId =
      parsed.providerRouteId && parsed.providerRouteId in PROVIDER_ROUTES
        ? parsed.providerRouteId
        : defaults.providerRouteId;
    const profileId =
      parsed.profileId && parsed.profileId in MODEL_PROFILES
        ? parsed.profileId
        : defaults.profileId;

    return {
      channelGuidanceByChannelId:
        parsed.channelGuidanceByChannelId &&
        typeof parsed.channelGuidanceByChannelId === "object"
          ? parsed.channelGuidanceByChannelId
          : defaults.channelGuidanceByChannelId,
      modelOverride:
        typeof parsed.modelOverride === "string"
          ? parsed.modelOverride
          : defaults.modelOverride,
      profileId,
      providerRouteId,
      styleGuidance: {
        ...defaults.styleGuidance,
        ...(parsed.styleGuidance ?? {}),
      },
    };
  } catch {
    return defaults;
  }
}

export function InboxWorkspace() {
  const [conversationData, setConversationData] = useState(conversations);
  const [selectedChannelId, setSelectedChannelId] = useState(channels[0].id);
  const [selectedConversationId, setSelectedConversationId] = useState(
    conversations[0].id,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [editorText, setEditorText] = useState("");
  const [selectedProfileId, setSelectedProfileId] =
    useState<ModelProfileId>("draft_quality");
  const [selectedProviderRouteId, setSelectedProviderRouteId] =
    useState<ProviderRouteId>("mock");
  const [modelOverride, setModelOverride] = useState("");
  const [styleGuidance, setStyleGuidance] = useState(createEmptyStyleGuidance);
  const [channelGuidanceByChannelId, setChannelGuidanceByChannelId] = useState<
    Record<string, string>
  >({});
  const [draftCache, setDraftCache] = useState<
    Record<string, DraftGenerationResponse>
  >({});
  const [loadingDraftKey, setLoadingDraftKey] = useState<string | null>(null);
  const [regeneratingDraftStyles, setRegeneratingDraftStyles] = useState<
    string[]
  >([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalProfileId, setModalProfileId] =
    useState<ModelProfileId>("draft_quality");
  const [modalRouteId, setModalRouteId] = useState<ProviderRouteId>("mock");
  const [modalModelOverride, setModalModelOverride] = useState("");
  const [modalGuidance, setModalGuidance] = useState<GuidanceOverrides>({
    channel: "",
    styles: createEmptyStyleGuidance(),
  });
  const [providerStatuses, setProviderStatuses] = useState<
    ProviderConnectionStatus[]
  >([]);
  const [credentialMessage, setCredentialMessage] = useState<string | null>(
    null,
  );
  const [isSavingCredential, setIsSavingCredential] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const inFlightDraftKeysRef = useRef(new Set<string>());

  useEffect(() => {
    const persisted = normalisePersistedSettings(
      window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY),
    );

    setSelectedProfileId(persisted.profileId);
    setSelectedProviderRouteId(persisted.providerRouteId);
    setModelOverride(persisted.modelOverride);
    setStyleGuidance(persisted.styleGuidance);
    setChannelGuidanceByChannelId(persisted.channelGuidanceByChannelId);
    setSettingsHydrated(true);
    void refreshProviderStatuses();
  }, []);

  useEffect(() => {
    if (!settingsHydrated) {
      return;
    }

    const persisted: PersistedAiSettings = {
      channelGuidanceByChannelId,
      modelOverride,
      profileId: selectedProfileId,
      providerRouteId: selectedProviderRouteId,
      styleGuidance,
    };

    window.localStorage.setItem(
      AI_SETTINGS_STORAGE_KEY,
      JSON.stringify(persisted),
    );
  }, [
    channelGuidanceByChannelId,
    modelOverride,
    selectedProfileId,
    selectedProviderRouteId,
    settingsHydrated,
    styleGuidance,
  ]);

  const activeChannel =
    channels.find((channel) => channel.id === selectedChannelId) ?? channels[0];
  const channelConversations = conversationData.filter(
    (conversation) => conversation.channelId === activeChannel.id,
  );
  const visibleConversations = filterConversations(
    channelConversations,
    deferredSearchTerm,
  );
  const selectedConversation =
    visibleConversations.find(
      (conversation) => conversation.id === selectedConversationId,
    ) ??
    channelConversations.find(
      (conversation) => conversation.id === selectedConversationId,
    ) ??
    visibleConversations[0] ??
    channelConversations[0];
  const selectedConversationChannel =
    channels.find(
      (channel) => channel.id === selectedConversation?.channelId,
    ) ?? activeChannel;
  const relatedKnowledge = selectedConversation
    ? knowledgeCards.filter((card) =>
        selectedConversation.knowledgeIds.includes(card.id),
      )
    : [];
  const activeGuidance: GuidanceOverrides = {
    channel:
      channelGuidanceByChannelId[selectedConversationChannel.id] ?? "",
    styles: styleGuidance,
  };
  const currentDraftKey = selectedConversation
    ? buildDraftCacheKey(
        selectedConversation,
        selectedProfileId,
        selectedProviderRouteId,
        modelOverride,
        activeGuidance,
      )
    : null;
  const cachedDraftResponse = currentDraftKey
    ? draftCache[currentDraftKey]
    : undefined;
  const localFallbackDrafts = selectedConversation
    ? buildLocalDraftChoices(selectedConversation)
    : [];
  const draftChoices = cachedDraftResponse?.drafts ?? localFallbackDrafts;
  const currentProvider = PROVIDER_ROUTES[selectedProviderRouteId];
  const currentProfile = MODEL_PROFILES[selectedProfileId];
  const currentModelLabel =
    modelOverride.trim() || currentProvider.defaultModels[selectedProfileId];
  const isGeneratingCurrentDrafts = loadingDraftKey === currentDraftKey;

  useEffect(() => {
    if (
      !settingsHydrated ||
      !selectedConversation ||
      !currentDraftKey ||
      selectedConversation.unreadCount === 0 ||
      cachedDraftResponse ||
      inFlightDraftKeysRef.current.has(currentDraftKey)
    ) {
      return;
    }

    const draftKey = currentDraftKey;
    const guidanceOverrides: GuidanceOverrides = {
      channel:
        channelGuidanceByChannelId[selectedConversation.channelId] ?? "",
      styles: styleGuidance,
    };
    const currentKnowledgeCards = knowledgeCards.filter((card) =>
      selectedConversation.knowledgeIds.includes(card.id),
    );
    const currentChannel =
      channels.find((channel) => channel.id === selectedConversation.channelId) ??
      channels[0];
    let cancelled = false;

    async function runDraftGeneration() {
      inFlightDraftKeysRef.current.add(draftKey);
      setLoadingDraftKey(draftKey);
      setGenerationError(null);

      try {
        const response = await fetch("/api/drafts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel: currentChannel,
            conversation: selectedConversation,
            guidanceOverrides,
            knowledgeCards: currentKnowledgeCards,
            modelOverride,
            profileId: selectedProfileId,
            providerRouteId: selectedProviderRouteId,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;

          throw new Error(
            payload?.error ??
              `Draft generation failed with status ${response.status}.`,
          );
        }

        const payload = (await response.json()) as DraftGenerationResponse;

        if (cancelled) {
          return;
        }

        setDraftCache((current) => ({
          ...current,
          [draftKey]: payload,
        }));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setGenerationError(
          error instanceof Error
            ? error.message
            : "Draft generation failed in the client.",
        );
      } finally {
        inFlightDraftKeysRef.current.delete(draftKey);

        if (!cancelled) {
          setLoadingDraftKey((current) =>
            current === draftKey ? null : current,
          );
        }
      }
    }

    void runDraftGeneration();

    return () => {
      cancelled = true;
    };
  }, [
    cachedDraftResponse,
    channelGuidanceByChannelId,
    currentDraftKey,
    modelOverride,
    selectedConversation,
    selectedProfileId,
    selectedProviderRouteId,
    settingsHydrated,
    styleGuidance,
  ]);

  async function refreshProviderStatuses() {
    try {
      const response = await fetch("/api/ai/providers");

      if (!response.ok) {
        throw new Error("Unable to load provider status.");
      }

      const payload = (await response.json()) as {
        providers?: ProviderConnectionStatus[];
        restartHint?: string;
      };

      setProviderStatuses(payload.providers ?? []);
      setCredentialMessage(payload.restartHint ?? null);
    } catch (error) {
      setCredentialMessage(
        error instanceof Error
          ? error.message
          : "Unable to load provider status.",
      );
    }
  }

  function populateEditor(body: string) {
    setEditorText(body);
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      editorRef.current?.setSelectionRange(body.length, body.length);
    });
  }

  function sendReply(body: string) {
    if (!selectedConversation || !body.trim()) {
      return;
    }

    const sentAt = "Just now";
    const nextStatus =
      selectedConversation.status === "Ready to send"
        ? "Ready to send"
        : "Watching";

    setConversationData((current) =>
      current.map((conversation) => {
        if (conversation.id !== selectedConversation.id) {
          return conversation;
        }

        const nextMessage: Message = {
          id: `${conversation.id}-reply-${conversation.messages.length + 1}`,
          authorType: "agent",
          authorName: "Monoblocc Team",
          direction: "outbound",
          timestamp: sentAt,
          body: body.trim(),
        };

        return {
          ...conversation,
          latestPreview: body.trim(),
          messages: [...conversation.messages, nextMessage],
          status: nextStatus,
          unreadCount: 0,
          updatedAt: "just now",
        };
      }),
    );

    setEditorText("");
  }

  function handleChannelSelect(channelId: string) {
    const nextConversation =
      conversationData.find(
        (conversation) => conversation.channelId === channelId,
      ) ?? conversationData[0];

    setSelectedChannelId(channelId);
    setSelectedConversationId(nextConversation.id);
    setSearchTerm("");
    setEditorText("");
    setGenerationError(null);
  }

  function handleConversationSelect(conversationId: string) {
    setSelectedConversationId(conversationId);
    setEditorText("");
    setGenerationError(null);
  }

  function handleOpenSettings() {
    setCredentialMessage(null);
    setModalProfileId(selectedProfileId);
    setModalRouteId(selectedProviderRouteId);
    setModalModelOverride(modelOverride);
    setModalGuidance({
      channel:
        channelGuidanceByChannelId[selectedConversationChannel.id] ?? "",
      styles: { ...styleGuidance },
    });
    setIsSettingsOpen(true);
    void refreshProviderStatuses();
  }

  function handleSaveSettings() {
    setSelectedProfileId(modalProfileId);
    setSelectedProviderRouteId(modalRouteId);
    setModelOverride(modalModelOverride);
    setStyleGuidance({ ...modalGuidance.styles });
    setChannelGuidanceByChannelId((current) => ({
      ...current,
      [selectedConversationChannel.id]: modalGuidance.channel,
    }));
    setIsSettingsOpen(false);
    setGenerationError(null);
  }

  async function handleRegenerateDraftStyle(style: DraftStyle) {
    if (!selectedConversation || !currentDraftKey) {
      return;
    }

    const styleLoadingKey = buildStyleLoadingKey(currentDraftKey, style);

    if (regeneratingDraftStyles.includes(styleLoadingKey)) {
      return;
    }

    const guidanceOverrides: GuidanceOverrides = {
      channel:
        channelGuidanceByChannelId[selectedConversation.channelId] ?? "",
      styles: styleGuidance,
    };
    const currentKnowledgeCards = knowledgeCards.filter((card) =>
      selectedConversation.knowledgeIds.includes(card.id),
    );
    const currentChannel =
      channels.find((channel) => channel.id === selectedConversation.channelId) ??
      channels[0];

    setGenerationError(null);
    setRegeneratingDraftStyles((current) => [...current, styleLoadingKey]);

    try {
      const response = await fetch("/api/drafts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: currentChannel,
          conversation: selectedConversation,
          guidanceOverrides,
          knowledgeCards: currentKnowledgeCards,
          modelOverride,
          profileId: selectedProfileId,
          providerRouteId: selectedProviderRouteId,
          styles: [style],
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(
          payload?.error ??
            `Style regeneration failed with status ${response.status}.`,
        );
      }

      const payload = (await response.json()) as DraftGenerationResponse;

      setDraftCache((current) => {
        const baseDrafts =
          current[currentDraftKey]?.drafts ??
          buildLocalDraftChoices(selectedConversation);

        return {
          ...current,
          [currentDraftKey]: {
            diagnostics: payload.diagnostics,
            drafts: mergeDraftChoices(baseDrafts, payload.drafts),
          },
        };
      });
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Style regeneration failed in the client.",
      );
    } finally {
      setRegeneratingDraftStyles((current) =>
        current.filter((entry) => entry !== styleLoadingKey),
      );
    }
  }

  async function handleSaveProviderKey(
    providerRouteId: string,
    apiKey: string,
  ) {
    setIsSavingCredential(true);
    setCredentialMessage(null);

    try {
      const response = await fetch("/api/ai/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          providerRouteId,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        providers?: ProviderConnectionStatus[];
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save provider key.");
      }

      setProviderStatuses(payload.providers ?? []);
      setCredentialMessage(
        payload.message ??
          "Provider key saved. Restart the dev server to activate it.",
      );
    } catch (error) {
      setCredentialMessage(
        error instanceof Error
          ? error.message
          : "Unable to save provider key.",
      );
    } finally {
      setIsSavingCredential(false);
    }
  }

  const channelCounts = channels.map((channel) => ({
    id: channel.id,
    openCount: conversationData.filter(
      (conversation) =>
        conversation.channelId === channel.id && conversation.unreadCount > 0,
    ).length,
  }));

  return (
    <>
      <main className="min-h-screen bg-[var(--surface)] p-3 lg:p-4">
        <section className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--white)] shadow-[0_16px_40px_rgba(17,24,39,0.06)] lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[240px_320px_minmax(0,1fr)] xl:grid-cols-[240px_320px_minmax(0,1fr)_300px]">
          <aside className="flex min-h-0 flex-col bg-[var(--graphite)] text-[var(--white)]">
            <div className="border-b border-white/8 px-5 py-5">
              <div className="mono text-[11px] uppercase tracking-[0.22em] text-white/45">
                Monoblocc AI Reply Layer
              </div>
              <div className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">
                Inbox
              </div>
            </div>

            <div className="scroll-subtle min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Channels
              </div>
            <div className="space-y-1.5">
              {channels.map((channel) => {
                  const isActive = channel.id === activeChannel.id;
                  const channelCount =
                    channelCounts.find((item) => item.id === channel.id)
                      ?.openCount ?? 0;

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleChannelSelect(channel.id)}
                      className={`flex w-full items-center justify-between rounded-[10px] border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-transparent bg-white/10 text-white"
                          : "border-transparent text-white/72 hover:bg-white/6 hover:text-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium">
                          {channel.label}
                        </div>
                      </div>
                      <div
                        className={`mono rounded-full px-2 py-1 text-[11px] ${
                          isActive
                            ? "bg-[var(--orange)] text-white"
                            : "bg-white/8 text-white/72"
                        }`}
                      >
                        {channelCount}
                      </div>
                    </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/8 px-3 py-4">
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Settings
            </div>
            <button
              type="button"
              onClick={handleOpenSettings}
              className="flex w-full items-center justify-between rounded-[10px] border border-transparent px-3 py-3 text-left text-white/72 transition hover:bg-white/6 hover:text-white"
            >
              <div>
                <div className="text-[13px] font-medium">AI setup</div>
                <div className="mt-1 text-[12px] text-white/45">
                  Providers, models, guidance
                </div>
              </div>
              <div className="mono rounded-full bg-white/8 px-2 py-1 text-[11px] text-white/72">
                {selectedProviderRouteId === "mock" ? "mock" : "live"}
              </div>
            </button>
          </div>
        </aside>

          <section className="flex min-h-0 flex-col border-r border-[var(--border)] bg-[var(--white)]">
            <div className="border-b border-[var(--border)] px-4 py-4">
              <label className="block">
                <span className="sr-only">Search conversations</span>
                <input
                  value={searchTerm}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    const nextVisibleConversations = filterConversations(
                      channelConversations,
                      nextValue,
                    );

                    setSearchTerm(nextValue);

                    if (
                      nextVisibleConversations.length > 0 &&
                      !nextVisibleConversations.some(
                        (conversation) =>
                          conversation.id === selectedConversationId,
                      )
                    ) {
                      setSelectedConversationId(nextVisibleConversations[0].id);
                      setEditorText("");
                    }
                  }}
                  placeholder="Search conversations"
                  className="h-10 w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] outline-none transition focus:border-[var(--orange)] focus:bg-[var(--white)]"
                />
              </label>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold">
                    {activeChannel.label}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                    {visibleConversations.length} visible conversations
                  </div>
                </div>
                <div className="mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                  latest activity
                </div>
              </div>
            </div>

            <div className="scroll-subtle min-h-0 flex-1 overflow-y-auto">
              {visibleConversations.map((conversation) => {
                const isActive = conversation.id === selectedConversation?.id;
                const isAwaitingReply = conversation.unreadCount > 0;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={`block w-full border-b border-[var(--border)] px-4 py-4 text-left transition ${
                      isAwaitingReply
                        ? "bg-[#fff1ec] hover:bg-[#ffe5da]"
                        : isActive
                          ? "bg-[var(--surface)]"
                          : "bg-[var(--white)] hover:bg-[var(--surface)]/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar label={conversation.customerName} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-semibold text-[var(--text)]">
                              {conversation.customerName}
                            </div>
                            <div className="mt-1 truncate text-[12px] text-[var(--text-soft)]">
                              {conversation.customerHandle}
                            </div>
                          </div>
                          <div className="mono shrink-0 text-[11px] text-[var(--text-soft)]">
                            {conversation.updatedAt}
                          </div>
                        </div>

                        <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--text-soft)]">
                          {conversation.latestPreview}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <StatusBadge status={conversation.status} />
                          <PriorityBadge priority={conversation.priority} />
                          {conversation.unreadCount > 0 ? (
                            <span className="mono rounded-full bg-[var(--orange)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white">
                              {conversation.unreadCount} new
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex min-h-0 flex-col bg-[var(--surface)] xl:border-r xl:border-[var(--border)]">
            {selectedConversation ? (
              <>
                <header className="border-b border-[var(--border)] bg-[var(--white)] px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[18px] font-semibold tracking-[-0.02em]">
                        {selectedConversation.customerName}
                      </div>
                      <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                        {selectedConversation.customerHandle} |{" "}
                        {selectedConversation.customerMeta}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedConversation.status} />
                      <PriorityBadge priority={selectedConversation.priority} />
                    </div>
                  </div>
                </header>

                <div className="scroll-subtle min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  <div className="mx-auto flex max-w-4xl flex-col gap-4">
                    {selectedConversation.messages.map((message) => (
                      <MessageRow key={message.id} message={message} />
                    ))}

                    {selectedConversation.unreadCount > 0 ? (
                      <div className="mt-2 flex flex-col gap-3">
                        {isGeneratingCurrentDrafts && !cachedDraftResponse ? (
                          <>
                            <DraftSkeleton />
                            <DraftSkeleton />
                          </>
                        ) : (
                          draftChoices.map((draft) => (
                            <DraftBubble
                              key={draft.key}
                              draft={draft}
                              onEdit={() => populateEditor(draft.body)}
                              onRegenerate={() =>
                                handleRegenerateDraftStyle(draft.key)
                              }
                              onSend={() => sendReply(draft.body)}
                              isRegenerating={
                                currentDraftKey
                                  ? regeneratingDraftStyles.includes(
                                      buildStyleLoadingKey(
                                        currentDraftKey,
                                        draft.key,
                                      ),
                                    )
                                  : false
                              }
                            />
                          ))
                        )}

                        <DraftMetaRow
                          diagnostics={cachedDraftResponse?.diagnostics}
                          generationError={generationError}
                          modelLabel={currentModelLabel}
                          profileLabel={currentProfile.label}
                          providerLabel={currentProvider.label}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                <footer className="border-t border-[var(--border)] bg-[var(--white)] px-5 py-4">
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                        Reply editor
                      </div>
                      <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
                        {selectedConversation.intent}
                      </div>
                    </div>

                    <textarea
                      ref={editorRef}
                      value={editorText}
                      onChange={(event) => setEditorText(event.target.value)}
                      rows={5}
                      placeholder="Write a custom reply or load a draft with the pen icon."
                      className="w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--white)] px-4 py-3 text-[14px] leading-6 outline-none transition placeholder:text-[var(--text-soft)] focus:border-[var(--orange)]"
                    />

                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        className="h-10 rounded-[10px] border border-[var(--border)] bg-[var(--white)] px-4 text-[13px] font-medium text-[var(--text)] transition hover:bg-[var(--surface)]"
                      >
                        Open in Gorgias
                      </button>
                      <button
                        type="button"
                        onClick={() => sendReply(editorText)}
                        disabled={!editorText.trim()}
                        className={`h-10 rounded-[10px] px-4 text-[13px] font-semibold text-white transition ${
                          editorText.trim()
                            ? "bg-[var(--orange)] hover:opacity-92"
                            : "cursor-not-allowed bg-[#f1b8a6]"
                        }`}
                      >
                        Send to Gorgias
                      </button>
                    </div>
                  </div>
                </footer>
              </>
            ) : null}
          </section>

          <aside className="hidden min-h-0 flex-col bg-[var(--white)] xl:flex">
            {selectedConversation ? (
              <>
                <div className="border-b border-[var(--border)] px-4 py-4">
                  <div className="text-[15px] font-semibold">Knowledge</div>
                  <div className="mt-1 text-[12px] text-[var(--text-soft)]">
                    Product notes used for reply grounding.
                  </div>
                </div>

                <div className="scroll-subtle min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <div className="space-y-3">
                    {relatedKnowledge.map((card) => (
                      <article
                        key={card.id}
                        className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[13px] font-semibold">
                            {card.title}
                          </div>
                          <div className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                            {card.type}
                          </div>
                        </div>
                        <p className="mt-2 text-[12px] leading-5 text-[var(--text-soft)]">
                          {card.body}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </aside>
        </section>
      </main>

      <AiSettingsModal
        channelLabel={selectedConversationChannel.label}
        credentialMessage={credentialMessage}
        draftProfiles={Object.values(MODEL_PROFILES)}
        guidance={modalGuidance}
        isSavingCredential={isSavingCredential}
        modelOverride={modalModelOverride}
        onClose={() => setIsSettingsOpen(false)}
        onGuidanceChange={setModalGuidance}
        onModelOverrideChange={setModalModelOverride}
        onSave={handleSaveSettings}
        onSaveProviderKey={handleSaveProviderKey}
        open={isSettingsOpen}
        providerRoutes={Object.values(PROVIDER_ROUTES)}
        providerStatuses={providerStatuses}
        selectedProfileId={modalProfileId}
        selectedRouteId={modalRouteId}
        setSelectedProfileId={(value) =>
          setModalProfileId(value as ModelProfileId)
        }
        setSelectedRouteId={(value) =>
          setModalRouteId(value as ProviderRouteId)
        }
      />
    </>
  );
}

function filterConversations(conversationList: Conversation[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return conversationList;
  }

  return conversationList.filter((conversation) =>
    [
      conversation.customerName,
      conversation.customerHandle,
      conversation.latestPreview,
      conversation.intent,
      conversation.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ label }: { label: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gray)] text-[11px] font-semibold text-[var(--text)]">
      {getInitials(label)}
    </div>
  );
}

function MessageRow({ message }: { message: Message }) {
  if (message.authorType === "internal") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[84%] rounded-[10px] border border-dashed border-[var(--border)] bg-[var(--white)] px-3 py-2 text-[12px] leading-5 text-[var(--text-soft)]">
          <span className="font-semibold text-[var(--text)]">
            {message.authorName}:
          </span>{" "}
          {message.body}
        </div>
      </div>
    );
  }

  const isOutbound =
    message.authorType === "agent" || message.authorType === "ai";

  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[78%] gap-3 ${
          isOutbound ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isOutbound ? <Avatar label={message.authorName} /> : null}

        <div
          className={`min-w-0 ${isOutbound ? "items-end text-right" : "items-start"} flex flex-col`}
        >
          <div
            className={`rounded-[12px] px-4 py-3 text-[14px] leading-6 ${
              isOutbound
                ? "border border-[var(--orange)] bg-[var(--orange-soft)] text-[var(--text)]"
                : "border border-[var(--border)] bg-[var(--white)] text-[var(--text)]"
            }`}
          >
            {message.body}
          </div>
          <div className="mt-1 text-[11px] text-[var(--text-soft)]">
            {message.authorName} | {message.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftMetaRow({
  diagnostics,
  generationError,
  modelLabel,
  profileLabel,
  providerLabel,
}: {
  diagnostics?: DraftGenerationResponse["diagnostics"];
  generationError: string | null;
  modelLabel: string;
  profileLabel: string;
  providerLabel: string;
}) {
  const providerText = diagnostics?.providerLabel ?? providerLabel;
  const profileText = diagnostics?.profileLabel ?? profileLabel;
  const modelText = diagnostics?.model ?? modelLabel;
  const isFallback =
    typeof diagnostics?.usedFallback === "boolean"
      ? diagnostics.usedFallback
      : providerText === "Mock Studio";
  const statusTone = isFallback
    ? "bg-[#fff1ec] text-[var(--orange)]"
    : "bg-[#dcfce7] text-[#15803d]";
  const statusLabel = isFallback ? "Mock active" : "Live model";

  return (
    <div className="flex justify-end">
      <div
        className="w-full border-t border-[var(--border)]/70 pt-3"
        style={{
          marginRight: "2.75rem",
          maxWidth: "calc(82% - 2.75rem)",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Draft engine
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-soft)]">
              <span>{providerText}</span>
              <span className="text-[var(--border)]">/</span>
              <span>{profileText}</span>
              <span className="text-[var(--border)]">/</span>
              <span className="truncate">{modelText}</span>
            </div>
          </div>
          <div
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTone}`}
          >
            {statusLabel}
          </div>
        </div>

        {diagnostics?.warning ? (
          <div className="mt-3 rounded-[10px] bg-[#fff1ec] px-3 py-2 text-[12px] leading-5 text-[var(--orange)]">
            {diagnostics.warning}
          </div>
        ) : null}

        {!diagnostics?.warning && generationError ? (
          <div className="mt-3 rounded-[10px] bg-[#fff1ec] px-3 py-2 text-[12px] leading-5 text-[var(--orange)]">
            {generationError}
          </div>
        ) : null}

        {diagnostics?.guidanceNotes.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {diagnostics.guidanceNotes.slice(0, 3).map((note) => (
              <span
                key={note}
                className="rounded-full bg-[var(--white)] px-2.5 py-1 text-[11px] text-[var(--text-soft)]"
              >
                {note}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DraftSkeleton() {
  return (
    <div className="flex justify-end">
      <div className="w-full max-w-[82%] rounded-[12px] border border-dashed border-[var(--border)] bg-[var(--white)] px-4 py-4">
        <div className="h-3 w-20 rounded-full bg-[var(--gray)]" />
        <div className="mt-4 space-y-2">
          <div className="h-3 rounded-full bg-[var(--surface)]" />
          <div className="h-3 w-[82%] rounded-full bg-[var(--surface)]" />
        </div>
      </div>
    </div>
  );
}

function DraftBubble({
  draft,
  onEdit,
  onRegenerate,
  onSend,
  isRegenerating,
}: {
  draft: DraftCandidate;
  onEdit: () => void;
  onRegenerate: () => void;
  onSend: () => void;
  isRegenerating: boolean;
}) {
  return (
    <div className="flex justify-end">
      <div className="flex w-full max-w-[82%] items-start gap-2">
        <button
          type="button"
          onClick={onSend}
          className={`relative flex-1 rounded-[12px] px-4 py-3 text-left transition ${
            draft.recommended
              ? "bg-[var(--orange-soft)] [--draft-outline-color:var(--orange)] hover:opacity-92"
              : "bg-[var(--white)] [--draft-outline-color:var(--border)] hover:bg-[var(--orange-soft)] hover:[--draft-outline-color:var(--orange)]"
          }`}
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <rect
              x="0.5"
              y="0.5"
              rx="12"
              ry="12"
              width="calc(100% - 1px)"
              height="calc(100% - 1px)"
              fill="none"
              stroke="var(--draft-outline-color)"
              strokeWidth="1"
              strokeDasharray="5 5"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
              {draft.label}
            </span>
            {draft.recommended ? (
              <span className="rounded-full bg-[var(--orange)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                Recommended
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-soft)]">
            {draft.body}
          </p>
        </button>

        <div className="mt-2 flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--white)] text-[var(--text-soft)] transition hover:border-[var(--orange)] hover:text-[var(--orange)]"
            aria-label={`Edit ${draft.label} draft`}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className={`flex h-8 w-9 items-center justify-center rounded-full border bg-[var(--white)] transition ${
              isRegenerating
                ? "cursor-not-allowed border-[#f1b8a6] text-[#f1b8a6]"
                : "border-[var(--border)] text-[var(--text-soft)] hover:border-[var(--orange)] hover:text-[var(--orange)]"
            }`}
            aria-label={`Regenerate ${draft.label} draft`}
          >
            <RegenerateIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 13.75v2.75h2.75L14.6 8.15l-2.75-2.75L3.5 13.75Z" />
      <path d="m10.85 6.4 2.75 2.75" />
      <path d="m12.8 4.45 1.1-1.1a1.56 1.56 0 0 1 2.2 2.2L15 6.65" />
    </svg>
  );
}

function RegenerateIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 10a6 6 0 1 1-1.52-4.02" />
      <path d="M16 4.75v3.5h-3.5" />
    </svg>
  );
}

function StatusBadge({ status }: { status: Conversation["status"] }) {
  const styles: Record<Conversation["status"], string> = {
    "Needs reply": "bg-[#fee2e2] text-[#b91c1c]",
    Watching: "bg-[#fef3c7] text-[#b45309]",
    "Ready to send": "bg-[#dcfce7] text-[#15803d]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Conversation["priority"];
}) {
  const styles: Record<Conversation["priority"], string> = {
    High: "bg-[#fff1ec] text-[var(--orange)]",
    Medium: "bg-[#fef3c7] text-[#b45309]",
    Low: "bg-[var(--gray)] text-[var(--graphite)]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}
