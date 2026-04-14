import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");
const TOKEN_ENV = "GORGIAS_API_KEY";

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

  await fs.writeFile(
    ENV_FILE_PATH,
    `${lines.join("\n").replace(/\n*$/, "\n")}`,
    "utf8",
  );
}

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
      "Restart the dev server after saving a new Gorgias API key so the runtime can pick it up.",
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { apiKey?: string };
    const apiKey = payload.apiKey?.trim() ?? "";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Please paste a Gorgias API key before saving." },
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
        : "Unable to save the Gorgias API key.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
