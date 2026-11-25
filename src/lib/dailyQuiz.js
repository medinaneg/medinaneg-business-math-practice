import { questions as staticQuestions } from "../data/questions.js";

const bankUrl = `${import.meta.env.BASE_URL}automation/data/question-bank.json`;

export function readQuizParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    studentId: (params.get("student_id") || "").trim(),
    date: (params.get("date") || "").trim(),
  };
}

export function formatLevelMix(levels) {
  if (!levels) return "";
  return [
    `Commission L${levels.commission}`,
    `Best buy L${levels.bestBuy}`,
    `Profit L${levels.profit}`,
    `Installment L${levels.installment}`,
  ].join(" · ");
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadDailyAssignment(date) {
  const dailyPath = `${import.meta.env.BASE_URL}automation/daily/${date}.json`;
  try {
    return await fetchJson(dailyPath);
  } catch {
    const aggPath = `${import.meta.env.BASE_URL}automation/data/daily-assignments.json`;
    try {
      const agg = await fetchJson(aggPath);
      const day = agg.assignments?.find((a) => a.date === date);
      if (day) return day;
    } catch {
      /* fall through */
    }
  }
  return null;
}

async function loadQuestionBank() {
  try {
    const data = await fetchJson(bankUrl);
    return data.questions || [];
  } catch {
    return null;
  }
}

function resolveQuestions(bank, questionIds) {
  if (!bank?.length) {
    return staticQuestions.filter((q) =>
      questionIds?.length ? questionIds.includes(q.id) : true
    );
  }
  const byId = new Map(bank.filter((q) => !q.stub).map((q) => [q.id, q]));
  if (questionIds?.length) {
    return questionIds
      .map((id) => byId.get(id))
      .filter(Boolean);
  }
  return staticQuestions;
}

export async function loadDailyQuiz(studentId, date) {
  const assignment = await loadDailyAssignment(date);
  const student = assignment?.students?.find(
    (s) => s.student_id === studentId
  );

  if (!student && assignment) {
    return {
      ok: false,
      error: "not_on_roster",
      message: `No quiz assignment found for student ${studentId} on ${date}. Check your link from Slack.`,
    };
  }

  const questionIds = student?.question_ids;
  const bank = await loadQuestionBank();
  let quizQuestions = resolveQuestions(bank, questionIds);

  if (!quizQuestions.length) {
    quizQuestions = staticQuestions;
  }

  return {
    ok: true,
    date,
    studentId,
    displayName: student?.display_name || "",
    levels: student?.levels,
    usedFallback: !assignment,
    quizQuestions,
    subtitle:
      student?.levels
        ? `Level mix · ${formatLevelMix(student.levels)}`
        : "Grade 8 · Business Math · Static sample (daily file not found)",
  };
}