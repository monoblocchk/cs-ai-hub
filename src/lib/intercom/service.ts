import type { DraftMode, DraftVariant } from "@/lib/mock-data";
import type {
  IntercomApiRegion,
  IntercomAuthor,
  IntercomConversation,
  IntercomConversationList,
  IntercomConversationPart,
  IntercomConversationSource,
  IntercomContact,
  IntercomImportRequest,
  IntercomImportResponse,
  NormalizedIntercomConversation,
  NormalizedIntercomMessage,
} from "@/lib/intercom/types";

const INTERCOM_API_VERSION = "2.11";
const REGION_BASE_URLS: Record<IntercomApiRegion, string> = {
  au: "https://api.au.intercom.io",
  eu: "https://api.eu.intercom.io",
  us: "https://api.intercom.io",
};

function getBaseUrl(region: IntercomApiRegion) {
  return REGION_BASE_URLS[region] ?? REGION_BASE_URLS.us;
}

function toUnixDate(value: string) {
  if (!value.trim()) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Math.floor(date.getTime() / 1000);
}

function stripHtml(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toDateLabel(value?: number | null) {
  if (!value) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value * 1000));
}

function toRelativeLabel(value?: number | null) {
  if (!value) {
    return "historical";
  }

  const diffMs = Date.now() - value * 1000;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  if (diffDays < 31) {
    return `${diffDays} d ago`;
  }

  const diffMonths = Math.round(diffDays / 30);
  return `${diffMonths} mo ago`;
}

function inferChannelId(source?: IntercomConversationSource | null) {
  const normalized = [
    source?.type,
    source?.delivered_as,
    source?.url,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (normalized.includes("instagram")) {
    return normalized.includes("comment") ? "instagram-comments" : "instagram-dm";
  }

  if (normalized.includes("facebook") || normalized.includes("messenger")) {
    return "facebook";
  }

  if (normalized.includes("whatsapp")) {
    return "whatsapp";
  }

  if (normalized.includes("email")) {
    return "email";
  }

  return "website-chat";
}

function inferPriority(conversation: IntercomConversation) {
  if (conversation.open && !conversation.read) {
    return "High" as const;
  }

  if (conversation.open) {
    return "Medium" as const;
  }

  return "Low" as const;
}

function getCustomer(conversation: IntercomConversation) {
  const contacts = conversation.contacts?.contacts ?? [];
  const firstContact = contacts[0];
  const sourceAuthor = conversation.source?.author;
  const candidate = firstContact ?? sourceAuthor;

  return {
    email: candidate?.email ?? "",
    id: candidate?.id ?? "",
    name:
      candidate?.name ||
      candidate?.email ||
      (candidate?.id ? `Intercom contact ${candidate.id}` : "Intercom contact"),
  };
}

function authorIsCustomer(author?: IntercomAuthor | IntercomContact | null) {
  const type = author?.type?.toLowerCase() ?? "";
  return (
    type.includes("contact") ||
    type.includes("user") ||
    type.includes("lead") ||
    type.includes("visitor")
  );
}

function authorName(
  author: IntercomAuthor | IntercomContact | null | undefined,
  fallbackCustomer: string,
) {
  if (!author) {
    return fallbackCustomer;
  }

  return author.name || author.email || author.id || fallbackCustomer;
}

function sourceToMessage(
  source: IntercomConversationSource | null | undefined,
  customerName: string,
): NormalizedIntercomMessage | null {
  const body = stripHtml(source?.body || source?.subject);

  if (!body) {
    return null;
  }

  const isCustomer = authorIsCustomer(source?.author);

  return {
    authorName: isCustomer
      ? authorName(source?.author, customerName)
      : authorName(source?.author, "Monoblocc Team"),
    authorType: isCustomer ? "customer" : "agent",
    body,
    direction: isCustomer ? "inbound" : "outbound",
    id: `intercom-source-${source?.id ?? "initial"}`,
    timestamp: "Initial message",
  };
}

function partToMessage(
  part: IntercomConversationPart,
  customerName: string,
): NormalizedIntercomMessage | null {
  const body = stripHtml(part.body);

  if (!body || part.redacted) {
    return null;
  }

  const partType = part.part_type?.toLowerCase() ?? "";
  const isInternal = partType.includes("note");
  const isCustomer = authorIsCustomer(part.author);

  return {
    authorName: isInternal
      ? "Intercom internal note"
      : isCustomer
        ? authorName(part.author, customerName)
        : authorName(part.author, "Monoblocc Team"),
    authorType: isInternal ? "internal" : isCustomer ? "customer" : "agent",
    body,
    direction: isInternal ? "note" : isCustomer ? "inbound" : "outbound",
    id: `intercom-part-${part.id ?? part.external_id ?? crypto.randomUUID()}`,
    timestamp: toDateLabel(part.created_at),
  };
}

function buildDraftSeed(body: string): Record<DraftMode, DraftVariant[]> {
  const seed = body.trim() || "Thanks for your message.";

  return {
    hype: [
      { body: seed, focus: "Imported history", id: `intercom-hype-${Date.now()}`, label: "Hype" },
    ],
    sales: [
      { body: seed, focus: "Imported history", id: `intercom-sales-${Date.now()}`, label: "Sales" },
    ],
    support: [
      { body: seed, focus: "Imported history", id: `intercom-support-${Date.now()}`, label: "Support" },
      { body: seed, focus: "Imported history", id: `intercom-short-${Date.now()}`, label: "Short" },
      { body: seed, focus: "Imported history", id: `intercom-formal-${Date.now()}`, label: "Formal" },
    ],
  };
}

function buildExternalUrl(conversationId: string) {
  return `https://app.intercom.com/a/inbox/conversation/${conversationId}`;
}

export function normalizeIntercomConversation(
  conversation: IntercomConversation,
): NormalizedIntercomConversation {
  const customer = getCustomer(conversation);
  const initialMessage = sourceToMessage(conversation.source, customer.name);
  const partMessages =
    conversation.conversation_parts?.conversation_parts
      ?.map((part) => partToMessage(part, customer.name))
      .filter((message): message is NormalizedIntercomMessage => Boolean(message)) ?? [];
  const messages = [
    ...(initialMessage ? [initialMessage] : []),
    ...partMessages,
  ];
  const latestMessage = [...messages].reverse().find(
    (message) => message.authorType !== "internal",
  );
  const latestCustomerMessage =
    [...messages].reverse().find((message) => message.authorType === "customer")
      ?.body ||
    stripHtml(conversation.source?.body || conversation.source?.subject) ||
    "Imported Intercom conversation";
  const channelId = inferChannelId(conversation.source);
  const title =
    stripHtml(conversation.title) ||
    stripHtml(conversation.source?.subject) ||
    "Historical Intercom thread";

  return {
    channelId,
    customerHandle: customer.email ? `@${customer.email}` : `#${customer.id || conversation.id}`,
    customerMeta: "Historical Intercom conversation",
    customerName: customer.name,
    drafts: buildDraftSeed(latestCustomerMessage),
    externalTicketId: conversation.id,
    externalTicketUrl: buildExternalUrl(conversation.id),
    historical: true,
    id: `intercom-conversation-${conversation.id}`,
    intent: title,
    knowledgeIds: [],
    latestCustomerMessage,
    latestPreview: latestMessage?.body || latestCustomerMessage,
    messages,
    nextBestAction:
      "Use this historical thread for drafting/evaluation context only; do not send from Intercom history.",
    priority: inferPriority(conversation),
    readOnly: true,
    source: "intercom",
    sourceCustomerEmail: customer.email,
    sourceCustomerId: customer.id,
    sourceLabel: "Intercom",
    status: conversation.open ? "Needs reply" : "Watching",
    summary: `${title}. Imported from Intercom as read-only historical context.`,
    tags: ["intercom", "historical", channelId],
    unreadCount: conversation.open && !conversation.read ? 1 : 0,
    updatedAt: toRelativeLabel(conversation.updated_at || conversation.created_at),
  };
}

async function fetchIntercomJson<T>(
  baseUrl: string,
  token: string,
  path: string,
  init?: RequestInit,
) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Intercom-Version": INTERCOM_API_VERSION,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Intercom returned ${response.status} for ${path}. ${errorText.slice(0, 240)}`,
    );
  }

  return (await response.json()) as T;
}

