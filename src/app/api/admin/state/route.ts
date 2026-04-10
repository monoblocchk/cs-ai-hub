import { NextResponse } from "next/server";
import { readAdminState, writeAdminState } from "@/lib/admin/store";
import type { AdminState } from "@/lib/admin/types";

export async function GET() {
  try {
    const state = await readAdminState();
    return NextResponse.json(state);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as Partial<AdminState>;
    const state = await writeAdminState(payload);
    return NextResponse.json(state);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save admin state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
