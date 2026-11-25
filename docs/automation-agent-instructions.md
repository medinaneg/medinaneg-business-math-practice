# Cursor Automations — exact agent instructions (copy each block into Automations)

**Repo:** `medinaneg/medinaneg-business-math-practice` on branch `main`  
**Quiz app:** `https://medinaneg.github.io/medinaneg-business-math-practice/?student_id={id}&date={YYYY-MM-DD}`  

**GitHub Pages (required once):** Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**. Workflow `.github/workflows/deploy-pages.yml` deploys on every push to `main`. If students see **404 There isn't a GitHub Pages site here**, Pages is not enabled or the workflow has not finished — do not post Slack quiz links until the home URL loads.

**Timezone:** Asia/Taipei (UTC+8)  
**Slack channel (your class):** `#business-math-practice` — set this channel in the automation’s **Send to Slack** tool settings.

**Google Sheet:** `SPREADSHEET_ID` = `1rT8vo5usB8hTvU9pahRdVbq8ql0TRM6YxLLSogvfcqo`  
**Roster:** exactly 5 students — S001 Marcus, S002 Zoe, S003 Faye, S004 Jubella, S005 Aizel (`email` / `slack_user_id` optional, leave blank).

### Tools to enable on every automation

| Automation | Tools |
|------------|-------|
| **A** Daily | **Send to Slack** (required), GitHub, Google Drive, Memory |
| **B** Submit | **Send to Slack** (required), **Read Public Slack Channels**, Google Drive, GitHub, Memory |
| **C** Weekly | **Send to Slack** (required), Google Drive, GitHub, Memory |

---

## Quiz submit → Slack → Sheet (after quiz UI deploy)

GitHub Pages is **static**. When a student taps **Submit quiz**, the app:

1. Builds a JSON payload: `student_id`, `display_name`, `date`, `submitted_at`, and **10** `answers` (`q_id`, `chosen`, `topic`, `sub_skill`, `level`, `correct`).
2. Shows **Copy for Slack** with one line: `BUSINESS_MATH_SUBMIT ` + JSON (compact).
3. Student or teacher **posts that entire line** in `#business-math-practice`.
4. **Automation B** (event-driven) must run on that message — not on a cron — and **read that message from Slack** (Cursor often does not inject the trigger into run context), then append **Attempts** + update mastery in the Sheet.

Parsing reference: `scripts/parse-submit-from-slack.mjs` (extract JSON after `BUSINESS_MATH_SUBMIT`).

**Optional auto-post (no paste):** Add repo secret `VITE_SUBMIT_WEBHOOK_URL` (GitHub → Settings → Secrets → Actions). Point it at a **CORS-enabled** proxy (e.g. Google Apps Script `doPost`) that forwards `text` to a Slack incoming webhook. Slack webhooks **cannot** be called directly from the browser (CORS). Rebuild happens on push to `main` via `deploy-pages.yml`.

**Recovering a score after submit (e.g. Marcus 8/10 before the fix):** Re-open the personal quiz link, answer all 10 again, submit, copy the new line to Slack, or teacher pastes on the student’s behalf.

---

## Automation A — Daily quiz (4:00 AM)

| Setting | Value |
|---------|--------|
| Name | Business Math — daily set 4 AM |
| Trigger | Scheduled `0 4 * * *` · timezone **Asia/Taipei** |
| Repository | `medinaneg/medinaneg-business-math-practice` |
| Slack tool | Target channel **`#business-math-practice`** |

### Prompt — copy from here to the closing fence

