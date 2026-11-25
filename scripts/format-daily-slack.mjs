#!/usr/bin/env node
/**
 * Format Slack message for daily quiz links (no secrets).
 * Usage: node scripts/format-daily-slack.mjs [YYYY-MM-DD]
 * Env: QUIZ_BASE_URL (default https://medinaneg.github.io/medinaneg-business-math-practice/)
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

const DEFAULT_BASE =
  "https://medinaneg.github.io/medinaneg-business-math-practice/";

function normalizeBase(url) {
  const u = (url || DEFAULT_BASE).trim();
  return u.endsWith("/") ? u : `${u}/`;
}

function loadDaily(date) {
  const paths = [
    join(repoRoot, "automation", "daily", `${date}.json`),
    join(repoRoot, "public", "automation", "daily", `${date}.json`),
  ];
  for (const p of paths) {
    if (existsSync(p)) {
      return JSON.parse(readFileSync(p, "utf8"));
    }
  }
  const assignmentsPath = join(
    repoRoot,
    "automation",
    "data",
    "daily-assignments.json"
  );
  const pubAssignments = join(
    repoRoot,
    "public",
    "automation",
    "data",
    "daily-assignments.json"
  );
  const ap = existsSync(assignmentsPath)
    ? assignmentsPath
    : existsSync(pubAssignments)
      ? pubAssignments
      : null;
  if (ap) {
    const { assignments } = JSON.parse(readFileSync(ap, "utf8"));
    const day = assignments?.find((a) => a.date === date);
    if (day) return day;
  }
  throw new Error(
    `No daily data for ${date}. Expected automation/daily/${date}.json or daily-assignments.json entry.`
  );
}

function quizUrl(base, studentId, date) {
  const params = new URLSearchParams({ student_id: studentId, date });
  return `${base}?${params.toString()}`;
}

function levelMixSummary(students) {
  if (!students?.length) return "—";
  const s = students[0];
  const L = s.levels || {};
  return `C&W L${L.commission ?? "?"}, Best buy L${L.bestBuy ?? "?"}, Profit L${L.profit ?? "?"}, Installment L${L.installment ?? "?"}`;
}

function formatSlack(daily, baseUrl) {
  const { date, students } = daily;
  const lines = [
    `📘 Business Math Day ${date} is live`,
    "Today's quiz (open your own link):",
  ];
  for (const st of students) {
    const url = quizUrl(baseUrl, st.student_id, date);
    lines.push(`• ${st.display_name} (${st.student_id}): ${url}`);
  }
  lines.push(`Level mix (sample): ${levelMixSummary(students)}`);
  lines.push(`Bank: question bank in repo · Students: ${students.length}`);
  return lines.join("\n");
}

const date =
  process.argv[2] ||
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });

const base = normalizeBase(process.env.QUIZ_BASE_URL);
const daily = loadDaily(date);
console.log(formatSlack(daily, base));