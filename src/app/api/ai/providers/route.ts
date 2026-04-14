import { NextResponse } from "next/server";
import { PROVIDER_ROUTES } from "@/lib/ai/catalog";
import type { ProviderConnectionStatus, ProviderRouteId } from "@/lib/ai/types";
import { parseEnvFile, readEnvFile, writeEnvVariable } from "@/lib/server/env-file";

async function buildProviderStatuses(): Promise<ProviderConnectionStatus[]> {
  const envFileContent = await readEnvFile();
  const envFileValues = parseEnvFile(envFileContent);

  return Object.values(PROVIDER_ROUTES).map((route) => {
    const tokenEnv = route.tokenEnv;
    const savedToEnvFile = tokenEnv ? Boolean(envFileValues.get(tokenEnv)) : true;
    const activeInRuntime = tokenEnv ? Boolean(process.env[tokenEnv]) : true;

    return {
      activeInRuntime,
      description: route.description,
      id: route.id,
      isBuiltIn: !tokenEnv,
      label: route.label,
      requiresRestart: Boolean(tokenEnv) && savedToEnvFile && !activeInRuntime,
      savedToEnvFile,
      tokenEnv,
    };
  });
}

export async function GET() {
  const providers = await buildProviderStatuses();

  return NextResponse.json({
    envFileName: ".env.local",
    providers,
    restartHint:
      "Restart the dev server after saving a new key so the runtime can pick it up.",
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      apiKey?: string;
      providerRouteId?: ProviderRouteId;
    };
    const route =
      payload.providerRouteId && payload.providerRouteId in PROVIDER_ROUTES
        ? PROVIDER_ROUTES[payload.providerRouteId]
        : null;

    if (!route) {
      return NextResponse.json(
        { error: "Unknown provider route." },
        { status: 400 },
      );
    }

    if (!route.tokenEnv) {
      return NextResponse.json(
        { error: "This route does not require an API key." },
        { status: 400 },
      );
    }

    const apiKey = payload.apiKey?.trim() ?? "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please paste an API key before saving." },
        { status: 400 },
      );
    }

    await writeEnvVariable(route.tokenEnv, apiKey);

    return NextResponse.json({
      envFileName: ".env.local",
      message: `Saved ${route.tokenEnv} to .env.local. Restart the dev server to activate it.`,
      providers: await buildProviderStatuses(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update provider credentials.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
