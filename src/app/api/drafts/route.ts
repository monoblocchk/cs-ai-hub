import { NextResponse } from "next/server";
import { generateDraftResponse } from "@/lib/ai/service";
import type { DraftGenerationRequest } from "@/lib/ai/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as DraftGenerationRequest;
    const response = await generateDraftResponse(payload);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate drafts for this conversation.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
