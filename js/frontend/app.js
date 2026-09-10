/**
 * EcoRuta — Frontend: wiring de UI, loop de juego, reto de bloques,
 * dificultades y animación de esquive. Sólo usa la API pública del backend
 * (SensorSimulator): no duplica reglas de sensor/semáforo.
 */
(function () {
  'use strict';

  const { Backend, MISIONES, Frontend, Audio } = window.EcoRuta;
  const { SensorSimulator, ESTADO } = Backend;

  const canvas = document.getElementById('scene');

  // ---- referencias DOM ----
  const $ = (id) => document.getElementById(id);
  const elDistance = $('hud-distance');
  const elState = $('hud-state');
  const elProgress = $('hud-progress-bar');
  const elProgressPct = $('hud-progress-pct');
  const elLog = $('log-list');
  const elBtnPlay = $('btn-autoplay');
  const elBtnForward = $('btn-forward');
  const elBtnBack = $('btn-back');
  const elBtnReset = $('btn-reset');
  const elSpeed = $('cfg-speed');
  const elRango = $('cfg-rango');
  const elAmarillo = $('cfg-amarillo');
  const elRojo = $('cfg-rojo');
  const elRangoVal = $('cfg-rango-val');
  const elAmarilloVal = $('cfg-amarillo-val');
  const elRojoVal = $('cfg-rojo-val');
  const elToast = $('toast');
  const elVictory = $('victory-modal');
  const elVictoryStats = $('victory-stats');
  const elBtnPanelToggle = $('btn-panel-toggle');
  const elSidePanel = $('side-panel');
  const elChallengeIdle = $('challenge-idle');
  const elChallengeActive = $('challenge-active');
  const elMissionTitle = $('mission-title');
  const elConfettiLayer = $('confetti-layer');
  const diffToggleButtons = Array.from(document.querySelectorAll('.diff-toggle-btn'));
  const tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const semLeds = {
    ROJO: document.querySelector('.led-rojo'),
    AMARILLO: document.querySelector('.led-amarillo'),
    VERDE: document.querySelector('.led-verde'),
  };

  // ---- reto de bloques "Programa a Sendel" ----
  const blockChallenge = new Frontend.BlockChallenge({
    slotId: 'challenge-slot',
    paletteId: 'block-palette',
    runBtnId: 'btn-run-program',
    feedbackId: 'challenge-feedback',
    labelId: 'challenge-obstacle-label',
  });

  const CORRECT_BLOCK = {
    id: 'esquivar',
    icon: '↩️',
    label: 'Rodear el obstáculo',
    correct: true,
    feedback: '¡Perfecto! 🎉 Cuando hay un obstáculo muy cerca, Sendel lo rodea en vez de chocar.',
  };
  const WRONG_BLOCKS = [
    {
      id: 'avanzar',
      icon: '▶️',
      label: 'Seguir avanzando',
      correct: false,
      feedback: '¡Cuidado! Si Sendel avanza de frente va a chocar. Busca otro bloque.',
    },
    {
      id: 'detener',
      icon: '⏸️',
      label: 'Detenerse y esperar',
      correct: false,
      feedback: 'Si Sendel solo espera, nunca llegará a Canaima. ¡Necesita una acción!',
    },
    {
      id: 'retroceder',
      icon: '⬅️',
      label: 'Retroceder',
      correct: false,
      feedback: 'Retroceder lo aleja de la meta. Sendel necesita seguir avanzando de otra forma.',
    },
  ];

  function shuffle(arr) {
    return arr
      .map((v) => [Math.random(), v])
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v);
  }

  // ---- estado mutable de la partida (se reinicia por misión) ----
  let sim = null;
  let renderer = null;
  let currentMission = null;
  let facing = 'right';
  let moving = false;
  let autoplay = false;
  let dodging = false;
  let autoFinishing = false;
  let challengeActive = false;
  let stats = { esquivados: 0, paradas: 0, inicioMs: null };
  let finished = false;
  let loopStarted = false;

  function toast(msg, kind = 'info') {
    elToast.textContent = msg;
    elToast.className = `toast show toast-${kind}`;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => elToast.classList.remove('show'), 2200);
  }

  function logMsg(text, kind = 'info') {
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString('es-VE', { hour12: false });
    li.className = `log-${kind}`;
    li.textContent = `[${time}] ${text}`;
    elLog.appendChild(li);
    elLog.scrollTop = elLog.scrollHeight;
    while (elLog.children.length > 60) elLog.removeChild(elLog.firstChild);
  }

  function updateSemaforo(estado) {
    Object.entries(semLeds).forEach(([key, el]) => {
      el.classList.toggle('on', key === estado);
    });
  }

  function updateHud(state) {
    const distTxt = state.distanciaCm === Infinity ? '— sin objetivo —' : `${Math.round(state.distanciaCm)} cm`;
    elDistance.textContent = distTxt;
    elState.textContent = state.estado;
    elState.className = `hud-state-value state-${state.estado.toLowerCase()}`;
    const pct = Math.round(state.progreso * 100);
    elProgress.style.width = `${pct}%`;
    elProgressPct.textContent = `${pct}%`;
    updateSemaforo(state.estado);
  }

  function render(state, extraOpts = {}) {
    renderer.draw(state, { posicionCm: sim.posicionCm, facing, moving, ...extraOpts });
  }

  // ---- confeti 🎉 ----
  function launchConfetti(count = 140) {
    const colors = ['#2ec46a', '#f0b414', '#e23c3c', '#2f6f8f', '#ffffff', '#8a5a34', '#9b59b6'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'confetti-piece';
      if (Math.random() < 0.5) el.classList.add('round');
      el.style.left = `${Math.random() * 100}%`;
      el.style.background = colors[(Math.random() * colors.length) | 0];
      el.style.animationDuration = `${1.6 + Math.random() * 1.6}s`;
      el.style.animationDelay = `${Math.random() * 0.35}s`;
      el.style.setProperty('--rot', `${(Math.random() * 480 - 240) | 0}deg`);
      el.style.setProperty('--drift', `${(Math.random() * 220 - 110) | 0}px`);
      elConfettiLayer.appendChild(el);
      setTimeout(() => el.remove(), 3400);
    }
  }

  // ---- pestañas del panel lateral ----
  function switchTab(tab) {
    tabButtons.forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    tabPanels.forEach((p) => {
      p.hidden = p.dataset.tab !== tab;
    });
  }
  function openSidePanel(tab) {
    elSidePanel.classList.add('open');
    if (tab) switchTab(tab);
  }
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      elSidePanel.classList.add('open');
      switchTab(btn.dataset.tab);
    });
  });
  elBtnPanelToggle.addEventListener('click', () => {
    elSidePanel.classList.toggle('open');
  });

  // ---- reto de bloques ----
  function openChallenge(objetivo) {
    if (challengeActive || !objetivo) return;
    challengeActive = true;
    elChallengeIdle.hidden = true;
    elChallengeActive.hidden = false;
    openSidePanel('programar');
    const wrongPick = shuffle(WRONG_BLOCKS).slice(0, 2);
    const blocks = shuffle([CORRECT_BLOCK, ...wrongPick]);
    blockChallenge.open(objetivo.label, blocks);
    logMsg(`Reto: programa a Sendel para pasar "${objetivo.label}".`, 'warn');
  }

  function closeChallenge() {
    challengeActive = false;
    elChallengeIdle.hidden = false;
    elChallengeActive.hidden = true;
  }

  blockChallenge.onResolved = (blockId, correct) => {
    if (correct) {
      Audio.correcto();
      logMsg('Bloque correcto: "Rodear el obstáculo". Ejecutando programa...', 'ok');
      setTimeout(() => {
        closeChallenge();
        startDodgeAnimation();
      }, 700);
    } else {
      Audio.error();
      logMsg(`Bloque "${blockId}" no resuelve el obstáculo. Sendel sigue esperando.`, 'danger');
    }
  };

  // ---- animación de esquive: Sendel rodea el obstáculo en un arco ----
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function startDodgeAnimation() {
    const objetivo = sim.obstaculoObjetivo();
    if (!objetivo) return;
    const fromCm = sim.posicionCm;
    const toCm = Math.min(currentMission.distanciaTotalCm, objetivo.posicionCm + objetivo.radioCm + 14);
    const idx = currentMission.obstaculos.findIndex((o) => o.id === objetivo.id);
    const side = idx % 2 === 0 ? 1 : -1;
    const amplitude = 55 + objetivo.radioCm * renderer.pxPerCm * 1.6;
    const arc = renderer.computeDodgeArc(fromCm, toCm, side, amplitude);

    sim.esquivarObstaculo(); // marca el obstáculo, dispara eventos/estadísticas/registro
    dodging = true;
    moving = true;

    const duration = 950;
    const t0 = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - t0) / duration);
      const eased = easeInOutQuad(t);
      const p = renderer.sampleDodgeArc(arc, eased);
      const hop = Math.sin(eased * Math.PI) * 24;
      facing = Math.cos(p.angle) < 0 ? 'left' : 'right';
      render(sim.getState(), {
        customPoint: { x: p.x, y: p.y - hop, angle: p.angle },
        hideCone: true,
      });
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        dodging = false;
        moving = false;
        sim.avanzar(toCm - sim.posicionCm);
        if (!autoplay && !finished && !sim.obstaculoObjetivo()) startAutoFinish();
      }
    }
    requestAnimationFrame(tick);
  }

  /** Tras el último obstáculo, Sendel camina solo hasta la meta. */
  function startAutoFinish() {
    if (autoFinishing || finished) return;
    autoFinishing = true;
    facing = 'right';
    function tick() {
      if (finished || autoplay || !sim) {
        autoFinishing = false;
        return;
      }
      moving = true;
      sim.avanzar(16);
      if (finished || sim.posicionCm >= currentMission.distanciaTotalCm) {
        autoFinishing = false;
        moving = false;
        return;
      }
      setTimeout(tick, 90);
    }
    tick();
  }

  // ---- eventos del backend (equivalentes a "broadcast Validar_Estado") ----
  function bindSimEvents() {
    sim.on('validar-estado', (state) => {
      if (dodging) return; // durante el esquive, el render lo controla la animación
      updateHud(state);
      render(state);
    });

    sim.on('cambio-estado', (state) => {
      if (state.estado === ESTADO.AMARILLO) {
        logMsg(`Distancia ${Math.round(state.distanciaCm)}cm → AMARILLO, reduciendo velocidad.`, 'warn');
      } else if (state.estado === ESTADO.ROJO) {
        logMsg(`Distancia ${Math.round(state.distanciaCm)}cm → ROJO, STOP.`, 'danger');
        stats.paradas += 1;
        if (!autoplay) openChallenge(state.objetivo);
      } else {
        logMsg('Camino libre → VERDE.', 'ok');
      }
    });

    sim.on('paso-bloqueado', (state) => {
      toast('¡Muy cerca! Resuelve el reto de programación para continuar →', 'danger');
      if (!autoplay) openChallenge(state.objetivo);
    });

    sim.on('obstaculo-esquivado', ({ obstaculo }) => {
      stats.esquivados += 1;
      Audio.evadir();
      logMsg(`Obstáculo esquivado: ${obstaculo.label}.`, 'ok');
      toast(`Sendel rodeó: ${obstaculo.label}`, 'ok');
    });

    sim.on('meta-alcanzada', () => {
      if (finished) return;
      finished = true;
      autoplay = false;
      elBtnPlay.textContent = '▶ Auto';
      showVictory();
    });
  }

  function showVictory() {
    const segundos = stats.inicioMs ? Math.round((Date.now() - stats.inicioMs) / 1000) : 0;
    elVictoryStats.innerHTML = `
      <li>Obstáculos esquivados: <strong>${stats.esquivados}</strong></li>
      <li>Paradas de emergencia (ROJO): <strong>${stats.paradas}</strong></li>
      <li>Tiempo total: <strong>${segundos}s</strong></li>
    `;
    elVictory.classList.add('show');
    Audio.victoria();
    launchConfetti();
    setTimeout(() => launchConfetti(90), 350);
  }

  // ---- controles manuales ----
  function step(dir) {
    if (finished || dodging || autoFinishing || !sim) return;
    if (!stats.inicioMs) stats.inicioMs = Date.now();
    facing = dir > 0 ? 'right' : 'left';
    moving = true;
    const stepCm = 14;
    const ok = sim.avanzar(dir * stepCm);
    clearTimeout(step._t);
    step._t = setTimeout(() => {
      moving = false;
      if (!dodging) render(sim.getState());
    }, 160);
    return ok;
  }

  elBtnForward.addEventListener('click', () => step(1));
  elBtnBack.addEventListener('click', () => step(-1));
  elBtnReset.addEventListener('click', () => {
    if (currentMission) startMission(currentMission);
  });

  document.addEventListener('keydown', (e) => {
    if (elVictory.classList.contains('show')) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'd':
      case 'D':
        step(1);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        step(-1);
        break;
      case ' ':
        e.preventDefault();
        toggleAutoplay();
        break;
      default:
        break;
    }
  });

  // ---- calibración ----
  function syncCalibLabels() {
    elRangoVal.textContent = `${elRango.value} cm`;
    elAmarilloVal.textContent = `${elAmarillo.value} cm`;
    elRojoVal.textContent = `${elRojo.value} cm`;
  }
  [elRango, elAmarillo, elRojo].forEach((el) => {
    el.addEventListener('input', () => {
      syncCalibLabels();
      if (!sim) return;
      sim.setRango(Number(elRango.value));
      sim.setUmbrales({ amarillo: Number(elAmarillo.value), rojo: Number(elRojo.value) });
    });
  });

  // ---- autoplay (demo autónomo) ----
  function toggleAutoplay() {
    if (!sim) return;
    autoplay = !autoplay;
    elBtnPlay.textContent = autoplay ? '⏸ Pausar' : '▶ Auto';
    if (autoplay && !stats.inicioMs) stats.inicioMs = Date.now();
  }
  elBtnPlay.addEventListener('click', toggleAutoplay);

  function autoTick() {
    if (sim && autoplay && !finished && !dodging && !autoFinishing) {
      const speed = Number(elSpeed.value); // cm por tick, a VERDE
      let delta = 0;
      if (sim.estado === ESTADO.VERDE) delta = speed;
      else if (sim.estado === ESTADO.AMARILLO) delta = speed * 0.35;

      facing = 'right';
      if (delta > 0) {
        moving = true;
        sim.avanzar(delta);
      } else if (sim.estado === ESTADO.ROJO) {
        moving = false;
        setTimeout(() => {
          if (autoplay && sim.estado === ESTADO.ROJO && !dodging) startDodgeAnimation();
        }, 500);
      }
    }
    if (sim && !dodging) requestAnimationFrame(loopRender);
    setTimeout(autoTick, 90);
  }

  function loopRender() {
    if (dodging || !sim) return;
    if (!autoFinishing) render(sim.getState());
  }

  // ---- selección de dificultad / arranque de misión ----
  function startMission(mission) {
    currentMission = mission;
    sim = new SensorSimulator({
      distanciaTotalCm: mission.distanciaTotalCm,
      obstaculos: mission.obstaculos,
      rangoMaximoCm: mission.rangoMaximoCm,
      umbralAmarilloCm: mission.umbralAmarilloCm,
      umbralRojoCm: mission.umbralRojoCm,
    });
    renderer = new Frontend.SceneRenderer(canvas, mission);

    finished = false;
    dodging = false;
    autoFinishing = false;
    autoplay = false;
    challengeActive = false;
    facing = 'right';
    moving = false;
    stats = { esquivados: 0, paradas: 0, inicioMs: null };

    elBtnPlay.textContent = '▶ Auto';
    elVictory.classList.remove('show');
    elLog.innerHTML = '';
    closeChallenge();
    elMissionTitle.textContent = mission.titulo;

    bindSimEvents();

    renderer
      .loadAssets({ sendel: 'assets/sendel.png', tronco: 'assets/tronco.png' })
      .then(() => {
        logMsg(`Backend inicializado (${mission.rangoEdad}). Semáforo en VERDE.`, 'ok');
        sim.reset();
        if (!loopStarted) {
          loopStarted = true;
          autoTick();
        }
      })
      .catch((err) => {
        console.error(err);
        toast('No se pudieron cargar los assets (sendel/tronco).', 'danger');
      });
  }

  function setActiveDifficultyButton(dificultad) {
    diffToggleButtons.forEach((b) => b.classList.toggle('active', b.dataset.difficulty === dificultad));
  }

  diffToggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mission = MISIONES[btn.dataset.difficulty];
      if (!mission || (currentMission && mission.id === currentMission.id)) return;
      if (dodging || autoFinishing) {
        toast('Espera a que Sendel termine de rodear el obstáculo.', 'danger');
        return;
      }
      setActiveDifficultyButton(btn.dataset.difficulty);
      startMission(mission);
    });
  });

  $('btn-victory-close').addEventListener('click', () => elVictory.classList.remove('show'));
  $('btn-victory-restart').addEventListener('click', () => {
    elVictory.classList.remove('show');
    if (currentMission) startMission(currentMission);
  });
  $('btn-victory-confetti').addEventListener('click', () => launchConfetti(110));

  // ---- arranque ----
  syncCalibLabels();
  elSpeed.addEventListener('input', () => {
    $('cfg-speed-val').textContent = `${elSpeed.value} cm/tick`;
  });
  $('cfg-speed-val').textContent = `${elSpeed.value} cm/tick`;

  setActiveDifficultyButton('facil');
  startMission(MISIONES.facil);
})();
