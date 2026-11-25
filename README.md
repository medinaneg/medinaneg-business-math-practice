# Business Math Daily Practice (Grade 8)

Vite + React quiz app for adaptive daily business math (Philippine peso contexts).

**Live app:** [https://medinaneg.github.io/medinaneg-business-math-practice/](https://medinaneg.github.io/medinaneg-business-math-practice/)

Students open a personal link from Slack with `student_id` and `date` query parameters.

## Class roster

This pilot class has **exactly 5 students** (`S001`–`S005`). See `automation/data/roster.json`.

## Automation data

| Path | Purpose |
|------|---------|
| `automation/daily/YYYY-MM-DD.json` | Per-day assignments (copy to `public/automation/daily/` for deploy) |
| `automation/data/daily-assignments.json` | Rolling assignment index |
| `public/automation/data/question-bank.json` | Question stems served to the app |

## Slack formatter

```bash
npm run format-slack -- 2026-11-25
```

Set `QUIZ_BASE_URL` if needed (default: GitHub Pages URL above).

## Scripts

```bash
npm install
npm run dev
npm run build
```