import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "POST.json");
const OUT = join("/output", "POST.json");
const POST_URL =
  /^https:\/\/(?:(?:www|mobile)\.)?(?:x|twitter)\.com\/(?:[A-Za-z0-9_]+|i\/web)\/status\/\d+/;

async function main(): Promise<void> {
  const raw = await readFile(SRC, "utf8");
  const data: unknown = JSON.parse(raw);
  if (
    data === null ||
    typeof data !== "object" ||
    !("url" in data) ||
    typeof (data as { url: unknown }).url !== "string"
  ) {
    throw new Error(
      'POST.json must be {"url": "https://x.com/<handle>/status/<id>"}',
    );
  }
  const url = (data as { url: string }).url.trim();
  if (!POST_URL.test(url)) {
    throw new Error(`POST.json url is not an X post address: ${url}`);
  }
  await mkdir("/output", { recursive: true });
  await copyFile(SRC, OUT);
  console.log(`copied POST.json to ${OUT}`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exit(1);
});
