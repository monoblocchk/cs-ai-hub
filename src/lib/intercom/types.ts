import type { Conversation, Message } from "@/lib/mock-data";

export type IntercomApiRegion = "au" | "eu" | "us";

export type IntercomConnectionStatus = {
  activeInRuntime: boolean;
  requiresRestart: boolean;
  savedToEnvFile: boolean;
  tokenEnv: string;
};

export type IntercomImportRequest = {
  conversationLimit: number;
  importedSince: string;
  importedUntil: string;
  region: IntercomApiRegion;
};

export type IntercomImportResponse = {
  connectionSummary: string;
  conversations: NormalizedIntercomConversation[];
  fetchedAt: string;
  storedAt?: string;
  totalCount: number;
};

export type IntercomAuthor = {
  email?: string | null;
  id?: string | null;
  name?: string | null;
  type?: string | null;
};

export type IntercomConversationSource = {
  author?: IntercomAuthor | null;
  body?: string | null;
  delivered_as?: string | null;
  id?: string | null;
  subject?: string | null;
  type?: string | null;
  url?: string | null;
};

export type IntercomConversationPart = {
  author?: IntercomAuthor | null;
  body?: string | null;
  created_at?: number | null;
  external_id?: string | null;
  id?: string | null;
  part_type?: string | null;
  redacted?: boolean | null;
  type?: string | null;
  updated_at?: number | null;
};

export type IntercomContact = {
  email?: string | null;
  id?: string | null;
  name?: string | null;
  role?: string | null;
  type?: string | null;
};

export type IntercomConversation = {
  contacts?: {
    contacts?: IntercomContact[];
    type?: string;
  };
  conversation_parts?: {
    conversation_parts?: IntercomConversationPart[];
    type?: string;
  };
  created_at?: number | null;
  id: string;
  open?: boolean | null;
  read?: boolean | null;
  source?: IntercomConversationSource | null;
  state?: string | null;
  title?: string | null;
  updated_at?: number | null;
};

export type IntercomConversationList = {
  conversations?: IntercomConversation[];
  pages?: {
    next?: {
      starting_after?: string;
    } | null;
    page?: number;
    per_page?: number;
    total_pages?: number;
    type?: string;
  } | null;
  total_count?: number;
  type?: string;
};

export type StoredIntercomImport = IntercomImportResponse & {
  rawConversationIds: string[];
  request: IntercomImportRequest;
};

export type NormalizedIntercomConversation = Conversation & {
  externalTicketId: string;
  externalTicketUrl: string;
  historical: true;
  readOnly: true;
  source: "intercom";
  sourceLabel: "Intercom";
};

export type NormalizedIntercomMessage = Message;
