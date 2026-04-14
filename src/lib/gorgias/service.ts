import type { DraftMode, DraftVariant } from "@/lib/mock-data";
import type { GorgiasPreviewRequest, GorgiasPreviewResponse, GorgiasTicket, GorgiasTicketMessage, NormalizedGorgiasConversation } from "@/lib/gorgias/types";

function normalizeDomain(accountDomain: string) {
  const trimmed = accountDomain.trim().replace(/^https?:\/\//, "");
  return trimmed.endsWith(".gorgias.com") ? trimmed : `${trimmed}.gorgias.com`;
}

function toBasicAuth(email: string, apiKey: string) {
  return Buffer.from(`${email}:${apiKey}`).toString("base64");
}

function toDateLabel(value?: string) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function toRelativeLabel(value?: string) {
  if (!value) {
    return "recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} d ago`;
}

function inferChannelId(channelValue?: string) {
  const normalized = channelValue?.toLowerCase() ?? "";

  if (normalized.includes("instagram") && normalized.includes("comment")) {
    return "instagram-comments";
  }

  if (normalized.includes("instagram")) {
    return "instagram-dm";
  }

  if (normalized.includes("whatsapp")) {
    return "whatsapp";
  }

  return "email";
}

function inferPriority(priority?: string) {
  const normalized = priority?.toLowerCase() ?? "";

  if (normalized.includes("high") || normalized.includes("urgent")) {
    return "High" as const;
  }

  if (normalized.includes("low")) {
    return "Low" as const;
  }

  return "Medium" as const;
}

function inferStatus(ticket: GorgiasTicket, messages: GorgiasTicketMessage[]) {
  const normalizedStatus = ticket.status?.toLowerCase() ?? "";
  const lastMessage = messages[messages.length - 1];

  if (normalizedStatus.includes("open") || normalizedStatus.includes("pending")) {
    return lastMessage?.from_agent ? ("Watching" as const) : ("Needs reply" as const);
  }

  if (lastMessage?.from_agent) {
    return "Ready to send" as const;
  }

  return "Watching" as const;
}

function buildDraftSeed(body: string): Record<DraftMode, DraftVariant[]> {
  const seed = body.trim() || "Thanks for your message.";

  return {
    support: [
      { body: seed, focus: "Fallback", id: `support-${Date.now()}`, label: "Support" },
      { body: seed, focus: "Fallback", id: `support-short-${Date.now()}`, label: "Short" },
      { body: seed, focus: "Fallback", id: `support-formal-${Date.now()}`, label: "Formal" },
    ],
    sales: [
      { body: seed, focus: "Fallback", id: `sales-${Date.now()}`, label: "Sales" },
    ],
    hype: [
      { body: seed, focus: "Fallback", id: `hype-${Date.now()}`, label: "Hype" },
    ],
  };
}

function normalizeMessage(message: GorgiasTicketMessage) {
  const isNote = Boolean(message.is_note) || message.message_type === "note";
  const fromAgent = Boolean(message.from_agent);
  const body = message.body_text?.trim() || message.text?.trim() || message.subject?.trim() || "";

  return {
    authorName:
      message.sender?.name ||
      (isNote ? "Internal note" : fromAgent ? "Monoblocc Team" : "Customer"),
    authorType: isNote
      ? ("internal" as const)
      : fromAgent
        ? ("agent" as const)
        : ("customer" as const),
    body: body || "(No text content)",
    direction: isNote
      ? ("note" as const)
      : fromAgent
        ? ("outbound" as const)
        : ("inbound" as const),
    id: `gorgias-message-${message.id}`,
    timestamp: toDateLabel(message.created_datetime),
  };
}

function normalizeConversation(
  accountDomain: string,
  ticket: GorgiasTicket,
  messages: GorgiasTicketMessage[],
): NormalizedGorgiasConversation {
  const normalizedMessages = messages.map(normalizeMessage);
  const latestMessage = normalizedMessages[normalizedMessages.length - 1];
  const latestCustomerMessage =
    [...normalizedMessages]
      .reverse()
      .find((message) => message.authorType === "customer")?.body ||
    latestMessage?.body ||
    ticket.last_message?.body_text ||
    ticket.subject ||
    "New message";
  const customerName =
    ticket.customer?.name || ticket.customer?.email || `Ticket ${ticket.id}`;
  const customerHandle = ticket.customer?.email ? `@${ticket.customer.email}` : `#${ticket.id}`;
  const channelId = inferChannelId(ticket.channel);

  return {
    channelId,
    customerHandle,
    customerMeta: `${ticket.channel ?? "Gorgias"} thread`,
    customerName,
    drafts: buildDraftSeed(latestCustomerMessage),
    externalTicketId: String(ticket.id),
    externalTicketUrl: ticket.uri,
    id: `gorgias-ticket-${ticket.id}`,
    intent: ticket.subject || "Gorgias support thread",
    knowledgeIds: [],
    latestCustomerMessage,
    latestPreview: latestMessage?.body || latestCustomerMessage,
    messages: normalizedMessages,
    nextBestAction: latestMessage?.authorType === "customer"
      ? "Review the live thread and draft a response in the AI layer."
      : "Review the latest agent update before drafting a follow-up.",
    priority: inferPriority(ticket.priority),
    readOnly: true,
    source: "gorgias",
    sourceLabel: "Gorgias",
    status: inferStatus(ticket, messages),
    summary:
      ticket.subject ||
      `Imported from Gorgias ticket ${ticket.id} on ${ticket.channel ?? "an unknown channel"}.`,
    tags: (ticket.tags ?? []).map((tag) =>
      typeof tag === "string" ? tag : tag.name ?? "tag",
    ),
    unreadCount: latestMessage?.authorType === "customer" ? 1 : 0,
    updatedAt: toRelativeLabel(ticket.updated_datetime || ticket.created_datetime),
  };
}

async function fetchJson<T>(url: string, authHeader: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gorgias returned ${response.status} for ${url}. ${errorText.slice(0, 240)}`,
    );
  }

  return (await response.json()) as T;
}

function extractTicketList(payload: unknown): GorgiasTicket[] {
  if (Array.isArray(payload)) {
    return payload as GorgiasTicket[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: GorgiasTicket[] }).data;
  }

  return [];
}

function extractTicketMessages(payload: unknown): GorgiasTicketMessage[] {
  if (Array.isArray(payload)) {
    return payload as GorgiasTicketMessage[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: GorgiasTicketMessage[] }).data;
  }

  return [];
}

export async function fetchGorgiasPreview(
  request: GorgiasPreviewRequest,
): Promise<GorgiasPreviewResponse> {
  const apiKey = process.env.GORGIAS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing GORGIAS_API_KEY. Save it in the admin workspace and restart the dev server.",
    );
  }

  if (!request.accountDomain.trim() || !request.email.trim()) {
    throw new Error("Gorgias domain and email are required before preview sync can run.");
  }

  const normalizedDomain = normalizeDomain(request.accountDomain);
  const authHeader = toBasicAuth(request.email.trim(), apiKey);
  const limit = Math.max(1, Math.min(request.ticketLimit || 8, 20));
  const ticketsUrl = `https://${normalizedDomain}/api/tickets?limit=${limit}`;
  const ticketPayload = await fetchJson<unknown>(ticketsUrl, authHeader);
  const tickets = extractTicketList(ticketPayload).slice(0, limit);

  const conversations = await Promise.all(
    tickets.map(async (ticket) => {
      const messagesUrl = `https://${normalizedDomain}/api/tickets/${ticket.id}/messages`;
      const messagePayload = await fetchJson<unknown>(messagesUrl, authHeader);
      const messages = extractTicketMessages(messagePayload);
      return normalizeConversation(normalizedDomain, ticket, messages);
    }),
  );

  return {
    connectionSummary: `Fetched ${conversations.length} read-only tickets from ${normalizedDomain}.`,
    conversations,
    fetchedAt: new Date().toISOString(),
    ticketCount: conversations.length,
  };
}
