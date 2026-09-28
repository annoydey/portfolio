(() => {
  'use strict';

  const html = document.documentElement;
  const header = document.getElementById('site-header');
  const progress = document.getElementById('page-progress');
  const scrollTop = document.getElementById('scroll-top');
  const menu = document.getElementById('menu-toggle');
  const navbar = document.getElementById('navbar');
  const year = document.getElementById('current-year');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  html.classList.add('reveal-ready');
  if (year) year.textContent = new Date().getFullYear();

  const updateScrollUI = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
    if (header) header.classList.toggle('scrolled', y > 15);
    if (scrollTop) scrollTop.classList.toggle('visible', y > 620);
  };
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  if (menu && navbar) {
    menu.addEventListener('click', () => {
      const open = navbar.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
    });
    navbar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navbar.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    }));
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = (header?.offsetHeight || 70) - 1;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: .11, rootMargin: '0px 0px -45px' });
    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.navbar a[href^="#"]')];
  const updateActiveNav = () => {
    let active = 'home';
    const pos = window.scrollY + 150;
    sections.forEach(section => { if (section.offsetTop <= pos) active = section.id; });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active}`));
  };
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  const glow = document.getElementById('cursor-glow');
  if (glow && !reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', e => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  const form = document.getElementById('sheetdb-form');
  const status = document.getElementById('form-status');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      if (status) status.textContent = 'Transmitting…';
      if (button) button.disabled = true;
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
        if (!response.ok) throw new Error('Request failed');
        form.reset();
        if (status) status.textContent = 'Message transmitted successfully.';
      } catch (_) {
        if (status) status.textContent = 'Transmission failed — please email me directly.';
      } finally {
        if (button) button.disabled = false;
      }
    });
  }
})();

(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.getElementById('home');
  const scene = document.getElementById('hero-scene');
  const heroSpectrum = document.getElementById('hero-spectrum');
  const lapSpectrum = document.getElementById('lap-spectrum');
  const lapWave = document.getElementById('lap-wave');
  const linkBars = [...document.querySelectorAll('#link-bars i')];
  const snr = document.getElementById('snr-value');
  const consoleSnr = document.getElementById('console-snr');
  const latency = document.getElementById('console-latency');
  const lapRfFill = document.getElementById('lap-rf-fill');
  const lapSnrValue = document.getElementById('lap-snr-value');

  if (false && hero && scene && !reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    let tx=0,ty=0,cx=0,cy=0;
    hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*-8;ty=((e.clientY-r.top)/r.height-.5)*-5},{passive:true});
    hero.addEventListener('pointerleave',()=>{tx=0;ty=0});
    const loop=()=>{cx+=(tx-cx)*.04;cy+=(ty-cy)*.04;scene.style.transform=`translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0) scale(1.015)`;requestAnimationFrame(loop)};
    requestAnimationFrame(loop);
  }

  const animateSpectrum=(canvas,bars=76)=>{
    if(!canvas||reducedMotion)return;const ctx=canvas.getContext('2d');let phase=0;
    const resize=()=>{const r=canvas.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)};
    window.addEventListener('resize',resize,{passive:true});resize();
    const draw=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return requestAnimationFrame(draw);phase+=.04;ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(95,177,226,.10)';ctx.lineWidth=.6;for(let i=1;i<4;i++){const y=h*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}const bw=w/bars;for(let i=0;i<bars;i++){const p1=1.8*Math.exp(-Math.pow(i-(bars*.22+Math.sin(phase*1.5)*2.7),2)/(bars*.28));const p2=2.2*Math.exp(-Math.pow(i-(bars*.57+Math.cos(phase)*3),2)/(bars*.34));const p3=2.5*Math.exp(-Math.pow(i-(bars*.79+Math.sin(phase*.8)*2),2)/(bars*.23));const n=.28+.18*Math.sin(i*1.7+phase*5)+.11*Math.sin(i*4.1-phase*3.5);const v=Math.max(.05,Math.min(1,(p1+p2+p3+n)/3));const bh=v*(h-5);const x=i*bw;const g=ctx.createLinearGradient(x,0,x+bw,0);if(i<bars*.4){g.addColorStop(0,'#2c91e6');g.addColorStop(1,'#58ddff')}else if(i<bars*.72){g.addColorStop(0,'#7658ef');g.addColorStop(1,'#c86fff')}else{g.addColorStop(0,'#e36e2f');g.addColorStop(1,'#ffad4e')}ctx.fillStyle=g;ctx.shadowBlur=4;ctx.shadowColor=i<bars*.4?'#55d9ff':i<bars*.72?'#ba6cff':'#ff963e';ctx.fillRect(x+.5,h-bh,Math.max(1,bw-1),bh)}ctx.shadowBlur=0;requestAnimationFrame(draw)};requestAnimationFrame(draw)
  };

  const animateWave=(canvas)=>{
    if(!canvas||reducedMotion)return;const ctx=canvas.getContext('2d');let phase=0;
    const resize=()=>{const r=canvas.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)};window.addEventListener('resize',resize,{passive:true});resize();
    const line=(base,amp,speed,color)=>{ctx.beginPath();for(let x=0;x<=canvas.clientWidth;x+=2){const y=canvas.clientHeight*base+Math.sin(x*.05+phase*speed)*amp+Math.cos(x*.022-phase*speed*.8)*amp*.35;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.shadowBlur=5;ctx.shadowColor=color;ctx.stroke();ctx.shadowBlur=0};
    const draw=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return requestAnimationFrame(draw);phase+=.055;ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(95,177,226,.09)';ctx.lineWidth=.5;for(let i=1;i<4;i++){const y=h*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}line(.34,h*.07,1.2,'#55dcff');line(.55,h*.08,1.55,'#ff9d43');line(.72,h*.06,1.85,'#ca70ff');requestAnimationFrame(draw)};requestAnimationFrame(draw)
  };

  animateSpectrum(heroSpectrum,84);animateSpectrum(lapSpectrum,48);animateWave(lapWave);

  const base={1:{a:120,r:-67},2:{a:80,r:-71},3:{a:100,r:-69}};let tick=0;
  if(!reducedMotion)setInterval(()=>{tick++;Object.keys(base).forEach((id,idx)=>{const alt=base[id].a+Math.round(Math.sin(tick*.52+idx)*2);const rssi=base[id].r+Math.round(Math.sin(tick*.67+idx*1.3)*2);const a=document.querySelector(`[data-alt="${id}"]`);const r=document.querySelector(`[data-rssi="${id}"]`);const la=document.querySelector(`[data-laptop-alt="${id}"]`);const lr=document.querySelector(`[data-laptop-rssi="${id}"]`);if(a)a.textContent=alt;if(r)r.textContent=rssi;if(la)la.textContent=alt;if(lr)lr.textContent=rssi});const sv=27.8+Math.sin(tick*.58)*2; if(snr)snr.textContent=`${sv.toFixed(1)} dB`; if(lapSnrValue)lapSnrValue.textContent=`${sv.toFixed(1)} dB`;if(consoleSnr)consoleSnr.textContent=`${(28.1+Math.sin(tick*.4)*1.5).toFixed(1)} dB`;if(latency)latency.textContent=`${Math.round(42+Math.sin(tick*.5)*7)} ms`;if(lapRfFill)lapRfFill.style.width=`${68+Math.sin(tick*.45)*12}%`;linkBars.forEach((bar,i)=>bar.style.height=`${Math.min(31,10+Math.max(0,Math.sin(tick*.48+i*.7)*11+10))}px`)},720);
})();


/* =========================================================
   V21 responsive hero alignment
   Keeps every overlay attached to the 1672x941 hero artwork.
========================================================= */
(() => {
  'use strict';

  const DESIGN_W = 1672;
  const DESIGN_H = 941;
  const hero = document.getElementById('home');
  const layer = document.getElementById('hero-coordinate-layer');
  const image = hero?.querySelector('.hero-scene-image');

  if (!hero || !layer || !image) return;

  let raf = 0;

  const syncHeroCoordinates = () => {
    raf = 0;
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Same math as CSS object-fit: cover with centered object-position.
    const scale = Math.max(rect.width / DESIGN_W, rect.height / DESIGN_H);
    const renderedW = DESIGN_W * scale;
    const renderedH = DESIGN_H * scale;
    const offsetX = (rect.width - renderedW) / 2;
    const offsetY = (rect.height - renderedH) / 2;

    layer.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;

    // Responsive HUD collision-avoidance: keep cards inside the visible hero
    // and below the header while preserving their attachment to the artwork.
    const header = document.getElementById('site-header');
    const headerBottom = header ? (header.getBoundingClientRect().bottom - rect.top) : 0;
    const safeTop = Math.max(18, headerBottom + 10);
    const safeLeft = 14;
    const safeRight = 14;
    const safeBottom = 18;

    const placeHud = (selector, baseX, baseY, opts = {}) => {
      const el = layer.querySelector(selector);
      if (!el) return;
      const boxW = opts.width || el.offsetWidth || 120;
      const boxH = opts.height || el.offsetHeight || 48;
      let dx = 0, dy = 0;
      const sx = offsetX + baseX * scale;
      const sy = offsetY + baseY * scale;
      const sw = boxW * scale;
      const sh = boxH * scale;

      if (sx < safeLeft) dx += (safeLeft - sx) / scale;
      if (sx + sw > rect.width - safeRight) dx -= ((sx + sw) - (rect.width - safeRight)) / scale;
      if (sy < safeTop) dy += (safeTop - sy) / scale;
      if (sy + sh > rect.height - safeBottom) dy -= ((sy + sh) - (rect.height - safeBottom)) / scale;

      // On narrower screens, gently spread the right-side HUD boxes vertically.
      if (rect.width < 1400) {
        if (selector.includes('spectrum-card')) dy += 22 / scale;
        if (selector.includes('telemetry-2')) dy += 10 / scale;
        if (selector.includes('telemetry-3')) dy += 16 / scale;
      }
      if (rect.width < 1200) {
        if (selector.includes('spectrum-card')) dx -= 18 / scale;
        if (selector.includes('telemetry-2')) dx -= 14 / scale;
        if (selector.includes('telemetry-3')) dx -= 24 / scale;
        if (selector.includes('link-card')) dx -= 14 / scale;
      }

      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    placeHud('.spectrum-card', 1325, 62, { width: 300, height: 94 });
    placeHud('.telemetry-1', 690, 145, { width: 150, height: 56 });
    placeHud('.telemetry-2', 1275, 198, { width: 150, height: 56 });
    placeHud('.telemetry-3', 1502, 350, { width: 150, height: 56 });
    placeHud('.ground-card', 1014, 493, { width: 170, height: 50 });
    placeHud('.link-card', 1470, 678, { width: 170, height: 74 });

    // Expose values for debugging / future fine tuning.
    hero.style.setProperty('--hero-art-scale', scale.toFixed(6));
    hero.style.setProperty('--hero-art-x', `${offsetX.toFixed(2)}px`);
    hero.style.setProperty('--hero-art-y', `${offsetY.toFixed(2)}px`);
  };

  const requestSync = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(syncHeroCoordinates);
  };

  // Disable the old independent image parallax transform because it would
  // otherwise move the photograph without moving the coordinate overlay.
  const scene = document.getElementById('hero-scene');
  if (scene) {
    scene.style.transform = 'none';
    scene.style.transition = 'none';
  }

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(requestSync);
    ro.observe(hero);
  } else {
    window.addEventListener('resize', requestSync, { passive: true });
  }

  window.addEventListener('orientationchange', requestSync, { passive: true });
  if (image.complete) requestSync();
  else image.addEventListener('load', requestSync, { once: true });
  requestSync();
})();


/* =========================================================
   V23 responsive screen-space HUD placement
   - Spectrum is viewport-responsive, not image-scaled.
   - UAV labels are projected from the background image, then placed
     around (not over) each drone.
   - Works across desktop, laptop, tablet, and mobile widths.
========================================================= */
(() => {
  'use strict';

  const DESIGN_W = 1672;
  const DESIGN_H = 941;
  const hero = document.getElementById('home');
  const image = hero?.querySelector('.hero-scene-image');
  const hud = document.getElementById('hero-responsive-hud');
  const header = document.getElementById('site-header');
  if (!hero || !image || !hud) return;

  const q = sel => hud.querySelector(sel);
  const spectrum = q('.spectrum-card');
  const uav1 = q('.telemetry-1');
  const uav2 = q('.telemetry-2');
  const uav3 = q('.telemetry-3');
  const ground = q('.ground-card');
  const link = q('.link-card');

  // Center points measured in the source 1672x941 artwork.
  const anchors = {
    uav1: { x: 875, y: 132 },
    uav2: { x: 1270, y: 225 },
    uav3: { x: 1450, y: 350 },
    ground: { x: 1138, y: 495 }
  };

  let raf = 0;

  const getProjection = () => {
    const r = hero.getBoundingClientRect();
    const scale = Math.max(r.width / DESIGN_W, r.height / DESIGN_H);
    const rw = DESIGN_W * scale;
    const rh = DESIGN_H * scale;
    return {
      rect: r,
      scale,
      ox: (r.width - rw) / 2,
      oy: (r.height - rh) / 2
    };
  };

  const project = (p, pr) => ({ x: pr.ox + p.x * pr.scale, y: pr.oy + p.y * pr.scale });

  const setPos = (el, x, y) => {
    if (!el) return;
    el.style.setProperty('left', `${Math.round(x)}px`, 'important');
    el.style.setProperty('top', `${Math.round(y)}px`, 'important');
    el.style.setProperty('right', 'auto', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
  };

  const clampBox = (x, y, w, h, safe) => ({
    x: Math.max(safe.left, Math.min(x, safe.right - w)),
    y: Math.max(safe.top, Math.min(y, safe.bottom - h))
  });

  const intersects = (a, b, pad = 0) => !(
    a.x + a.w + pad <= b.x || b.x + b.w + pad <= a.x ||
    a.y + a.h + pad <= b.y || b.y + b.h + pad <= a.y
  );

  // Try several positions around a drone and choose the first fully visible
  // position that does not cover the drone's protected area or Spectrum.
  const placeAround = (el, anchor, preferred, pr, safe, occupied = []) => {
    if (!el) return null;
    const w = el.offsetWidth || 120;
    const h = el.offsetHeight || 48;
    const droneR = pr.rect.width < 700 ? 34 : pr.rect.width < 1100 ? 42 : 50;
    const gap = pr.rect.width < 700 ? 12 : 18;
    const drone = { x: anchor.x - droneR, y: anchor.y - droneR, w: droneR * 2, h: droneR * 2 };

    const candidates = {
      left:  { x: anchor.x - droneR - gap - w, y: anchor.y - h * .50 },
      right: { x: anchor.x + droneR + gap,     y: anchor.y - h * .50 },
      below: { x: anchor.x - w * .50,          y: anchor.y + droneR + gap },
      above: { x: anchor.x - w * .50,          y: anchor.y - droneR - gap - h },
      lowerLeft:  { x: anchor.x - droneR - gap - w, y: anchor.y + droneR * .35 },
      lowerRight: { x: anchor.x + droneR + gap,     y: anchor.y + droneR * .35 }
    };
    const order = [preferred, 'below', 'left', 'right', 'above', 'lowerLeft', 'lowerRight']
      .filter((v,i,a) => a.indexOf(v) === i);

    let chosen = null;
    for (const name of order) {
      const c = candidates[name];
      const raw = { x:c.x, y:c.y, w, h };
      if (raw.x < safe.left || raw.x + w > safe.right || raw.y < safe.top || raw.y + h > safe.bottom) continue;
      if (intersects(raw, drone, 5)) continue;
      if (occupied.some(o => intersects(raw, o, 8))) continue;
      chosen = raw; break;
    }

    if (!chosen) {
      const fallback = clampBox(candidates[preferred].x, candidates[preferred].y, w, h, safe);
      chosen = { ...fallback, w, h };
      // If clamping moved the box back over the drone, push it vertically away.
      if (intersects(chosen, drone, 5)) {
        const aboveY = anchor.y - droneR - gap - h;
        const belowY = anchor.y + droneR + gap;
        chosen.y = aboveY >= safe.top ? aboveY : Math.min(belowY, safe.bottom - h);
      }
    }

    setPos(el, chosen.x, chosen.y);
    el.style.display = 'grid';
    return chosen;
  };

  const layout = () => {
    raf = 0;
    const pr = getProjection();
    const W = pr.rect.width;
    const H = pr.rect.height;
    if (!W || !H) return;

    const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom - pr.rect.top) : 0;
    const margin = W < 700 ? 8 : 14;
    const safe = { left:margin, right:W-margin, top:Math.max(margin, headerBottom + 8), bottom:H-margin };

    // Spectrum is screen-space UI: always compact, always under the nav,
    // and never scaled by the background image crop.
    if (spectrum) {
      spectrum.style.display = 'block';
      const sw = spectrum.offsetWidth;
      const sh = spectrum.offsetHeight;
      const sx = Math.max(safe.left, safe.right - sw);
      setPos(spectrum, sx, safe.top);
      spectrum.dataset.layoutX = String(sx);
      spectrum.dataset.layoutY = String(safe.top);
    }

    const specRect = spectrum && spectrum.style.display !== 'none' ? {
      x: parseFloat(spectrum.style.left) || 0,
      y: parseFloat(spectrum.style.top) || 0,
      w: spectrum.offsetWidth, h: spectrum.offsetHeight
    } : null;
    const occupied = specRect ? [specRect] : [];

    const p1 = project(anchors.uav1, pr);
    const p2 = project(anchors.uav2, pr);
    const p3 = project(anchors.uav3, pr);
    const pg = project(anchors.ground, pr);

    // Hide a label only when its actual drone has been cropped completely away.
    const visible = p => p.x > -60 && p.x < W + 60 && p.y > safe.top - 80 && p.y < H + 60;

    if (uav1) {
      if (visible(p1)) {
        uav1.style.display = 'grid';
        const b = placeAround(uav1, p1, 'left', pr, safe, occupied); if (b) occupied.push(b);
      } else uav1.style.display = 'none';
    }

    if (uav2) {
      if (visible(p2)) {
        uav2.style.display = 'grid';
        // Prefer LEFT of UAV-2 so the card never sits on top of its body.
        const b = placeAround(uav2, p2, 'left', pr, safe, occupied); if (b) occupied.push(b);
      } else uav2.style.display = 'none';
    }

    if (uav3) {
      if (visible(p3)) {
        uav3.style.display = 'grid';
        // Prefer RIGHT, then BELOW. If the right edge is cropped, it automatically
        // chooses another side without covering UAV-3.
        const b = placeAround(uav3, p3, 'right', pr, safe, occupied); if (b) occupied.push(b);
      } else uav3.style.display = 'none';
    }

    if (ground) {
      const gw = ground.offsetWidth || 166, gh = ground.offsetHeight || 48;
      let gp = clampBox(pg.x - gw * .65, pg.y + (W < 700 ? 6 : 0), gw, gh, safe);
      setPos(ground, gp.x, gp.y);
      ground.style.display = 'flex';
    }

    if (link) {
      link.style.display = 'block';
      const lw = link.offsetWidth || 156, lh = link.offsetHeight || 72;
      // Lower-right screen-space position. On mobile, keep it under the UAV cards
      // and above the hero bottom edge.
      const lx = safe.right - lw;
      let ly = safe.bottom - lh - (W < 700 ? 18 : 34);
      if (W < 700 && ground) {
        const gy = parseFloat(ground.style.top) || 0;
        ly = Math.max(gy + (ground.offsetHeight || 40) + 10, ly);
        ly = Math.min(ly, safe.bottom - lh);
      }
      setPos(link, lx, ly);
    }
  };

  const requestLayout = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(layout);
  };

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(requestLayout);
    ro.observe(hero);
    ro.observe(document.documentElement);
  } else {
    window.addEventListener('resize', requestLayout, { passive:true });
  }
  window.addEventListener('resize', requestLayout, { passive:true });
  window.addEventListener('orientationchange', requestLayout, { passive:true });
  window.addEventListener('load', requestLayout, { once:true });
  if (image.complete) requestLayout();
  else image.addEventListener('load', requestLayout, { once:true });
  requestLayout();
})();


/* ============================================================
   V30 — RESEARCH-CARD LIVE IMAGE CONTROLLER
   One clean controller for AirTwinX + Wireless UAV Experiments.
============================================================ */
(() => {
  'use strict';

  const cards = [...document.querySelectorAll('.system-card')];
  const scenes = [...document.querySelectorAll('.cursor-drone-scene')];
  if (!cards.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  // Run animated overlays only while the cards are close to the viewport.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('fx-live', entry.isIntersecting));
    }, { threshold: .08, rootMargin: '140px 0px 140px 0px' });
    cards.forEach(card => io.observe(card));
  } else {
    cards.forEach(card => card.classList.add('fx-live'));
  }

  if (reduceMotion || !scenes.length) return;

  const configs = {
    airtwinx: { idleX: 58, idleY: 27, minX: 18, maxX: 84, minY: 16, maxY: 58, speed: .00092 },
    wireless: { idleX: 76, idleY: 23, minX: 58, maxX: 88, minY: 14, maxY: 36, speed: .00105 }
  };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const states = scenes.map((scene, idx) => {
    const type = scene.dataset.droneScene;
    const cfg = configs[type] || configs.airtwinx;
    const state = {
      scene, type, cfg,
      hover: false,
      tx: cfg.idleX, ty: cfg.idleY,
      x: cfg.idleX, y: cfg.idleY,
      phase: idx * 1.7 + .4,
      lines: [...scene.querySelectorAll(type === 'wireless' ? '.wire-link' : '.scan-link')]
    };

    const move = e => {
      const r = scene.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      state.tx = clamp(px, cfg.minX, cfg.maxX);
      state.ty = clamp(py, cfg.minY, cfg.maxY);
      state.hover = true;
    };

    scene.addEventListener('pointerenter', move, { passive:true });
    scene.addEventListener('pointermove', move, { passive:true });
    scene.addEventListener('pointerleave', () => { state.hover = false; }, { passive:true });
    return state;
  });

  const render = time => {
    states.forEach(s => {
      let tx = s.tx;
      let ty = s.ty;

      // Gentle autonomous flight whenever the user is not pointing at the image.
      if (!s.hover || !finePointer) {
        if (s.type === 'airtwinx') {
          tx = s.cfg.idleX + Math.sin(time * s.cfg.speed + s.phase) * 16;
          ty = s.cfg.idleY + Math.sin(time * s.cfg.speed * 1.7 + s.phase) * 7 + Math.cos(time * s.cfg.speed * .72) * 3;
        } else {
          tx = s.cfg.idleX + Math.sin(time * s.cfg.speed + s.phase) * 7;
          ty = s.cfg.idleY + Math.cos(time * s.cfg.speed * 1.45 + s.phase) * 5;
        }
        tx = clamp(tx, s.cfg.minX, s.cfg.maxX);
        ty = clamp(ty, s.cfg.minY, s.cfg.maxY);
      }

      // Smooth follow instead of snapping directly to the cursor.
      s.x += (tx - s.x) * .085;
      s.y += (ty - s.y) * .085;

      s.scene.style.setProperty('--drone-x', `${s.x.toFixed(2)}%`);
      s.scene.style.setProperty('--drone-y', `${s.y.toFixed(2)}%`);

      // All SVG links originate at the drone, so they move with it.
      s.lines.forEach(line => {
        line.setAttribute('x1', s.x.toFixed(2));
        line.setAttribute('y1', s.y.toFixed(2));
      });
    });
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
})();


/* ============================================================
   V31 — GLOBAL DRONE CURSOR (FULL WEBSITE)
============================================================ */
(() => {
  'use strict';

  const cursor = document.getElementById('global-drone-cursor');
  if (!cursor) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!finePointer || reducedMotion) {
    cursor.style.display = 'none';
    return;
  }

  document.documentElement.classList.add('has-drone-cursor');

  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.5;
  let currentX = targetX;
  let currentY = targetY;
  let raf = 0;
  let active = false;

  const lerp = (a, b, n) => a + (b - a) * n;

  const render = () => {
    currentX = lerp(currentX, targetX, 0.18);
    currentY = lerp(currentY, targetY, 0.18);
    cursor.style.transform = `translate3d(${currentX - 28}px, ${currentY - 28}px, 0)`;
    raf = requestAnimationFrame(render);
  };

  const start = () => {
    if (active) return;
    active = true;
    cursor.classList.remove('hidden');
    cursor.classList.add('visible');
    if (!raf) raf = requestAnimationFrame(render);
  };

  const stop = () => {
    active = false;
    cursor.classList.remove('visible');
    cursor.classList.add('hidden');
  };

  window.addEventListener('pointermove', e => {
    targetX = e.clientX;
    targetY = e.clientY;
    start();
  }, { passive: true });

  window.addEventListener('pointerenter', e => {
    targetX = e.clientX;
    targetY = e.clientY;
    start();
  }, { passive: true });

  window.addEventListener('pointerleave', stop, { passive: true });
  window.addEventListener('blur', stop);

  const hoverTargets = document.querySelectorAll('a, button, .button, .system-card, .nav-icon, .connect-btn, .publication-card, .hero-stat');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
})();
