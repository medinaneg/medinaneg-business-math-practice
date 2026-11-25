export const TOPICS = [
  "commission_wages",
  "best_buy",
  "profit_sales",
  "installment",
];

export const TOPIC_LABELS = {
  commission_wages: "Commission and wages",
  best_buy: "Best buy",
  profit_sales: "Profit and sales",
  installment: "Installment",
};

export const DEFAULT_LEVEL = 1;
export const MAX_LEVEL = 4;

export function topicLevel(stateRecords, studentId, topic) {
  const row = stateRecords.find(
    (r) => r.student_id === studentId && r.topic === topic
  );
  return row?.level ?? DEFAULT_LEVEL;
}

export function recentQuestionIds(assignments, studentId, asOfDate, days = 14) {
  const cutoff = new Date(asOfDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const ids = new Set();
  for (const row of assignments) {
    if (row.student_id !== studentId) continue;
    if (new Date(row.date) < cutoff) continue;
    for (const id of (row.item_ids || "").split(",").map((s) => s.trim())) {
      if (id) ids.add(id);
    }
  }
  return ids;
}

export function subSkillStats(attempts, studentId) {
  /** @type {Map<string, {recent5: boolean[], recent10: boolean[]}>} */
  const map = new Map();
  const sorted = [...attempts]
    .filter((a) => a.student_id === studentId)
    .sort((a, b) => `${a.date}${a.attempt_id}`.localeCompare(`${b.date}${b.attempt_id}`));

  for (const a of sorted) {
    const key = `${a.topic}|${a.sub_skill}`;
    if (!map.has(key)) map.set(key, { recent5: [], recent10: [] });
    const bucket = map.get(key);
    bucket.recent10.push(a.correct);
    if (bucket.recent10.length > 10) bucket.recent10.shift();
    bucket.recent5.push(a.correct);
    if (bucket.recent5.length > 5) bucket.recent5.shift();
  }
  return map;
}

export function isWeak(stats) {
  if (!stats || stats.recent5.length < 2) return false;
  const misses = stats.recent5.filter((c) => !c).length;
  if (misses >= 2) return true;
  const last5 = stats.recent5.slice(-5);
  if (last5.length === 5 && last5.filter((c) => c).length >= 4) return false;
  return false;
}

export function rollingAccuracy(stats) {
  if (!stats || stats.recent10.length === 0) return 1;
  const hits = stats.recent10.filter(Boolean).length;
  return hits / stats.recent10.length;
}

export function selectQuestions({
  bank,
  studentId,
  topicLevels,
  attempts,
  assignments,
  asOfDate,
}) {
  const exclude = recentQuestionIds(assignments, studentId, asOfDate);
  const available = bank.filter((q) => !exclude.has(q.q_id));
  const stats = subSkillStats(attempts, studentId);

  const weakTargets = [];
  const bySub = new Map();
  for (const q of available) {
    const key = `${q.topic}|${q.sub_skill}`;
    if (!bySub.has(key)) bySub.set(key, []);
    bySub.get(key).push(q);
  }

  for (const [key] of bySub) {
    const [topic, sub_skill] = key.split("|");
    const st = stats.get(key);
    weakTargets.push({
      topic,
      sub_skill,
      weak: isWeak(st),
      accuracy: rollingAccuracy(st),
    });
  }

  weakTargets.sort((a, b) => {
    if (a.weak !== b.weak) return a.weak ? -1 : 1;
    return a.accuracy - b.accuracy;
  });

  const chosen = [];
  const usedIds = new Set();
  const topicCount = Object.fromEntries(TOPICS.map((t) => [t, 0]));

  const pickFromPool = (pool, count, preferLevel) => {
    const sorted = [...pool].sort((a, b) => {
      const da = Math.abs(a.level - preferLevel);
      const db = Math.abs(b.level - preferLevel);
      return da - db;
    });
    let added = 0;
    for (const q of sorted) {
      if (chosen.length >= 10 || added >= count) break;
      if (usedIds.has(q.q_id)) continue;
      chosen.push(q);
      usedIds.add(q.q_id);
      topicCount[q.topic]++;
      added++;
    }
    return added;
  };

  const weakestSubSkills = () =>
    [...weakTargets].sort((a, b) => {
      if (a.weak !== b.weak) return a.weak ? -1 : 1;
      return a.accuracy - b.accuracy;
    });

  for (const topic of TOPICS) {
    const pool = available.filter((q) => q.topic === topic && !usedIds.has(q.q_id));
    pickFromPool(pool, 2, topicLevels[topic] ?? DEFAULT_LEVEL);
  }

  let focusSlots = 6;
  const usedSubSkills = new Set(
    chosen.map((q) => `${q.topic}|${q.sub_skill}`)
  );
  for (const target of weakestSubSkills()) {
    if (focusSlots <= 0 || chosen.length >= 10) break;
    const key = `${target.topic}|${target.sub_skill}`;
    if (usedSubSkills.has(key)) continue;
    const pool = available.filter(
      (q) =>
        q.topic === target.topic &&
        q.sub_skill === target.sub_skill &&
        !usedIds.has(q.q_id)
    );
    if (pickFromPool(pool, 1, topicLevels[target.topic] ?? DEFAULT_LEVEL)) {
      focusSlots--;
      usedSubSkills.add(key);
    }
  }

  while (chosen.length < 10) {
    const deficitTopic = [...TOPICS].sort(
      (a, b) => topicCount[a] - topicCount[b]
    )[0];
    const reviewPool = available.filter(
      (q) =>
        !usedIds.has(q.q_id) &&
        (topicCount[q.topic] < 2 || q.topic === deficitTopic)
    );
    const pool =
      reviewPool.length > 0
        ? reviewPool
        : available.filter((q) => !usedIds.has(q.q_id));
    if (pool.length === 0) break;
    const topic = pool[0].topic;
    if (
      !pickFromPool(pool, 1, topicLevels[topic] ?? DEFAULT_LEVEL) &&
      pool !== available
    ) {
      pickFromPool(
        available.filter((q) => !usedIds.has(q.q_id)),
        1,
        topicLevels[deficitTopic] ?? DEFAULT_LEVEL
      );
    }
  }

  chosen.sort(
    (a, b) => TOPICS.indexOf(a.topic) - TOPICS.indexOf(b.topic) || a.level - b.level
  );

  return chosen.slice(0, 10);
}

export function formItemTitle(q) {
  return `[${q.topic}|${q.sub_skill}|L${q.level}] ${q.stem}`;
}