import { NextResponse } from "next/server";
import { readEvalState, writeEvalState } from "@/lib/evals/store";
import type { EvalState } from "@/lib/evals/types";

export async function GET() {
  try {
    const state = await readEvalState();
    return NextResponse.json(state);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load evaluation state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as Partial<EvalState>;
    const state = await writeEvalState(payload);
    return NextResponse.json(state);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save evaluation state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
