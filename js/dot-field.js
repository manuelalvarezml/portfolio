/* Quiet, water-like light moving through a fixed field of soft dots. */
(() => {
  'use strict';
  if (document.querySelector('.dot-field')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'dot-field';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  document.body.prepend(canvas);

  const settings = {
    spacing: 24,
    cursorRadius: 80, // Approximately five standard 16px cursor widths.
    minOpacity: 0.025,
    maxOpacity: 0.26,
    fps: 30,
  };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const pointer = { x: 0, y: 0, strength: 0, active: false };
  let width = 0;
  let height = 0;
  let dots = [];
  let frame = 0;
  let lastTime = 0;
  let flowTime = 0;

  // A pre-rendered soft dot avoids a per-dot blur/filter on every frame.
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 24;
  const spriteCtx = sprite.getContext('2d');
  if (!spriteCtx) { canvas.remove(); return; }
  const glow = spriteCtx.createRadialGradient(12, 12, 0, 12, 12, 12);
  glow.addColorStop(0, 'rgba(0,0,0,1)');
  glow.addColorStop(0.22, 'rgba(0,0,0,0.94)');
  glow.addColorStop(0.5, 'rgba(0,0,0,0.30)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  spriteCtx.fillStyle = glow;
  spriteCtx.fillRect(0, 0, 24, 24);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dots = [];
    const spacing = width < 600 ? 28 : settings.spacing;
    for (let y = spacing / 2; y < height; y += spacing) {
      for (let x = spacing / 2; x < width; x += spacing) dots.push({ x, y });
    }
    draw();
  }

  function smoothstep(value) {
    const v = Math.max(0, Math.min(1, value));
    return v * v * (3 - 2 * v);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    // A clearing halo inverts the previous dark theme's cursor response.
    // Faster phase travel makes regional intensity changes visible within seconds.
    const t = flowTime * 1.35;
    for (const dot of dots) {
      // Broad, overlapping waves warp one another; dots themselves stay still.
      const warp = Math.sin(dot.x * 0.004 + dot.y * 0.006 - t * 0.7) * 1.5;
      const wave = (
        Math.sin(dot.x * 0.010 + dot.y * 0.004 + t + warp) +
        Math.sin(dot.y * 0.014 - dot.x * 0.003 - t * 0.8 + warp * 0.6) * 0.65 +
        Math.sin((dot.x + dot.y) * 0.020 + t * 0.45) * 0.25
      ) / 1.9;
      const light = smoothstep((wave + 0.65) / 1.3);
      const distance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y);
      const cursorFade = smoothstep(distance / settings.cursorRadius);
      const attenuation = 1 - pointer.strength * (1 - cursorFade) * 0.995;
      ctx.globalAlpha = (settings.minOpacity + light *
        (settings.maxOpacity - settings.minOpacity)) * attenuation;
      ctx.drawImage(sprite, dot.x - 4.5, dot.y - 4.5, 9, 9);
    }
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    frame = 0;
    if (document.hidden || reducedMotion.matches) return;
    const elapsed = now - lastTime;
    if (elapsed >= 1000 / settings.fps) {
      const dt = Math.min(elapsed / 1000, 0.1);
      // Use real elapsed time so a throttled frame rate does not slow the waves.
      flowTime += elapsed / 1000;
      const target = pointer.active ? 1 : 0;
      pointer.strength += (target - pointer.strength) * (1 - Math.exp(-dt * 12));
      lastTime = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }

  function resume() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (document.hidden) return;
    if (reducedMotion.matches) {
      pointer.strength = pointer.active ? 1 : 0;
      draw();
    } else {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  window.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || event.pointerType === 'touch') return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    if (reducedMotion.matches) {
      pointer.strength = 1;
      draw();
    }
  }, { passive: true });
  function clearPointer() {
    pointer.active = false;
    if (reducedMotion.matches) { pointer.strength = 0; draw(); }
  }
  document.documentElement.addEventListener('pointerleave', clearPointer);
  window.addEventListener('blur', clearPointer);
  finePointer.addEventListener('change', clearPointer);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', resume);
  reducedMotion.addEventListener('change', resume);
  resize();
  resume();
})();
