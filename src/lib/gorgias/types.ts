import type { Conversation, Message } from "@/lib/mock-data";

export type GorgiasConnectionStatus = {
  activeInRuntime: boolean;
  requiresRestart: boolean;
  savedToEnvFile: boolean;
  tokenEnv: string;
};

export type GorgiasPreviewRequest = {
  accountDomain: string;
  email: string;
  ticketLimit: number;
};

export type GorgiasPreviewResponse = {
  connectionSummary: string;
  conversations: Conversation[];
  fetchedAt: string;
  ticketCount: number;
};

export type GorgiasTicket = {
  channel?: string;
  created_datetime?: string;
  customer?: {
    email?: string;
    id?: number | string;
    name?: string;
  };
  id: number | string;
  last_message?: {
    body_text?: string;
    created_datetime?: string;
    text?: string;
  };
  messages_count?: number;
  priority?: string;
  status?: string;
  subject?: string;
  tags?: Array<{ name?: string } | string>;
  updated_datetime?: string;
  uri?: string;
};

export type GorgiasTicketMessage = {
  body_text?: string;
  channel?: string;
  created_datetime?: string;
  from_agent?: boolean;
  id: number | string;
  is_note?: boolean;
  message_type?: string;
  sender?: {
    email?: string;
    name?: string;
  };
  subject?: string;
  text?: string;
};

export type NormalizedGorgiasConversation = Conversation & {
  externalTicketId: string;
  externalTicketUrl?: string;
  readOnly: true;
  source: "gorgias";
};

export type NormalizedGorgiasMessage = Message;
