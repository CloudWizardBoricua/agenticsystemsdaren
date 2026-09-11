# Agent Notes

## 1. What I asked the agent for
- A lightweight, clean, mobile-friendly **Task Priority Dashboard** web app for my co-founder Tyler.
- Inputs for task name, business impact (Low / Med / High), urgency (Low / Med / High), and optional due dates.
- Automatic priority score calculation and instant auto-ranking from highest to lowest priority.
- Active/completed filtering, editing, deletion, and persistent browser `localStorage`.
- Zero backend/login dependency so it runs purely as static assets on GitHub Pages.

## 2. What it got wrong or needed refinement
- **Sorting Edge Cases:** The initial sorting logic did not account for completed tasks staying at the top if they had high priority scores. Completed tasks needed to be sinked to the bottom or segregated when viewing the active queue.
- **Date Urgency Sensitivity:** The standard $Impact \times Urgency$ score is a static 1–9 matrix. Without date-based modifiers, an urgent task due in 2 hours could be ranked equally with one due in 3 weeks. A dynamic due-date boost (+1.5 for due today/overdue, +0.75 for next 48 hours) was introduced so pressing timelines float naturally to the top.
- **Initial Seed State:** When loading on a fresh browser, an empty screen can feel broken or unguided. Pre-populating realistic operations and supply-chain demo tasks immediately illustrates the sorting mechanics before the user enters their own data.

## 3. How I verified the agent's work
- Inspected the DOM layout, responsiveness on narrow viewport sizes, and form validation behavior.
- Tested task addition, in-place editing, cancellation, toggle completion, and deletion across reloads to confirm `localStorage` serialization.
- Verified priority score edge cases (e.g., Low Impact + High Urgency vs. High Impact + Low Urgency + due today).
- Ran the automated publication pipeline via `scripts/publish.sh` to confirm live deployment to GitHub Pages.