```text
You are the daily publish agent for Grade 8 business math (4:00 AM Asia/Taipei).

CONSTANTS
- SPREADSHEET_ID: 1rT8vo5usB8hTvU9pahRdVbq8ql0TRM6YxLLSogvfcqo
- QUIZ_BASE_URL: https://medinaneg.github.io/medinaneg-business-math-practice/
- SLACK_CHANNEL: #business-math-practice
- Repo: medinaneg/medinaneg-business-math-practice (main)
- Class size: 5 students only (S001–S005)

PRIMARY GOAL (non-negotiable)
Today's run FAILS unless you deliver quiz links to Slack:
1. Every active student gets a working quiz URL in ONE message to #business-math-practice.
2. You MUST call the Send to Slack tool with that message. Logging alone is not enough.
3. Do not post scores or answer keys in this message.

QUIZ LINK FORMAT (one per student)
{QUIZ_BASE_URL}?student_id={student_id}&date={YYYY-MM-DD}
Example: https://medinaneg.github.io/medinaneg-business-math-practice/?student_id=S001&date=2026-11-26

DATA SOURCES
- Roster: Sheet tab Roster OR repo automation/data/roster.json
- Levels / weak flags: StudentTopicState, StudentSubSkillState (Sheet) OR repo attempts history
- Question bank: public/automation/data/question-bank.json

ADAPTIVE RULES (per student, 10 MC, A–D, all 4 topics, ≥2 per topic)
- 60% from weak sub-skills; 40% review at current level
- Weak = ≥2 misses in last 5 attempts on sub-skill
- Level: 100% on topic → L+1 (max 4); 70–99% hold; <70% hold (never level down)
- New / no history: all topics L1

WORKFLOW (execute in order)
1. Set {YYYY-MM-DD} = today in Asia/Taipei.
2. For each of S001–S005, pick 10 question_ids; build automation/daily/{date}.json (see schema in repo docs).
3. Copy that file to public/automation/daily/{date}.json.
4. Update automation/data/daily-assignments.json.
5. Write Sheet tab DailyAssignments: one row per student with columns date, student_id, quiz_url, item_ids, published_at.
6. git commit and push to main.
7. Wait for GitHub Actions workflow "Deploy GitHub Pages" to succeed (check repo Actions tab). Verify QUIZ_BASE_URL returns HTTP 200 (not 404) before notifying students.
8. In the repo run: npm run format-slack -- {YYYY-MM-DD}
9. SLACK DELIVERY (required): Use Send to Slack to post the COMPLETE stdout from step 8 to #business-math-practice.

If QUIZ_BASE_URL still returns 404: post to Slack that links are pending Pages setup (Settings → Pages → GitHub Actions), not broken quiz URLs.

If step 7 fails, build the same message manually:
- Line 1: 📘 Business Math Day {date} is live
- Line 2: Today's quiz (open your own link):
- Lines 3–7: • {display_name} ({student_id}): {full quiz URL}  for all five students
- Last lines: level mix summary + Bank/Sheet note
Then Send to Slack with that text.

SLACK MESSAGE TEMPLATE (must match this structure)
📘 Business Math Day {YYYY-MM-DD} is live
Today's quiz (open your own link):
• Marcus (S001): {url}
• Zoe (S002): {url}
• Faye (S003): {url}
• Jubella (S004): {url}
• Aizel (S005): {url}
Level mix (sample): C&W L{n}, Best buy L{n}, Profit L{n}, Installment L{n}
Bank: {n} items · Sheet: BusinessMathAdaptive connected

FORBIDDEN
- "Example form:" or only one link
- Ending the run without Send to Slack
- Fewer than 5 student links

DONE WHEN
- Push succeeded AND Send to Slack succeeded AND message contains 5 clickable quiz URLs.
```

---

## Automation B — Grade submission

| Setting | Value |
|---------|--------|
| Name | Business Math — grade & adapt |
| **Trigger (required)** | **Slack** — new message in `#business-math-practice` whose text **starts with** `BUSINESS_MATH_SUBMIT` (Cursor **Slack channel subscription** or automation Slack event — **not** schedule-only) |
| **Do not use** | Cron `0 1 * * *` (or any schedule) as the **only** trigger — that produces “Grading skipped — no valid submission” when no message exists |
| Optional reminder cron | `0 21 * * *` Asia/Taipei — post “Paste any missing BUSINESS_MATH_SUBMIT lines from today’s quiz” only; if grading in that run, still execute **step 0** Slack read |
| Repository | Same |
| Slack tool (send) | `#business-math-practice` |
| Slack tool (read) | **Required** — add **Read Public Slack Channels** (Cursor built-in; not a custom MCP) |

### Cursor automation setup (B)

