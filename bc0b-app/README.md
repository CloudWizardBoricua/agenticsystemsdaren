# OpsPriority — Task Priority Dashboard (Build Challenge 0b)

A clean, responsive, single-page web application designed for operations and supply-chain leaders to rapidly prioritize competing business tasks.

## Key Features
- **Impact & Urgency Matrix:** Tag items with Business Impact (1–3) and Urgency (1–3).
- **Automated Priority Ranking:** Dynamic scoring algorithm factoring in Impact, Urgency, and Due Date proximity.
- **Operational Metrics Bar:** High-level summary of active tasks, high-priority items, upcoming deadlines, and completions.
- **Client-Side Storage:** Built on `localStorage` for zero-friction persistence without accounts or backend infrastructure.
- **Mobile Friendly:** Fully responsive card layout with dark mode palette for quick triage on the go.

## Running Locally

1. Open `index.html` directly in any web browser, or serve it with Python / Node:
   ```bash
   # Using Python 3
   cd bc0b-app && python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` in your browser.

## Required Course Files
- `person.md`: Target persona context, problem statement, and MVP scope definition.
- `agent-notes.md`: Prompts used, edge cases caught and resolved, and verification steps.
