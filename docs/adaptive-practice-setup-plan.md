# Adaptive business math practice — setup plan

**Timezone:** Asia/Taipei (UTC+8) for all schedules below.

**Recommended stack:** Google Forms + Google Sheets + Apps Script + Slack incoming webhook (see `platform-recommendation.md`).

**Slack channel default:** `#business-math-practice` (teacher can rename; update `SLACK_CHANNEL` in script properties).

---

## 1. Goals

- Publish **one 10-item MC set daily** at **4:00 AM UTC+8**.
- Adjust **next-day difficulty mix** and **sub-skill emphasis** from each student’s rolling performance.
- Notify teachers/students on **each submission** (Slack).
- Send a **weekly teacher report** every **Friday 5:00 PM UTC+8**.

---

## 2. Google Sheet workbook structure

Create one spreadsheet **BusinessMathAdaptive** with these tabs.

### 2.1 `Roster`

| student_id | display_name | email | slack_user_id | active |
|------------|--------------|-------|---------------|--------|

- `student_id`: stable key (e.g. school ID).
- `email` and `slack_user_id`: optional (leave blank for this class). `slack_user_id` only if you later @mention students in Slack.

### 2.2 `QuestionBank`

| q_id | day_pool | topic | sub_skill | level | stem | choice_a | choice_b | choice_c | choice_d | correct | active |

- `level`: 1–4 (Day 1 sample is all Level 1).
- `day_pool`: optional tag (`CORE`, `REMEDIAL`, `STRETCH`) for generator.

### 2.3 `DailyAssignments`

| date | student_id | form_url | form_id | item_ids (csv) | published_at |

- One row per student per day (personalized item list) or one row per day if class shares identical set (simpler for pilot).

### 2.4 `Attempts` (one row per question per submission)

| attempt_id | submitted_at | date | student_id | q_id | topic | sub_skill | level | chosen | correct | seconds |

### 2.5 `StudentTopicState` (rolling, per student × topic)

| student_id | topic | level | last_10_pct | items_in_last_set | updated_at |

### 2.6 `StudentSubSkillState`

| student_id | topic | sub_skill | attempts_window | misses_window | weak_flag | updated_at |

- Maintain last **5 attempts** per sub-skill (ring buffer in script, persist counts).

### 2.7 `WeeklyReports`

| week_ending | generated_at | slack_ts | doc_url | pdf_url | json_snapshot |

---

## 3. Adaptive rules (teacher brief)

### 3.1 Topics and default levels

| Topic | Starting level (new student) |
|-------|------------------------------|
| Commission and wages | 1 |
| Best buy | 1 |
| Profit and sales | 1 |
| Installment buying | 1 |

Levels **1–4**: 1 = one-step whole numbers; 2 = two-step / decimals; 3 = multi-step; 4 = richer context / optional challenge.

### 3.2 Level change after a daily set (per topic)

Use the student’s **score on that topic’s items in today’s 10-question set** (or last topic block if items are evenly mixed—compute per-topic % from `Attempts` for that `date`).

| Topic score today | Level change |
|-------------------|--------------|
| **100%** | Level up by 1 (max 4) |
| **70%–99%** | Stay at current level |
| **Below 70%** | Stay at current level; trigger remedial flow (§3.5) |

### 3.3 Tomorrow’s 10-item composition (weakness weighting **60 / 40**)

For each student, when building the next set:

- **60%** of items (6 questions): sample from sub-skills where `weak_flag = TRUE` OR lowest rolling accuracy in last 10 attempts on that sub-skill.
- **40%** (4 questions): sample from non-weak sub-skills at the student’s **current level** for each topic.

Across the full set of 10, aim for **all four topics represented** (e.g. at least 2 items per topic when possible).

### 3.4 Sub-skill weakness flag

For each `(student_id, topic, sub_skill)`:

- Keep the **last 5 attempts** (correct/incorrect).
- If **≥ 2 misses** in those 5 → set `weak_flag = TRUE`.
- Clear `weak_flag` when the student gets **4 of last 5 correct** on that sub-skill (configurable).

### 3.5 Below 70% on a topic (same day / next day)

When topic score on the submitted set is **&lt; 70%**:

1. Append **2 extra Level 1 (or current level − 1, min 1)** items targeting that topic’s weak sub-skills—deliver as a **follow-up Google Form** link in Slack (or second section of next day’s form).
2. Attach **one worked example** (static URL to a Doc/Slide, or auto-generated from `Solutions` tab keyed by `q_id`).

---

## 4. Daily generation — 4:00 AM UTC+8

### 4.1 Apps Script triggers

```text
Function: dailyPublish
Trigger: Time-driven, every day, 4:00–5:00 AM
Timezone: Asia/Taipei
```

### 4.2 `dailyPublish` workflow

1. **Read** `Roster` where `active = TRUE`.
2. For each student, **read** `StudentTopicState`, `StudentSubSkillState`.
3. **Build item list** (10 `q_id`s) using 60/40 rule and topic coverage.
4. **Create or clone** Google Form for that date:
   - Title: `Business Math — Day YYYY-MM-DD — {display_name}` (or one class form if not personalized).
   - Each question: MC; title prefix `[topic|sub_skill|L{n}]` for parser on submit.
   - Store `form_url` in `DailyAssignments`.
5. **Optional:** Email or Calendar invite with link (class policy).
6. **Slack:** Post to `#business-math-practice`:

```text
📘 Business Math Day {date} is live (due before next day 3:59 AM).
Form: {form_url}
Level mix today: C&W L{n}, Best buy L{n}, Profit L{n}, Installment L{n}.
```

### 4.3 Question generation from bank

