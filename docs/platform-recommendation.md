# Platform recommendation — Business Math adaptive quizzes

## Requirements (must-have)

| Need | Why it matters |
|------|----------------|
| Multiple-choice auto-grading | Daily 10-item sets; instant feedback for students |
| Scheduled publishing / opening | Day *n* quiz live at 4:00 AM (Asia/Taipei) |
| Per-question tagging & scores | Topic, sub-skill, level, correctness per attempt |
| Slack integration | Per-submission alerts + weekly teacher digest |
| School-friendly cost | Free or low-cost for a single class or section |

## Shortlisted platforms

### 1. Google Forms + Google Sheets + Apps Script

| Pros | Cons |
|------|------|
| Free with Google Workspace for Education | MC feedback is basic unless you add branching |
| One response row per student per day in Sheets | No native “adaptive level” engine—you build it in Sheets |
| Time-driven triggers + `FormApp` / pre-filled links for daily forms | Slack needs Apps Script or Zapier webhook |
| Easy tags via hidden fields or question titles | |

**Slack:** Apps Script `UrlFetchApp` to incoming webhook, or Zapier “New Spreadsheet Row → Post to Slack.”

**Tagging:** Name questions `TOPIC|SUBSKILL|L1`; Apps Script parses on submit.

---

### 2. Microsoft Forms + Excel (OneDrive) + Power Automate

| Pros | Cons |
|------|------|
| Often included in school M365 | Weaker classroom roster sync than Google in many PH schools |
| Auto scores MC into linked workbook | Scheduled “assign” workflow less flexible than custom cron |
| Power Automate → Slack post on new response | Power Automate free tier has run limits |

**Fit:** Good if the school is already on Microsoft 365 and uses Teams/Slack side by side.

---

### 3. Quizizz (Educator) + Google Sheets + Zapier

| Pros | Cons |
|------|------|
| Strong MC practice UX and item banks | Free tier limits reports; deep tagging may need manual export |
| Scheduled “assign” to classes | Adaptive rules still live outside Quizizz (Sheets logic) |
| Zapier: finished attempt → Slack + Sheet row | Zapier free tier ~100 tasks/month (tight for daily class) |

**Fit:** Best student-facing quiz UX; backend tracking still needs Sheets and paid Zapier for scale.

---

## Comparison at a glance

| Criterion | Google stack | Microsoft stack | Quizizz + Zapier |
|-----------|--------------|-----------------|------------------|
| Cost (typical PH public/private school) | Free | Included in M365 | Free–low; Zapier may cost |
| MC auto-grade | Yes | Yes | Yes |
| Schedule daily open | Apps Script / linked form | Assign window | Assignment schedule |
| Per-Q tagging | Custom (titles / metadata) | Custom | Partial; export for detail |
| Slack | Apps Script or Zapier | Power Automate | Zapier |
| Adaptive logic | **You own it in Sheets** (required for your rules) | Same | Same |

## Recommendation (one choice)

**Use Google Forms + Google Sheets + Apps Script**, with **Slack via an incoming webhook** in the same Apps Script project (Zapier only if IT blocks custom scripts).

**Rationale**

1. **Cost and access:** Workspace for Education is common in Philippine schools; no per-seat quiz SaaS fee.
2. **Your adaptive model is custom** (60/40 weakness mix, 2 misses in 5, extra items below 70%). A spreadsheet **Attempts** ledger and script-owned **StudentState** table implement this cleanly; turnkey LMS quizzes rarely encode sub-skill rules without export anyway.
3. **Operations:** One timed trigger at **4:00 AM Asia/Taipei** can clone or activate the day’s form, reset the “open” flag, and post “Day *n* is live” to `#business-math-practice`. A **submit** trigger grades, appends a row, updates mastery, and Slack-notifies in one place—no multi-tool Zap for every student every day.
4. **Teacher reports:** Friday **5:00 PM UTC+8** rollup is a second time-driven function → Slack summary **plus** append to a **Weekly Report** tab (optional export to PDF or a linked Google Doc for parents/admin).

**When to pick Quizizz instead:** If the priority is gamified student engagement and the teacher accepts maintaining adaptive rules only in Sheets from Quizizz exports—invest in Zapier Starter for daily volume.

**When to pick Microsoft:** The school standard is already Forms/Excel and Slack is wired through Power Automate with IT support.