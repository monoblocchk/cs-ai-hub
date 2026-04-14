import { NextResponse } from "next/server";
import { fetchGorgiasPreview } from "@/lib/gorgias/service";
import type { GorgiasPreviewRequest } from "@/lib/gorgias/types";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GorgiasPreviewRequest;
    const response = await fetchGorgiasPreview(payload);
    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load the Gorgias read-only preview.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
