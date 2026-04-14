import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  IntercomImportRequest,
  IntercomImportResponse,
  StoredIntercomImport,
} from "@/lib/intercom/types";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const INTERCOM_IMPORT_FILE = path.join(DATA_DIRECTORY, "intercom-import.json");

async function ensureDataDirectory() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
}

export async function readStoredIntercomImport() {
  await ensureDataDirectory();

  try {
    const raw = await fs.readFile(INTERCOM_IMPORT_FILE, "utf8");
    return JSON.parse(raw) as StoredIntercomImport;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function writeStoredIntercomImport(
  request: IntercomImportRequest,
  response: IntercomImportResponse,
) {
  await ensureDataDirectory();

  const stored: StoredIntercomImport = {
    ...response,
    rawConversationIds: response.conversations.map(
      (conversation) => conversation.externalTicketId,
    ),
    request,
    storedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    INTERCOM_IMPORT_FILE,
    JSON.stringify(stored, null, 2),
    "utf8",
  );

  return stored;
}
