# Boricua Street Parking

A polished, dependency-free Canvas parking game inspired by Puerto Rico. Drive a compact hatchback through three sequential parking stops in **Viejo San Juan**, then complete three more during the **Coastal Night Shift**.

## Play

Open `index.html` in a modern browser, or serve the folder with any static server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The project uses relative paths and is safe to host from a GitHub Pages project subdirectory.

## Controls

- **W / Up arrow:** accelerate
- **S / Down arrow:** brake and reverse
- **A/D or Left/Right arrows:** steer (direction correctly reverses while backing up)
- Touch controls appear on touch devices and narrow screens.
- Header buttons toggle sound, open help, and restart the current level.

## Parking rules

Complete each glowing bay in order. The player's vehicle must be mostly inside the active bay (at least three inset corners plus its center), aligned within about 13°, and nearly stopped for the parking hold meter to finish. Collisions use an oriented car polygon against axis-aligned scenery with rollback and velocity damping.

## Architecture

- `index.html` — accessible shell, HUD, controls, overlays
- `styles.css` — responsive presentation and touch UI
- `js/input.js` — keyboard/touch state
- `js/levels.js` — two level definitions and targets
- `js/vehicle.js` — momentum, reverse steering, SAT collision, parking validation
- `js/audio.js` — procedural Web Audio engine/music/cues
- `js/game.js` — loop, rendering, progression, and UI
- `tests/smoke.test.js` — package-free Node tests for geometry, physics, target data, and static references

## Tests

```sh
node tests/smoke.test.js
node tests/browser-mock.test.js
```

No packages, build step, external fonts, images, audio, or network requests are used.
