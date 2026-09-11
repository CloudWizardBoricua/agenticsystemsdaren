# Person & Problem

## Who this is for
This web app is built for **Tyler**, my co-founder who leads operations, supply chain logistics, and business planning for our company.

## What he needed (in his words)
> "I have dozens of operational, supplier, and inventory issues popping up every day. I don't want to open a bloated project management tool just to figure out what fires to put out first. I just need a fast way to punch in what needs doing, tag how critical and urgent it is, and see an ordered list of what to work on right now."

## Smallest useful version (MVP)
The smallest version that solves his core pain point is a single-screen **Task Priority Dashboard**:
1. **Quick Input:** Add a task with title, target due date, Business Impact (Low/Med/High), and Urgency (Low/Med/High).
2. **Automatic Scoring & Dynamic Ranking:** A priority scoring formula (`Impact × Urgency + Due Date urgency bonus`) that instantly floats top-priority tasks to the top.
3. **Task Lifecycle:** Check off completed items, filter by Active / Completed, edit details, or delete items.
4. **Client-Side Persistence:** Instant zero-login persistence using browser `localStorage` so data stays on his device across sessions without requiring backend overhead.
