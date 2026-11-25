#!/usr/bin/env node
/**
 * Daily quiz publisher — Sheets fallback: JSON under automation/data + automation/daily/
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TOPICS,
  TOPIC_LABELS,
  topicLevel,
  selectQuestions,
  formItemTitle,
} from "./lib/adaptive.mjs";

const __dir = dirname(fileURLToPath(import.meta.url));
const autoRoot = join(__dir, "..");

function loadJson(rel) {
  const p = join(autoRoot, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

function saveJson(rel, data) {
  const p = join(autoRoot, rel);
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

async function tryGoogleSheets() {
  return { ok: false, reason: "Google Drive MCP not configured in this environment" };
}

function quizDateInTaipei(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

function getDateArg() {
  const arg = process.argv.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  if (arg) return arg;
  const env = process.env.QUIZ_DATE;
  if (env) return env;
  return quizDateInTaipei();
}

function dedupeAssignments(records, date) {
  const kept = records.filter((r) => r.date !== date);
  const byStudent = new Map();
  for (const row of records) {
    if (row.date !== date) continue;
    byStudent.set(row.student_id, row);
  }
  for (const row of byStudent.values()) kept.push(row);
  return kept;
}

async function publish() {
  const date = getDateArg();
  const publishedAt = new Date().toISOString();
  const dailyPath = join(autoRoot, "daily", `${date}.json`);
  const force = process.env.FORCE_PUBLISH === "1";
  if (!force && existsSync(dailyPath)) {
    const existing = JSON.parse(readFileSync(dailyPath, "utf8"));
    const summary = {
      date,
      skipped: true,
      reason: "Daily artifact already exists (set FORCE_PUBLISH=1 to overwrite)",
      students_processed: existing.students?.length ?? 0,
      example_form: existing.students?.[0]?.form_url ?? null,
      level_mix: existing.class_level_mix_sample,
      errors: [],
    };
    console.log(JSON.stringify(summary, null, 2));
    return summary;
  }

  const errors = [];
  let sheets = await tryGoogleSheets();
  if (!sheets.ok) {
    errors.push(`Sheets: ${sheets.reason} — using JSON fallback`);
  }

  const { execFileSync } = await import("node:child_process");
  let bank = loadJson("data/question-bank.json");
  const beforeCount = bank?.questions?.length ?? 0;
  if (!bank || bank.questions.length < 30) {
    execFileSync("node", [join(__dir, "build-question-bank.mjs")], { stdio: "inherit" });
    bank = loadJson("data/question-bank.json");
  }
  const bankGenerated = Math.max(0, bank.questions.length - beforeCount);

  const roster = loadJson("data/roster.json");
  const topicState = loadJson("data/student-topic-state.json") || { records: [] };
  const attempts = (loadJson("data/attempts.json") || { records: [] }).records;
  let assignments = dedupeAssignments(
    (loadJson("data/daily-assignments.json") || { records: [] }).records,
    date
  );

  const active = (roster?.students || []).filter((s) => s.active);
  const dailyArtifact = {
    date,
    published_at: publishedAt,
    sheets_connected: sheets.ok,
    students: [],
    class_level_mix_sample: null,
    bank_count: bank.questions.length,
    bank_items_generated_this_run: bankGenerated,
    errors,
  };

  let sampled = 0;
  let generated = 0;

  for (const student of active) {
    const topicLevels = Object.fromEntries(
      TOPICS.map((t) => [t, topicLevel(topicState.records, student.student_id, t)])
    );

    const picked = selectQuestions({
      bank: bank.questions,
      studentId: student.student_id,
      topicLevels,
      attempts,
      assignments,
      asOfDate: date,
    });

    sampled += picked.length;

    const row = {
      date,
      student_id: student.student_id,
      form_url: student.form_url,
      item_ids: picked.map((q) => q.q_id).join(","),
      published_at: publishedAt,
    };
    assignments.push(row);

    const items = picked.map((q) => ({
      q_id: q.q_id,
      title: formItemTitle(q),
      topic: q.topic,
      sub_skill: q.sub_skill,
      level: q.level,
      stem: q.stem,
      choices: { A: q.choice_a, B: q.choice_b, C: q.choice_c, D: q.choice_d },
      correct: q.correct,
    }));

    dailyArtifact.students.push({
      student_id: student.student_id,
      display_name: student.display_name,
      form_url: student.form_url,
      topic_levels: topicLevels,
      items,
    });

    if (!dailyArtifact.class_level_mix_sample) {
      dailyArtifact.class_level_mix_sample = topicLevels;
    }
  }

  saveJson("data/daily-assignments.json", { records: assignments });

  const dailyDir = join(autoRoot, "daily");
  mkdirSync(dailyDir, { recursive: true });
  writeFileSync(dailyPath, JSON.stringify(dailyArtifact, null, 2) + "\n");

  const summary = {
    date,
    students_processed: active.length,
    items_bank_sampled: sampled,
    items_generated: bankGenerated,
    errors,
    daily_path: dailyPath,
    example_form: active[0]?.form_url ?? null,
    level_mix: dailyArtifact.class_level_mix_sample,
  };

  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

publish().catch((err) => {
  console.error(err);
  process.exit(1);
});