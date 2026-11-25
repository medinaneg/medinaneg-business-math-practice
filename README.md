# Business Math Daily Practice (Grade 8)

Vite + React quiz app for adaptive daily business math (Philippine peso contexts).

**Live app:** [https://medinaneg.github.io/medinaneg-business-math-practice/](https://medinaneg.github.io/medinaneg-business-math-practice/)

### Enable GitHub Pages (one-time)

1. GitHub repo → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions** (not “Deploy from branch” only)
3. Push to `main` or run workflow **Deploy GitHub Pages** manually under **Actions**
4. Open the Pages URL above; you should see the quiz (not “There isn't a GitHub Pages site here”)

Students open a personal link from Slack with `student_id` and `date` query parameters.

## Class roster

This pilot class has **exactly 5 students** (`S001`–`S005`). See `automation/data/roster.json`.

## Teacher docs (`docs/`)

- [automation-agent-instructions.md](docs/automation-agent-instructions.md) — Cursor Automations copy-paste prompts
- [adaptive-practice-setup-plan.md](docs/adaptive-practice-setup-plan.md) — Sheets, Slack, cron
- [business-math-day1-questions.md](docs/business-math-day1-questions.md) — Day 1 sample bank
- [platform-recommendation.md](docs/platform-recommendation.md)

## Automation data

| Path | Purpose |
|------|---------|
| `automation/daily/YYYY-MM-DD.json` | Per-day assignments — **after editing, copy to** `public/automation/daily/` and push so GitHub Pages serves the new set |
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