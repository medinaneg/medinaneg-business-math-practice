#!/usr/bin/env node
/**
 * Extract Automation B JSON from a Slack message line.
 * Usage:
 *   node scripts/parse-submit-from-slack.mjs 'BUSINESS_MATH_SUBMIT {"student_id":"S001",...}'
 *   echo '...' | node scripts/parse-submit-from-slack.mjs
 */
const KEYWORD = "BUSINESS_MATH_SUBMIT";

export function extractSubmitJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("empty input");
  }
  const trimmed = text.trim();
  const idx = trimmed.indexOf(KEYWORD);
  if (idx === -1) {
    throw new Error(`missing keyword ${KEYWORD}`);
  }
  const after = trimmed.slice(idx + KEYWORD.length).trimStart();
  const start = after.indexOf("{");
  if (start === -1) {
    throw new Error("no JSON object after keyword");
  }
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < after.length; i++) {
    const ch = after[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(after.slice(start, i + 1));
      }
    }
  }
  throw new Error("unbalanced JSON braces");
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

const argLine = process.argv.slice(2).join(" ").trim();
const raw = argLine || (await readStdin()).trim();

try {
  const payload = extractSubmitJson(raw);
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
} catch (err) {
  console.error(err.message || String(err));
  process.exit(1);
}