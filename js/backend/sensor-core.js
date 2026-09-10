/**
 * EcoRuta — Backend de simulación (lógica pura, sin DOM).
 *
 * Modela un sensor de distancia (tipo ultrasónico HC-SR04) que recorre una
 * pista 1D y determina el estado de un semáforo LED según la distancia al
 * obstáculo más cercano por delante de Sendel.
 *
 * Este módulo no depende de canvas ni del DOM: se puede probar de forma
 * aislada y su máquina de estados (ESTADO + umbrales) es la misma que se
 * portará más adelante al firmware del ESP32 (ver proyecto mBlock
 * "mision coati", sprite "Indicador LED" con broadcast "Validar_Estado").
 */
(function (global) {
  'use strict';

  const ESTADO = Object.freeze({
    VERDE: 'VERDE',
    AMARILLO: 'AMARILLO',
    ROJO: 'ROJO',
  });

  /** Bus de eventos minimalista — equivalente al "broadcast" de mBlock/Scratch. */
  class EventBus {
    constructor() {
      this._listeners = {};
    }
    on(event, handler) {
      (this._listeners[event] || (this._listeners[event] = [])).push(handler);
      return () => this.off(event, handler);
    }
    off(event, handler) {
      const arr = this._listeners[event];
      if (!arr) return;
      const i = arr.indexOf(handler);
      if (i >= 0) arr.splice(i, 1);
    }
    emit(event, payload) {
      (this._listeners[event] || []).slice().forEach((h) => h(payload));
    }
  }

  class Obstaculo {
    constructor({ id, tipo, label, posicionCm, radioCm = 8 }) {
      this.id = id;
      this.tipo = tipo; // 'tocones' | 'lodo' | 'mineria' | 'tronco'
      this.label = label;
      this.posicionCm = posicionCm;
      this.radioCm = radioCm;
      this.esquivado = false;
    }
  }

  /**
   * Simulador de sensor + semáforo.
   * Recorre una pista de `distanciaTotalCm` centímetros con obstáculos fijos,
   * igual que un carrito con sensor ultrasónico avanzando por un carril recto.
   */
  class SensorSimulator extends EventBus {
    constructor({
      distanciaTotalCm,
      obstaculos,
      rangoMaximoCm = 200,
      umbralAmarilloCm = 40,
      umbralRojoCm = 15,
    }) {
      super();
      this.distanciaTotalCm = distanciaTotalCm;
      this.obstaculos = obstaculos.map((o) => new Obstaculo(o));
      this.rangoMaximoCm = rangoMaximoCm;
      this.umbralAmarilloCm = umbralAmarilloCm;
      this.umbralRojoCm = umbralRojoCm;
      this.posicionCm = 0;
      this.estado = ESTADO.VERDE;
    }

    setUmbrales({ amarillo, rojo } = {}) {
      if (amarillo != null) this.umbralAmarilloCm = amarillo;
      if (rojo != null) this.umbralRojoCm = rojo;
      this._actualizar();
    }

    setRango(rangoCm) {
      this.rangoMaximoCm = rangoCm;
      this._actualizar();
    }

    /** Obstáculo activo (no esquivado) más cercano por delante del sensor. */
    obstaculoObjetivo() {
      return (
        this.obstaculos
          .filter((o) => !o.esquivado && o.posicionCm >= this.posicionCm)
          .sort((a, b) => a.posicionCm - b.posicionCm)[0] || null
      );
    }

    /** Distancia libre (cm) hasta el borde del obstáculo objetivo. */
    distanciaLibre() {
      const objetivo = this.obstaculoObjetivo();
      if (!objetivo) return Infinity;
      const d = objetivo.posicionCm - objetivo.radioCm - this.posicionCm;
      return Math.max(0, d);
    }

    _evaluarEstado(distancia) {
      if (distancia > this.rangoMaximoCm) return ESTADO.VERDE;
      if (distancia <= this.umbralRojoCm) return ESTADO.ROJO;
      if (distancia <= this.umbralAmarilloCm) return ESTADO.AMARILLO;
      return ESTADO.VERDE;
    }

    /**
     * Avanza `deltaCm` (negativo = retrocede).
     * Devuelve false si el paso fue bloqueado porque el semáforo está en ROJO
     * (hay que esquivar el obstáculo primero).
     */
    avanzar(deltaCm) {
      if (deltaCm > 0 && this.estado === ESTADO.ROJO) {
        this.emit('paso-bloqueado', this.getState());
        return false;
      }
      this.posicionCm = Math.max(0, Math.min(this.distanciaTotalCm, this.posicionCm + deltaCm));
      this._actualizar();
      return true;
    }

    /** Marca el obstáculo objetivo como esquivado (acción explícita del jugador/IA). */
    esquivarObstaculo() {
      const objetivo = this.obstaculoObjetivo();
      if (!objetivo || this.distanciaLibre() > this.umbralRojoCm) return null;
      objetivo.esquivado = true;
      this.emit('obstaculo-esquivado', { obstaculo: objetivo, ...this.getState() });
      this._actualizar();
      return objetivo;
    }

    /** Snapshot público del estado actual (sin efectos secundarios). */
    getState() {
      return {
        posicionCm: this.posicionCm,
        distanciaCm: this.distanciaLibre(),
        estado: this.estado,
        objetivo: this.obstaculoObjetivo(),
        progreso: this.posicionCm / this.distanciaTotalCm,
      };
    }

    /** Recalcula distancia/estado y emite el "broadcast" Validar_Estado. */
    _actualizar() {
      const distancia = this.distanciaLibre();
      const nuevoEstado = this._evaluarEstado(distancia);
      const cambioEstado = nuevoEstado !== this.estado;
      this.estado = nuevoEstado;
      const payload = this.getState();
      this.emit('validar-estado', payload); // == broadcast "Validar_Estado" en mBlock
      if (cambioEstado) this.emit('cambio-estado', payload);
      if (this.posicionCm >= this.distanciaTotalCm) this.emit('meta-alcanzada', payload);
      return payload;
    }

    reset() {
      this.posicionCm = 0;
      this.obstaculos.forEach((o) => {
        o.esquivado = false;
      });
      this.estado = ESTADO.VERDE;
      this._actualizar();
    }
  }

  global.EcoRuta = global.EcoRuta || {};
  global.EcoRuta.Backend = { ESTADO, EventBus, Obstaculo, SensorSimulator };
})(window);
