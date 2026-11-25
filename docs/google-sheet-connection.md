# Google Sheet — BusinessMathAdaptive

## Spreadsheet

| Field | Value |
|-------|--------|
| **Title** | BusinessMathAdaptive |
| **URL** | https://docs.google.com/spreadsheets/d/1rT8vo5usB8hTvU9pahRdVbq8ql0TRM6YxLLSogvfcqo/edit |
| **Spreadsheet ID** | `1rT8vo5usB8hTvU9pahRdVbq8ql0TRM6YxLLSogvfcqo` |

## Tabs (seeded)

- **Roster** — 5 students S001–S005 (Marcus, Zoe, Faye, Jubella, Aizel); `email` and `slack_user_id` may stay blank; `active=TRUE`
- **QuestionBank** — headers + placeholder row (import full bank from repo `public/automation/data/question-bank.json`)
- **DailyAssignments** — `quiz_url` = GitHub Pages link per student/day
- **Attempts** — one row per question per submit
- **StudentTopicState** — all students at Level 1 on all four topics
- **StudentSubSkillState** — empty, filled on submits
- **WeeklyReports** — archive metadata

## Connect to Cursor Automations

For **Automation A, B, and C**:

1. Open each automation in [cursor.com/automations](https://cursor.com/automations).
2. **Tools** → enable **Google Drive** (MCP).
3. In the prompt, add at the top:
   - `SPREADSHEET_ID: 1rT8vo5usB8hTvU9pahRdVbq8ql0TRM6YxLLSogvfcqo`
   - Read/write Roster, DailyAssignments, Attempts, StudentTopicState, StudentSubSkillState via Sheets tools.
   - Still write repo JSON + push for GitHub Pages; Sheet is source of truth for mastery.

## Daily publish (Sheet + repo)

1. Read levels/weak flags from **StudentTopicState** and **StudentSubSkillState**.
2. Write **DailyAssignments** rows: `quiz_url` = `https://medinaneg.github.io/medinaneg-business-math-practice/?student_id=…&date=…`
3. Mirror assignment JSON in repo and push (required for the live quiz UI).
4. Slack via `format-slack` or read **DailyAssignments** quiz_url column.

## Apps Script (optional later)

For Form-style triggers without Cursor, add Apps Script bound to this spreadsheet; store `SLACK_WEBHOOK_URL` in Script Properties. See `adaptive-practice-setup-plan.md` §4–6.

## Teacher to-do

- [ ] Open the Sheet link above and confirm roster names.
- [ ] Share Sheet with school account if needed (Editor for you, Viewer for co-teacher).
- [ ] Import QuestionBank rows from repo (or ask an agent to append via Sheets MCP).
- [ ] Enable Google Drive on all three Automations.