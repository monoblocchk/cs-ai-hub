import { NextResponse } from "next/server";
import { fetchIntercomImport } from "@/lib/intercom/service";
import {
  readStoredIntercomImport,
  writeStoredIntercomImport,
} from "@/lib/intercom/store";
import type { IntercomImportRequest } from "@/lib/intercom/types";

export async function GET() {
  try {
    const stored = await readStoredIntercomImport();

    if (!stored) {
      return NextResponse.json({
        connectionSummary: "No Intercom history import has been stored yet.",
        conversations: [],
        fetchedAt: "",
        totalCount: 0,
      });
    }

    return NextResponse.json(stored);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the stored Intercom import.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as IntercomImportRequest;
    const response = await fetchIntercomImport(payload);
    const stored = await writeStoredIntercomImport(payload, response);
    return NextResponse.json(stored);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to import Intercom conversation history.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
