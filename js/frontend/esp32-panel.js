/**
 * EcoRuta — Frontend: Panel visual del ESP32 ("el cerebro de Sendel").
 *
 * Sólo dibuja/anima: no decide nada del sensor. Refleja en vivo el mismo
 * estado que ya calcula SensorSimulator (backend), y el slider de este
 * panel usa la API pública `setDistanciaManual` / `salirModoManual` para
 * "engañar" al sensor sin tocar la posición real de Sendel en la pista.
 */
(function (global) {
  'use strict';

  class Esp32Panel {
    constructor({ sliderId, sliderValueId, sensorValueId, motorIconId, motorValueId, bateriaValueId, bateriaFillId }) {
      this.sliderEl = document.getElementById(sliderId);
      this.sliderValueEl = document.getElementById(sliderValueId);
      this.sensorValueEl = document.getElementById(sensorValueId);
      this.motorIconEl = document.getElementById(motorIconId);
      this.motorValueEl = document.getElementById(motorValueId);
      this.bateriaValueEl = document.getElementById(bateriaValueId);
      this.bateriaFillEl = document.getElementById(bateriaFillId);

      this.onDistanciaManual = null; // (cm) => void, lo conecta app.js
      this._bateriaPct = 96; // simulada: baja lentamente mientras se juega
      this._voltajeInicial = 4.1;

      this.sliderEl.addEventListener('input', () => {
        const cm = Number(this.sliderEl.value);
        this.sliderValueEl.textContent = `${cm} cm`;
        if (this.onDistanciaManual) this.onDistanciaManual(cm);
      });
    }

    /** Llamar en cada tick del juego con el estado actual del sensor. */
    update(state, { moving = false } = {}) {
      const distTxt = state.distanciaCm === Infinity ? '> 200 cm' : `${Math.round(state.distanciaCm)} cm`;
      this.sensorValueEl.textContent = distTxt;
      this.sensorValueEl.className = `component-value estado-${state.estado.toLowerCase()}`;

      const detenido = state.estado === 'ROJO';
      this.motorValueEl.textContent = detenido ? 'Detenidos' : moving ? 'Girando' : 'En espera';
      this.motorIconEl.classList.toggle('spinning', moving && !detenido);
      this.motorIconEl.classList.toggle('motor-slow', state.estado === 'AMARILLO');

      // Batería: drena muy despacio mientras los motores giran, solo de adorno.
      if (moving && !detenido) {
        this._bateriaPct = Math.max(20, this._bateriaPct - 0.02);
      }
      const voltaje = (3.0 + (this._bateriaPct / 100) * (this._voltajeInicial - 3.0)).toFixed(1);
      this.bateriaValueEl.textContent = `${voltaje} V`;
      this.bateriaFillEl.style.width = `${this._bateriaPct}%`;
      this.bateriaFillEl.classList.toggle('battery-low', this._bateriaPct < 30);
    }

    /** Sincroniza el slider (p.ej. al reiniciar misión) sin disparar el evento. */
    resetSlider(rangoMaximoCm) {
      this.sliderEl.max = rangoMaximoCm + 20;
      this.sliderEl.value = rangoMaximoCm + 20;
      this.sliderValueEl.textContent = `${rangoMaximoCm + 20} cm`;
    }
  }

  global.EcoRuta = global.EcoRuta || {};
  global.EcoRuta.Frontend = global.EcoRuta.Frontend || {};
  global.EcoRuta.Frontend.Esp32Panel = Esp32Panel;
})(window);