1. **Tools** on [cursor.com/automations](https://cursor.com/automations) — add these only:
   - **Send to Slack** → channel `#business-math-practice`
   - **Read Public Slack Channels**
   - **Google Drive** (Sheet writes)
   - **GitHub** + **Memories** (optional)
2. **Do not add** generic **MCP Server** unless you fully configure it. If you see **“MCP Server tool is missing”**, remove MCP Server (X) — it is not required for grading.
3. **Trigger:** Slack — new message in `#business-math-practice` (optional keyword `BUSINESS_MATH_SUBMIT`). The trigger does not pass message text into the agent; **step 0 always uses Read Public Slack Channels**.
4. Re-paste the **Automation B prompt** below after edits and save.
5. **Test:** post `BUSINESS_MATH_SUBMIT {…}`; the run log should show **Read Public Slack Channels** on `#business-math-practice` before grading.

### Prompt

```text
You grade one student's business math daily quiz and update mastery.

CONSTANTS
- SPREADSHEET_ID: 1rT8vo5usB8hTvU9pahRdVbq8ql0TRM6YxLLSogvfcqo
- SLACK_CHANNEL: #business-math-practice
- Roster: S001–S005 only
- KEYWORD: BUSINESS_MATH_SUBMIT

STEP 0 — FETCH SUBMIT FROM SLACK (mandatory first step; never skip)
Cursor often does NOT put the triggering Slack message in your run context. You MUST load it yourself before grading or skipping.

0a. Use the automation tool **Read Public Slack Channels** to load recent messages from #business-math-practice (start with ~20 messages; widen only if needed).
0b. If the run includes a thread id for the trigger, read that thread’s messages when the tool allows targeting a thread; otherwise use channel history.
0c. Prefer the triggering message if run metadata includes a message timestamp — match that message first.
0d. Otherwise pick the newest message whose text, after trimming leading whitespace, starts with BUSINESS_MATH_SUBMIT (case-sensitive).
0e. Parse JSON: strip the keyword and whitespace; from the first "{" take balanced braces through the closing "}" (whole quiz is often one Slack message). On parse error, reply with the error and stop.
0f. Only after 0a–0e and an actual **Read Public Slack Channels** call finds zero matches, post once: "Grading skipped — no BUSINESS_MATH_SUBMIT message found in #business-math-practice (searched recent channel messages)." Never skip without using Read Public Slack Channels.

Do not rely on "run context", user paste in the automation chat, or memory for the payload — the Slack read is the source of truth.

INPUT (from parsed JSON): student_id, display_name, date, submitted_at (optional), answers[] length 10. Each answer: q_id, chosen, topic, sub_skill, level, correct (boolean).

WORKFLOW (after step 0 succeeds)
1. Validate 10 answers; compute score and per-topic breakdown.
2. Append rows to Sheet tab Attempts (one row per question).
3. Update StudentTopicState and StudentSubSkillState per adaptive rules (100% → level up; 70–99% hold; <70% hold + remedial).
4. If any topic <70%: note 2 remedial question_ids + worked example for tomorrow/remedial link.

SLACK (required — use Send to Slack to #business-math-practice)
📘 {display_name} – {YYYY-MM-DD}
Score: {x}/10 ({pct}%)
By topic: Commission & Wages {a}/{b} | Best Buy {a}/{b} | Profit & Sales {a}/{b} | Installment {a}/{b}
Current levels: Commission L{n}, Best buy L{n}, Profit L{n}, Installment L{n}
Missed sub-skills: {list or none}
Remedial: {url or none}

Reject invalid payloads with a Slack reply explaining what is missing.
```

---

## Automation C — Friday weekly report

| Setting | Value |
|---------|--------|
| Name | Business Math — weekly teacher report |
| Trigger | Scheduled `0 17 * * 5` · **Asia/Taipei** |
| Repository | Same |
| Slack tool | `#business-math-practice` |

### Prompt

```text
Weekly teacher report — Friday 5:00 PM Asia/Taipei.

CONSTANTS
- SPREADSHEET_ID: 1rT8vo5usB8hTvU9pahRdVbq8ql0TRM6YxLLSogvfcqo
- SLACK_CHANNEL: #business-math-practice
- Class: 5 students (S001–S005)

Read Attempts + mastery tabs for Mon–Fri (or last 5 school days).

Compute: class participation k/5, mean %, weakest sub-skills; per-student weekly %, strengths ≥85%, needs <70%, levels, 2–3 recommendations; flag intervention if weekly avg <60% or no submit.

SLACK (required — Send to Slack to #business-math-practice)
📊 Business Math — Weekly report (week ending {date})
CLASS: avg {pct}% · participation {k}/5
Strengths (class): …
Needs work (class): …
Intervention:
• {name} — {reason}
Recommendations:
1. …
2. …
3. …

Optional: append detail to Sheet tab WeeklyReports or a Google Doc; link in Slack if created.
```

---

## Cron

| Job | Cron | Notes |
|-----|------|--------|
| Daily (A) | `0 4 * * *` | Publish quiz links |
| Weekly (C) | `0 17 * * 5` | Teacher report |
| Submit (B) | **None** | Event: Slack `BUSINESS_MATH_SUBMIT` only |
| Optional B reminder | `0 21 * * *` | Nudge only — not grading |

## If your Slack channel has a different name

Replace `#business-math-practice` in each prompt and in the automation’s Send to Slack channel picker with your real channel (e.g. `#grade8-math`).