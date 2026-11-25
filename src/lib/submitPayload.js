/** Map question topic label → level field on daily assignment */
const TOPIC_LEVEL_KEY = {
  "Commission and wages": "commission",
  "Best buy": "bestBuy",
  "Profit and sales": "profit",
  "Installment buying": "installment",
};

export function levelForTopic(topic, studentLevels) {
  const key = TOPIC_LEVEL_KEY[topic];
  if (key && studentLevels?.[key] != null) {
    return Number(studentLevels[key]);
  }
  return 1;
}

export function questionPublicId(q) {
  if (q.q_id) return q.q_id;
  const n = Number(q.id);
  if (Number.isFinite(n)) {
    return `Q${String(n).padStart(3, "0")}`;
  }
  return String(q.id);
}

/**
 * Build Automation B JSON body (without the Slack keyword).
 */
export function buildSubmissionPayload({
  studentId,
  displayName,
  date,
  questions,
  answers,
  levels,
}) {
  const answerRows = questions.map((q) => {
    const chosen = answers[q.id] || "";
    const correct = chosen === q.correct;
    return {
      q_id: questionPublicId(q),
      chosen,
      topic: q.topic,
      sub_skill: q.subSkill || q.sub_skill || "TBD",
      level: levelForTopic(q.topic, levels),
      correct,
    };
  });

  return {
    student_id: studentId,
    display_name: displayName,
    date,
    submitted_at: new Date().toISOString(),
    answers: answerRows,
  };
}

export const SLACK_SUBMIT_PREFIX = "BUSINESS_MATH_SUBMIT";

/** Single-line message Automation B parses from Slack. */
export function formatSlackSubmitMessage(payload) {
  return `${SLACK_SUBMIT_PREFIX} ${JSON.stringify(payload)}`;
}

export function submissionStorageKey(studentId, date) {
  return `business-math-submission-${studentId}-${date}`;
}

export function loadStoredSubmission(studentId, date) {
  try {
    const raw = localStorage.getItem(submissionStorageKey(studentId, date));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSubmission(studentId, date, payload, slackLine) {
  try {
    localStorage.setItem(
      submissionStorageKey(studentId, date),
      JSON.stringify({ payload, slackLine, savedAt: new Date().toISOString() })
    );
  } catch {
    /* quota / private mode */
  }
}

const webhookUrl = import.meta.env.VITE_SUBMIT_WEBHOOK_URL || "";

/**
 * Optional serverless proxy (must allow browser CORS).
 * Body: { text: "BUSINESS_MATH_SUBMIT {...}" } or { slack_text, payload }.
 */
export async function postSubmitWebhook(slackLine, payload) {
  if (!webhookUrl) {
    return { attempted: false, ok: false, reason: "no_webhook" };
  }
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: slackLine,
        slack_text: slackLine,
        payload,
        source: "business-math-practice-github-pages",
      }),
    });
    return { attempted: true, ok: res.ok, status: res.status };
  } catch (err) {
    return {
      attempted: true,
      ok: false,
      reason: err?.message || "network_error",
    };
  }
}