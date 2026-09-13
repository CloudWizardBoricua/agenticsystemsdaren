/* Boricua Street Parking — Rendering, Game Loop, Audio & Navigation HUD. */
(function () {
  'use strict';
  const W = 1280, H = 720;
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);

  const input = new InputManager(window);
  const audio = new GameAudio();

  const ui = {
    location: $('levelSubtitle'),
    hudObj: $('hudObjective'),
    hudTimer: $('hudTimer'),
    hudSpeed: $('hudSpeed'),
    navTracker: $('navTracker'),
    trackerArrow: $('trackerArrow'),
    targetNumber: $('targetNumber'),
    targetName: $('targetName'),
    targetDistance: $('targetDistance'),
    meterHud: $('parkingMeterHud'),
    meterFill: $('meterFill'),
    meterStatus: $('meterStatus'),
    toast: $('toast'),
    startOverlay: $('startOverlay'),
    levelOverlay: $('levelOverlay'),
    winOverlay: $('winOverlay'),
    finalTime: $('finalTime'),
    touchControls: $('touchControls'),
    soundBtn: $('soundBtn'),
    toggleControlsBtn: $('toggleControlsBtn')
  };

  let levelIndex = 0;
  let targetIndex = 0;
  let vehicle = new Vehicle(0, 0, 0);
  let running = false;
  let paused = true;
  let elapsed = 0;
  let parkHold = 0;
  let last = performance.now();
  let toastTimer = 0;
  let particles = [];
  let cameraShake = 0;
  let showOnScreenButtons = true; // Enabled by default for easy playing

  let level = GAME_LEVELS[0];

  function formatTime(seconds) {
    const s = Math.floor(seconds);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function roundedRect(c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(x, y, w, h, r);
    } else {
      c.rect(x, y, w, h);
    }
  }

  function seedRand(n) {
    const x = Math.sin(n * 977.3) * 43758.5453;
    return x - Math.floor(x);
  }

  function resetLevel(index = levelIndex) {
    levelIndex = index;
    level = GAME_LEVELS[levelIndex];
    targetIndex = 0;
    parkHold = 0;
    particles = [];
    vehicle.reset(level.start);
    ui.location.textContent = level.subtitle;
    updateObjective();
    input.clear();
  }

  function updateObjective() {
    ui.hudObj.textContent = `${targetIndex + 1} / 3`;
    const t = level.targets[Math.min(targetIndex, 2)];
    ui.targetNumber.textContent = `TARGET 0${targetIndex + 1}`;
    ui.targetName.textContent = t.name;
    ui.targetDistance.textContent = t.hint;
  }

  function setOverlay(el, show) {
    el.classList.toggle('visible', show);
  }

  function setPaused(value) {
    paused = value;
    input.setEnabled(!value);
  }

  function begin() {
    audio.init();
    setOverlay(ui.startOverlay, false);
    elapsed = 0;
    running = true;
    setPaused(false);
    resetLevel(0);
    showToast('¡Vamos! Follow the golden arrow to Bay 01');
  }

  function restart() {
    resetLevel(levelIndex);
    if (!running) {
      running = true;
      elapsed = 0;
    }
    setOverlay(ui.levelOverlay, false);
    setOverlay(ui.winOverlay, false);
    setPaused(false);
    showToast('Shift restarted — ¡Vámonos!');
  }

  function nextLevel() {
    setOverlay(ui.levelOverlay, false);
    resetLevel(1);
    setPaused(false);
    showToast('Night shift at Piñones — Headlights on!');
  }

  function playAgain() {
    setOverlay(ui.winOverlay, false);
    elapsed = 0;
    resetLevel(0);
    setPaused(false);
    showToast('Back to Viejo San Juan!');
  }

  function showToast(text) {
    ui.toast.textContent = text;
    ui.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 2200);
  }

  function spawnCelebration(x, y) {
    for (let i = 0; i < 48; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 260,
        vy: (Math.random() - 0.8) * 240,
        life: 0.9 + Math.random() * 0.8,
        size: 4 + Math.random() * 4,
        c: ['#38bdf8', '#fbbf24', '#ed3446', '#ffffff', '#10b981'][i % 5]
      });
    }
  }

  function completeTarget(t) {
    audio.park();
    spawnCelebration(t.x + t.w / 2, t.y + t.h / 2);
    targetIndex++;
    parkHold = 0;
    vehicle.speed = 0;

    if (targetIndex < 3) {
      updateObjective();
      showToast(`¡Nítido! Parked! Next: ${level.targets[targetIndex].name}`);
    } else {
      ui.hudObj.textContent = '3 / 3';
      setPaused(true);
      setTimeout(() => {
        if (levelIndex === 0) {
          setOverlay(ui.levelOverlay, true);
          audio.win();
        } else {
          ui.finalTime.textContent = formatTime(elapsed);
          setOverlay(ui.winOverlay, true);
          audio.win();
        }
      }, 600);
    }
  }

  function update(dt) {
    if (!paused) {
      elapsed += dt;
      const axes = input.axis();
      const hit = vehicle.update(dt, axes, level.obstacles);
      audio.updateEngine(vehicle.speed, axes.throttle);

      if (hit && vehicle.bumpCooldown > 0.2) {
        audio.bump();
        cameraShake = 4;
      }

      // Target Tracking and Parking Check
      const t = level.targets[targetIndex];
      if (t) {
        const targetCenterX = t.x + t.w / 2;
        const targetCenterY = t.y + t.h / 2;
        
        // Navigation Arrow Angle Calculation
        const angleToTarget = Math.atan2(targetCenterY - vehicle.y, targetCenterX - vehicle.x);
        ui.trackerArrow.style.transform = `rotate(${angleToTarget}rad)`;

        const status = vehicle.parkingStatus(t);
        
        // Distance check for meter display
        const dist = Math.hypot(targetCenterX - vehicle.x, targetCenterY - vehicle.y);
        if (dist < 180) {
          ui.meterHud.classList.add('active');
          if (status.valid) {
            parkHold += dt;
            const progress = Math.min(100, Math.round((parkHold / 0.55) * 100)); // Quick 0.55s parking hold
            ui.meterFill.style.width = `${progress}%`;
            ui.meterStatus.textContent = 'HOLDING STILL... ¡CASI!';
            if (parkHold >= 0.55) {
              completeTarget(t);
            }
          } else {
            parkHold = Math.max(0, parkHold - dt * 2);
            ui.meterFill.style.width = '20%';
            if (status.speed > 25) {
              ui.meterStatus.textContent = 'Slow down vehicle';
            } else if (!status.centerInside) {
              ui.meterStatus.textContent = 'Pull inside yellow box';
            } else {
              ui.meterStatus.textContent = 'Straighten car slightly';
            }
          }
        } else {
          ui.meterHud.classList.remove('active');
          parkHold = 0;
        }
      }
    }

    cameraShake = Math.max(0, cameraShake - dt * 18);
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      p.life -= dt;
    }
    particles = particles.filter(p => p.life > 0);

    ui.hudTimer.textContent = formatTime(elapsed);
    ui.hudSpeed.textContent = `${Math.round(Math.abs(vehicle.speed) * 0.16)} km/h`;
  }

  /* --- CANVAS RENDERING (Puerto Rico Procedural Aesthetics) --- */

  function drawRoad(theme) {
    ctx.fillStyle = theme === 'day' ? '#475569' : '#1e293b';
    ctx.fillRect(0, 0, W, H);

    // Subtle cobblestone / pavement texture
    ctx.globalAlpha = theme === 'day' ? 0.15 : 0.08;
    for (let i = 0; i < 160; i++) {
      const x = seedRand(i) * W, y = seedRand(i + 300) * H, r = 1 + seedRand(i + 600) * 3;
      ctx.fillStyle = i % 2 ? '#cbd5e1' : '#0f172a';
      ctx.fillRect(x, y, r, r);
    }
    ctx.globalAlpha = 1;

    // Road lane markings
    ctx.setLineDash([20, 24]);
    ctx.strokeStyle = theme === 'day' ? 'rgba(251, 191, 36, 0.45)' : 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, 480);
    ctx.lineTo(1250, 480);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(450, 30);
    ctx.lineTo(450, 690);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawSidewalk(o, theme) {
    ctx.fillStyle = theme === 'day' ? '#e2e8f0' : '#475569';
    ctx.fillRect(o.x - 6, o.y - 6, o.w + 12, o.h + 12);
    ctx.strokeStyle = theme === 'day' ? '#cbd5e1' : '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(o.x - 6, o.y - 6, o.w + 12, o.h + 12);
  }

  function drawBuilding(o, i) {
    drawSidewalk(o, 'day');
    // Authentic Old San Juan vibrant pastel colors: Coral, Aqua, Ochre, Lilac, Sage
    const palette = ['#f87171', '#38bdf8', '#fbbf24', '#c084fc', '#4ade80', '#fb923c'];
    const base = palette[i % palette.length];
    
    ctx.fillStyle = base;
    ctx.fillRect(o.x, o.y, o.w, o.h);

    // Shadow base
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(o.x, o.y + o.h - 12, o.w, 12);

    // Stucco trim
    ctx.fillStyle = '#fdf4dc';
    ctx.fillRect(o.x + 6, o.y + 6, o.w - 12, 8);

    // Windows & Spanish colonial balconies
    const horizontal = o.w > o.h;
    const count = Math.max(2, Math.floor((horizontal ? o.w : o.h) / 58));
    for (let n = 0; n < count; n++) {
      const wx = horizontal ? o.x + 18 + n * ((o.w - 36) / (count - 1 || 1)) : o.x + 16;
      const wy = horizontal ? o.y + 30 : o.y + 18 + n * ((o.h - 36) / (count - 1 || 1));
      
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(wx, wy, 20, 26);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(wx + 8, wy, 2, 26);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, wy, 20, 26);

      // Balcony railing
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx - 4, wy + 20, 28, 10);
    }
  }

  function drawPlaza(o) {
    drawSidewalk(o, 'day');
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(o.x, o.y, o.w, o.h);

    // Fountain
    const fx = o.x + o.w / 2, fy = o.y + o.h / 2;
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(fx, fy, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(fx, fy, 22, 0, Math.PI * 2);
    ctx.fill();

    // Palm trees in plaza
    drawPalm(o.x + 28, o.y + 28, false, 0.7);
    drawPalm(o.x + o.w - 28, o.y + o.h - 28, false, 0.7);
  }

  function drawKiosk(o, i) {
    drawSidewalk(o, 'night');
    const cols = ['#ef4444', '#f59e0b', '#06b6d4'];
    ctx.fillStyle = cols[i % 3];
    ctx.fillRect(o.x, o.y, o.w, o.h);

    // Kiosk striped canopy
    for (let x = o.x; x < o.x + o.w; x += 18) {
      ctx.fillStyle = ((x - o.x) / 18) % 2 ? '#fef08a' : '#dc2626';
      ctx.fillRect(x, o.y, 10, 16);
    }

    // Lit storefront
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(o.x + 16, o.y + 36, o.w - 32, 28);
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(i % 2 ? 'FRITURAS' : 'KIOSKO', o.x + o.w / 2, o.y + 54);
    ctx.textAlign = 'left';
  }

  function drawOcean() {
    const g = ctx.createLinearGradient(0, 30, 0, 125);
    g.addColorStop(0, '#0c4a6e');
    g.addColorStop(1, '#0284c7');
    ctx.fillStyle = g;
    ctx.fillRect(30, 30, 1220, 95);

    // Gentle waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    for (let y = 48; y < 120; y += 16) {
      ctx.beginPath();
      for (let x = 32; x < 1240; x += 18) {
        ctx.lineTo(x, y + Math.sin(x * 0.03 + y) * 3);
      }
      ctx.stroke();
    }

    // Glowing Moon
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(1100, 65, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPalm(x, y, night = false, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Trunk
    ctx.strokeStyle = night ? '#78350f' : '#92400e';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(6, 0, 1, -28);
    ctx.stroke();

    // Fronds
    ctx.strokeStyle = night ? '#059669' : '#16a34a';
    ctx.lineWidth = 6;
    for (let a = -2.6; a < 0.4; a += 0.5) {
      ctx.beginPath();
      ctx.moveTo(1, -28);
      ctx.quadraticCurveTo(Math.cos(a) * 18, -34 + Math.sin(a) * 8, Math.cos(a) * 32, -26 + Math.sin(a) * 22);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFlag(x, y, scale = 0.75) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // Stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 52, 32);
    ctx.fillStyle = '#ed3446';
    for (let i = 0; i < 3; i++) ctx.fillRect(0, i * 11, 52, 5.5);
    
    // Blue Triangle
    ctx.fillStyle = '#0050a4';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(26, 16);
    ctx.lineTo(0, 32);
    ctx.closePath();
    ctx.fill();

    // White Star
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    ctx.fillText('★', 4, 21);
    
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, 52, 32);
    ctx.restore();
  }

  function drawPare(x, y, rot = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    
    // Post
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 32);
    ctx.stroke();

    // Octagon
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + i * Math.PI / 4, r = 18;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARE', 0, 3);
    ctx.restore();
    ctx.textAlign = 'left';
  }

  function drawParkedCar(o, i) {
    const horizontal = o.w > o.h;
    const x = o.x + o.w / 2, y = o.y + o.h / 2;
    const angle = horizontal ? 0 : Math.PI / 2;
    drawCar(x, y, angle, ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][i % 4], false, 0.82);
  }

  function drawCar(x, y, angle, paint = '#fbbf24', player = false, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Car Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Body
    roundedRect(ctx, -41, -23, 82, 46, 10);
    ctx.fillStyle = paint;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Roof & Windshields
    ctx.fillStyle = '#0f172a';
    roundedRect(ctx, -20, -19, 40, 38, 6);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-14, -17, 26, 10); // Front windshield
    ctx.fillRect(-14, 7, 26, 10);  // Rear windshield

    // Wheels
    ctx.fillStyle = '#020617';
    for (const wx of [-26, 24]) {
      for (const wy of [-25, 21]) {
        roundedRect(ctx, wx, wy, 14, 5, 2);
        ctx.fill();
      }
    }

    // Headlights & Taillights
    ctx.fillStyle = player ? '#fef08a' : '#fef9c3';
    ctx.fillRect(36, -15, 4, 9);
    ctx.fillRect(36, 6, 4, 9);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-40, -15, 3, 8);
    ctx.fillRect(-40, 7, 3, 8);

    if (player) {
      // Puerto Rico Star Roof Decal
      ctx.fillStyle = '#0050a4';
      ctx.beginPath();
      ctx.arc(-2, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px sans-serif';
      ctx.fillText('★', -5, 3);
    }

    ctx.restore();
  }

  function drawTarget(t, index) {
    const active = index === targetIndex;
    const done = index < targetIndex;
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.006);

    ctx.save();
    ctx.fillStyle = done
      ? 'rgba(16, 185, 129, 0.25)'
      : active
      ? `rgba(251, 191, 36, ${0.18 + pulse * 0.12})`
      : 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(t.x, t.y, t.w, t.h);

    ctx.strokeStyle = done ? '#10b981' : active ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = active ? 4 : 2;
    ctx.setLineDash(active ? [12, 6] : [6, 6]);
    ctx.strokeRect(t.x + 2, t.y + 2, t.w - 4, t.h - 4);
    ctx.setLineDash([]);

    // Target Number Label
    ctx.fillStyle = done ? '#10b981' : active ? '#fbbf24' : 'rgba(255, 255, 255, 0.3)';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(done ? '✓' : `0${index + 1}`, t.x + t.w / 2, t.y + t.h / 2);
    ctx.restore();
  }

  function render() {
    ctx.save();
    if (cameraShake) {
      ctx.translate((Math.random() - 0.5) * cameraShake, (Math.random() - 0.5) * cameraShake);
    }

    drawRoad(level.theme);

    if (level.theme === 'night') {
      drawOcean();
    }

    // Draw Obstacles
    level.obstacles.forEach((o, i) => {
      if (['edge', 'wall', 'oceanWall'].includes(o.kind)) return;
      if (o.kind === 'building') drawBuilding(o, i);
      else if (o.kind === 'plaza') drawPlaza(o);
      else if (o.kind === 'kiosk') drawKiosk(o, i);
      else if (o.kind === 'parked') drawParkedCar(o, i);
    });

    // Draw Target Parking Bays
    level.targets.forEach(drawTarget);

    // Decorative Puerto Rican props
    if (level.theme === 'day') {
      drawFlag(320, 50, 0.7);
      drawFlag(1060, 320, 0.65);
      drawPare(440, 260, 0.1);
      drawPalm(970, 240, false, 0.8);
      drawPalm(960, 510, false, 0.8);
    } else {
      [420, 920, 1180].forEach(x => drawPalm(x, 180, true, 0.85));
      drawFlag(1050, 260, 0.65);
      drawPare(465, 450, 0.05);
    }

    // Draw Player Vehicle
    drawCar(vehicle.x, vehicle.y, vehicle.angle, '#fbbf24', true, 1);

    // Particle Sparks
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }

  function ensureTransform() {
    ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
  }

  const origRender = render;
  render = function () {
    ensureTransform();
    origRender();
  };

  // Button Listeners
  $('startBtn').addEventListener('click', begin);
  $('restartBtn').addEventListener('click', restart);
  $('nextLevelBtn').addEventListener('click', nextLevel);
  $('playAgainBtn').addEventListener('click', playAgain);

  ui.toggleControlsBtn.addEventListener('click', () => {
    showOnScreenButtons = !showOnScreenButtons;
    ui.touchControls.style.display = showOnScreenButtons ? 'flex' : 'none';
    ui.toggleControlsBtn.textContent = showOnScreenButtons ? '🎮 Controls: ON' : '🎮 Controls: OFF';
    showToast(showOnScreenButtons ? 'On-screen buttons visible' : 'On-screen buttons hidden');
  });

  ui.soundBtn.addEventListener('click', () => {
    const on = audio.toggle();
    ui.soundBtn.textContent = on ? '🔊' : '🔇';
    showToast(on ? 'Audio enabled' : 'Audio muted');
  });

  // Bind Touch input for iPhone / Mobile
  input.bindTouch(ui.touchControls);

  window.addEventListener('resize', resize);

  // Initialize
  resetLevel(0);
  resize();
  requestAnimationFrame(frame);
})();
