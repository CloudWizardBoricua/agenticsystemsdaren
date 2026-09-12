# Stacker Game Test for fun

An authentic, arcade-style **Stacker** browser game designed with LED matrix aesthetics, dynamic speed scaling, synth audio feedback, player nametag tracking, and a persistent local leaderboard.

## Features
- **Authentic Arcade Mechanics:** 15x7 LED grid, block overhang trimming, and realistic acceleration as you climb higher.
- **Prize Tiers:**
  - **Minor Prize:** Row 10 (+500 pts bonus)
  - **Major Prize:** Row 15 (+2,000 pts bonus & Win Jingle)
- **Interactive Gamer Tracking:** Set your arcade player name / initials to record high scores.
- **Leaderboard:** Automatic local ranking of top gamer scores, row milestones, and timestamps.
- **Audio Synthesizer:** Real-time Web Audio sound effects (block bounce, drop tone, slice chop, game over buzz, and victory fanfare) with an audio toggle.
- **Controls:** Spacebar or on-screen arcade push button.

## Running Locally

Open `index.html` directly in any web browser, or serve it locally:
```bash
cd stacker-game && python3 -m http.server 8000
```
Then visit `http://localhost:8000`.
