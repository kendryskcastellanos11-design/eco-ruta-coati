/**
 * EcoRuta — Frontend: efectos de sonido sintetizados con Web Audio API.
 * Sin archivos externos (funciona 100% offline vía file://). El contexto de
 * audio se "desbloquea" con la primera interacción del usuario, tal como
 * exigen las políticas de autoplay de los navegadores.
 */
(function (global) {
  'use strict';

  let ctx = null;
  function getCtx() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function unlock() {
    getCtx();
  }
  document.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('keydown', unlock, { once: true });

  /** Reproduce un tono simple con envolvente (ataque rápido, caída exponencial). */
  function tone(freq, startOffset, duration, { type = 'sine', gain = 0.2, glideTo = null } = {}) {
    const audioCtx = getCtx();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    const t0 = audioCtx.currentTime + startOffset;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + duration);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.03);
  }

  const SFX = {
    /** Acierto: bloque correcto / obstáculo esquivado con éxito. */
    correcto() {
      tone(523.25, 0, 0.13, { type: 'sine', gain: 0.22 }); // Do5
      tone(783.99, 0.09, 0.2, { type: 'sine', gain: 0.22 }); // Sol5
    },
    /** Error: bloque incorrecto. */
    error() {
      tone(220, 0, 0.2, { type: 'square', gain: 0.14, glideTo: 130 });
    },
    /** Evasión física del obstáculo (suena también en modo automático). */
    evadir() {
      tone(520, 0, 0.13, { type: 'triangle', gain: 0.16, glideTo: 280 });
    },
    /** Éxito final: misión completada. */
    victoria() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(f, i * 0.13, 0.24, { type: 'triangle', gain: 0.22 });
      });
    },
  };

  global.EcoRuta = global.EcoRuta || {};
  global.EcoRuta.Audio = SFX;
})(window);