- Filter `QuestionBank` by `level` and `sub_skill`.
- Exclude `q_id` used in the last **14 days** for that student to limit repeats.
- If bank too small, duplicate with new numeric variants in `QuestionBank` (teacher authoring).

---

## 5. On each submission

### 5.1 Trigger

```text
Function: onFormSubmit (installable trigger on master template or per-form)
```

### 5.2 Processing steps

1. Parse student identity (collect **student_id** as first question or pre-filled via `?entry.xxx=`).
2. For each response, parse tags from question title → write `Attempts` rows.
3. Update `StudentTopicState` (level rules §3.2).
4. Update `StudentSubSkillState` windows (§3.4).
5. If any topic **&lt; 70%**, enqueue remedial form + worked example links.
6. **Slack** post (see format below).

### 5.3 Slack message format (per submission)

```text
✅ Business Math submitted — {display_name} ({student_id})
Date: {YYYY-MM-DD} · Overall: {score}/10 ({pct}%)

By topic:
• Commission/wages: {n}/{m} ({pct}%) · Level now L{x} {↑|→|↓}
• Best buy: …
• Profit/sales: …
• Installment: …

Weak sub-skills flagged: {list or "none"}
Remedial: {remedial_form_url or "not required"}
Worked example: {url or "—"}
```

Use script property `SLACK_WEBHOOK_URL`; channel is configured on the Slack app side (target `#business-math-practice`).

---

## 6. Weekly teacher report — Friday 5:00 PM UTC+8

### 6.1 Trigger

```text
Function: weeklyTeacherReport
Trigger: Time-driven, Week timer, Friday, 5:00–6:00 PM
Timezone: Asia/Taipei
```

### 6.2 Metrics to compute (class + per student)

**Class-level**

- Participation rate (submitted / active roster).
- Mean overall % and per-topic % for the week.
- Distribution of levels (count at L1–L4 per topic).
- List of sub-skills with highest class-wide miss rate.

**Per student**

- Days submitted / 5 (or school week length).
- Overall % and per-topic %.
- **Strengths:** sub-skills **≥ 85%** over the week (minimum 3 attempts).
- **Needs improvement:** sub-skills **&lt; 70%** or topics below 70%.
- Current level per topic.
- **2–3 recommendations** (rule-based strings, e.g. “Extra practice: down payment vs financed amount”).
- **Intervention list:** students with 2+ topics &lt; 70% or two consecutive days no submit.

### 6.3 Delivery recommendation

| Channel | Use |
|---------|-----|
| **Slack (primary)** | Friday digest to `#business-math-practice` (or private `#business-math-teacher`): class summary + thread per student or attached CSV snippet for strugglers only. Fast for daily classroom teachers. |
| **Google Doc (archive)** | Apps Script creates/appends **Weekly Report — YYYY-MM-DD** in a shared Drive folder: full per-student tables for parent conferences and principal logs. |
| **PDF (optional)** | Export the same Doc with `DriveApp.getFileById(...).getAs('application/pdf')` for email to admin; use only if school requires fixed attachments. |

**Recommended pattern:** **Slack summary + Google Doc archive** weekly. PDF only for official reporting.

### 6.4 Slack weekly template

```text
📊 Business Math — Weekly report (week ending {date})

CLASS: avg {pct}% · participation {k}/{n}
Strengths (class): {top sub-skills}
Needs work (class): {bottom sub-skills}

Intervention (≤70% topics or missing submits):
• {name} — {reason}

Full detail: {google_doc_url}

Recommendations this week:
1. …
2. …
3. …
```

---

## 7. Concrete tool map

| Layer | Tool |
|-------|------|
| Student quiz UI | Google Forms (MC) |
| Database | Google Sheets tabs above |
| Logic & cron | Apps Script (`dailyPublish`, `onFormSubmit`, `weeklyTeacherReport`) |
| Chat | Slack Incoming Webhook |
| Remedial content | Google Doc “Worked examples” + optional 2-item Forms |
| Optional automation | Zapier only if webhooks disallowed (Form → Sheet → Slack duplicate) |

### 7.1 Script properties (Secrets)

- `SLACK_WEBHOOK_URL`
- `SPREADSHEET_ID`
- `REMEDIAL_TEMPLATE_FORM_ID`
- `WORKED_EXAMPLES_DOC_ID`

---

## 8. Data model sketch (attempts per student per sub-skill)

```text
Student ──< Attempts >── Question
   │              │
   │              ├── topic, sub_skill, level, correct, submitted_at
   │
   ├── StudentTopicState (student × topic → level, last scores)
   └── StudentSubSkillState (student × sub_skill → last 5 bits, weak_flag)

Generator reads:
  StudentTopicState.level
  StudentSubSkillState.weak_flag + recent Attempts
Writes:
  DailyAssignments → Form
  Attempts ← submit
```

**Rolling accuracy query (pseudo):**

```text
For student S, sub_skill K:
  last5 = Attempts.filter(S, K).sort(desc).take(5)
  misses = count(!correct in last5)
  weak = (misses >= 2)
```

---

## 9. Pilot rollout checklist

1. Populate `QuestionBank` from `business-math-day1-questions.md` (10 items) and expand to ~40 items per topic × 2 levels.
2. Import `Roster` with **5 students** (`S001`–`S005`) and pilot with that class.
3. Deploy `onFormSubmit` installable trigger; submit one test form; verify `Attempts` and Slack.
4. Set `dailyPublish` for 4:00 AM; dry-run with `dailyPublishDryRun()` logging only.
5. Run first full week; review Friday Doc + tune 60/40 and remedial thresholds.

---

## 10. Maintenance

- Teacher adds new items to `QuestionBank` monthly.
- Review false-positive `weak_flag` after two weeks.
- Archive `Attempts` to a yearly tab to keep sheet performant (&gt;50k rows).