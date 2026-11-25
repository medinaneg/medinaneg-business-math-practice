# Adaptive Business Math Daily Quiz — Data Schema

Workbook name (Google Sheets): **BusinessMathAdaptive**

When Sheets is unavailable, the same shapes live under `automation/data/*.json`. Daily publish artifacts: `automation/daily/YYYY-MM-DD.json`.

## Roster

| Column       | Type    | Notes                          |
|-------------|---------|--------------------------------|
| student_id  | string  | Unique ID (e.g. S001)          |
| display_name| string  | First name only in app         |
| active      | boolean | Include in daily publish       |
| form_url    | string  | Per-student or shared class URL|

## QuestionBank

| Column     | Type   | Notes                                      |
|-----------|--------|--------------------------------------------|
| q_id      | string | e.g. Q-CW-L1-001                           |
| topic     | enum   | commission_wages, best_buy, profit_sales, installment |
| sub_skill | string | e.g. straight_commission                   |
| level     | int    | 1–4                                        |
| stem      | string | Question text                              |
| choice_a–d| string | Options                                    |
| correct   | enum   | A, B, C, D                                 |
| distractor_notes | string | Why wrong options tempt students   |
| form_title_tag | string | `[topic|sub_skill|L{n}]` prefix for Forms |

## DailyAssignments

| Column       | Type     | Notes                    |
|-------------|----------|--------------------------|
| date        | ISO date | YYYY-MM-DD               |
| student_id  | string   |                          |
| form_url    | string   |                          |
| item_ids    | string   | Comma-separated q_id list|
| published_at| ISO8601  |                          |

## Attempts

| Column      | Type    | Notes                          |
|------------|---------|--------------------------------|
| attempt_id | string  |                                |
| date       | ISO date|                                |
| student_id | string  |                                |
| q_id       | string  |                                |
| topic      | string  |                                |
| sub_skill  | string  |                                |
| correct    | boolean |                                |
| chosen     | string  | A–D                            |

## StudentTopicState

| Column     | Type | Notes                          |
|-----------|------|--------------------------------|
| student_id| string |                              |
| topic     | string |                              |
| level     | int  | 1–4 default 1 for new students |
| remedial  | bool | Set when topic score &lt; 70%  |

## StudentSubSkillState

| Column            | Type  | Notes |
|------------------|-------|-------|
| student_id       | string|       |
| topic            | string|       |
| sub_skill        | string|       |
| weak_flag        | bool  |       |
| rolling_accuracy | number| Last 10 attempts on sub-skill |

## Level rules (from per-topic daily scores)

- 100% → level +1 (max 4) tomorrow
- 70–99% → same level
- &lt; 70% → same level, mark remedial (no level down)

## Daily composition (10 items)

- 6 weak / lowest-accuracy sub-skills
- 4 review at current topic level
- All four topics; ≥2 items per topic when possible
- Exclude q_ids seen in last 14 days