function buildConversationSearchBody(request: IntercomImportRequest) {
  const filters: Array<{ field: string; operator: string; value: number }> = [];
  const since = toUnixDate(request.importedSince);
  const until = toUnixDate(request.importedUntil);

  if (since) {
    filters.push({ field: "created_at", operator: ">", value: since });
  }

  if (until) {
    filters.push({ field: "created_at", operator: "<", value: until });
  }

  if (filters.length === 0) {
    return null;
  }

  return {
    pagination: {
      per_page: Math.max(1, Math.min(request.conversationLimit || 10, 50)),
    },
    query:
      filters.length === 1
        ? filters[0]
        : {
            operator: "AND",
            value: filters,
          },
  };
}

async function fetchConversationList(
  baseUrl: string,
  token: string,
  request: IntercomImportRequest,
) {
  const limit = Math.max(1, Math.min(request.conversationLimit || 10, 50));
  const searchBody = buildConversationSearchBody(request);

  if (searchBody) {
    return fetchIntercomJson<IntercomConversationList>(
      baseUrl,
      token,
      "/conversations/search",
      {
        body: JSON.stringify(searchBody),
        method: "POST",
      },
    );
  }

  return fetchIntercomJson<IntercomConversationList>(
    baseUrl,
    token,
    `/conversations?per_page=${limit}`,
  );
}

export async function fetchIntercomImport(
  request: IntercomImportRequest,
): Promise<IntercomImportResponse> {
  const token = process.env.INTERCOM_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      "Missing INTERCOM_ACCESS_TOKEN. Save it in the admin workspace and restart the dev server.",
    );
  }

  const baseUrl = getBaseUrl(request.region);
  const limit = Math.max(1, Math.min(request.conversationLimit || 10, 50));
  const listPayload = await fetchConversationList(baseUrl, token, request);
  const list = (listPayload.conversations ?? []).slice(0, limit);

  const conversations = await Promise.all(
    list.map((conversation) =>
      fetchIntercomJson<IntercomConversation>(
        baseUrl,
        token,
        `/conversations/${conversation.id}`,
      ).then(normalizeIntercomConversation),
    ),
  );

  return {
    connectionSummary: `Imported ${conversations.length} read-only Intercom conversations from ${request.region.toUpperCase()} workspace history.`,
    conversations,
    fetchedAt: new Date().toISOString(),
    totalCount: listPayload.total_count ?? conversations.length,
  };
}
