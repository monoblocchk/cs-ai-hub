import { promises as fs } from "node:fs";
import path from "node:path";

const ENV_FILE_PATH = path.join(process.cwd(), ".env.local");

export async function readEnvFile() {
  try {
    return await fs.readFile(ENV_FILE_PATH, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

export function parseEnvFile(content: string) {
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

export async function writeEnvVariable(envName: string, value: string) {
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

export async function getEnvFileValue(envName: string) {
  const envFileContent = await readEnvFile();
  return parseEnvFile(envFileContent).get(envName) ?? "";
}
