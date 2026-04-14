import { NextResponse } from "next/server";
import { parseEnvFile, readEnvFile, writeEnvVariable } from "@/lib/server/env-file";

const TOKEN_ENV = "INTERCOM_ACCESS_TOKEN";

async function buildStatus() {
  const envFileContent = await readEnvFile();
  const envFileValues = parseEnvFile(envFileContent);
  const savedToEnvFile = Boolean(envFileValues.get(TOKEN_ENV));
  const activeInRuntime = Boolean(process.env[TOKEN_ENV]);

  return {
    activeInRuntime,
    requiresRestart: savedToEnvFile && !activeInRuntime,
    savedToEnvFile,
    tokenEnv: TOKEN_ENV,
  };
}

export async function GET() {
  return NextResponse.json({
    connection: await buildStatus(),
    envFileName: ".env.local",
    restartHint:
      "Restart the dev server after saving a new Intercom access token so the runtime can pick it up.",
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { apiKey?: string };
    const apiKey = payload.apiKey?.trim() ?? "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please paste an Intercom access token before saving." },
        { status: 400 },
      );
    }

    await writeEnvVariable(TOKEN_ENV, apiKey);

    return NextResponse.json({
      connection: await buildStatus(),
      message: `Saved ${TOKEN_ENV} to .env.local. Restart the dev server to activate it.`,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to save the Intercom access token.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
