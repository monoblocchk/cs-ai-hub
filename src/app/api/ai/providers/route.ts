import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { PROVIDER_ROUTES } from "@/lib/ai/catalog";
import type { ProviderConnectionStatus, ProviderRouteId } from "@/lib/ai/types";

const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");

function parseEnvFile(content: string) {
  const values = new Map<string, string>();

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values.set(key, value);
  }

  return values;
}

async function readEnvFile() {
  try {
    return await fs.readFile(ENV_FILE_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

async function writeEnvVariable(envName: string, value: string) {
  const current = await readEnvFile();
  const lines = current ? current.split(/\r?\n/) : [];
  const nextLine = `${envName}=${JSON.stringify(value)}`;
  const targetPattern = new RegExp(`^\\s*${envName}\\s*=`);
  const existingIndex = lines.findIndex((line) => targetPattern.test(line));

  if (existingIndex >= 0) {
    lines[existingIndex] = nextLine;
  } else {
    if (lines.length > 0 && lines[lines.length - 1]?.trim() !== "") {
      lines.push("");
    }

    lines.push(nextLine);
  }

  const content = `${lines.join("\n").replace(/\n*$/, "\n")}`;
  await fs.writeFile(ENV_FILE_PATH, content, "utf8");
}

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
