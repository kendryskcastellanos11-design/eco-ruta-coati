/**
 * EcoRuta — Datos de las misiones (pista, sendero visual y obstáculos).
 * Dos niveles de dificultad pensados por edad:
 *   - FACIL:   6 a 8 años  — 4 obstáculos, sendero corto.
 *   - DIFICIL: 9 a 12 años — 8 obstáculos, sendero largo con más curvas.
 */
(function (global) {
  'use strict';

  // Sendero corto (curva en S) desde INICIO hasta la meta.
  const WAYPOINTS_FACIL = [
    { x: 88, y: 585 },
    { x: 238, y: 575 },
    { x: 375, y: 631 },
    { x: 513, y: 575 },
    { x: 588, y: 463 },
    { x: 538, y: 350 },
    { x: 650, y: 275 },
    { x: 813, y: 294 },
    { x: 913, y: 219 },
    { x: 863, y: 313 },
    { x: 963, y: 375 },
    { x: 1075, y: 325 },
  ];

  // Mismo inicio que la versión fácil, pero con dos lazos extra que
  // alargan bastante el recorrido antes de llegar a la meta.
  const WAYPOINTS_DIFICIL = [
    { x: 88, y: 585 },
    { x: 238, y: 575 },
    { x: 375, y: 631 },
    { x: 513, y: 575 },
    { x: 588, y: 463 },
    { x: 538, y: 350 },
    { x: 650, y: 275 },
    { x: 813, y: 294 },
    { x: 913, y: 219 },
    { x: 863, y: 313 },
    { x: 963, y: 375 },
    { x: 1075, y: 325 },
    { x: 1140, y: 430 },
    { x: 1000, y: 480 },
    { x: 860, y: 560 },
    { x: 740, y: 480 },
    { x: 840, y: 380 },
    { x: 1010, y: 340 },
    { x: 1130, y: 250 },
    { x: 1020, y: 190 },
    { x: 900, y: 230 },
    { x: 970, y: 160 },
  ];

  const MISION_FACIL = {
    id: 'mision-1-facil',
    dificultad: 'facil',
    rangoEdad: '6 a 8 años',
    titulo: 'MISIÓN 1: ECO RUTA · Fácil',
    inicioLabel: 'INICIO',
    metaLabel: 'PARQUE NACIONAL CANAIMA',
    distanciaTotalCm: 520,
    rangoMaximoCm: 180,
    umbralAmarilloCm: 40,
    umbralRojoCm: 15,
    waypoints: WAYPOINTS_FACIL,
    obstaculos: [
      { id: 'tocones-1', tipo: 'tocones', label: 'Tocones de árboles — deforestación', posicionCm: 110, radioCm: 14 },
      { id: 'lodo-1', tipo: 'lodo', label: 'Charco de lodo — erosión del suelo', posicionCm: 230, radioCm: 10 },
      { id: 'mineria-1', tipo: 'mineria', label: 'Mina ilegal — extracción de oro', posicionCm: 350, radioCm: 12 },
      { id: 'tronco-1', tipo: 'tronco', label: 'Tronco caído en el camino', posicionCm: 460, radioCm: 14 },
    ],
  };

  const MISION_DIFICIL = {
    id: 'mision-1-dificil',
    dificultad: 'dificil',
    rangoEdad: '9 a 12 años',
    titulo: 'MISIÓN 1: ECO RUTA · Avanzada',
    inicioLabel: 'INICIO',
    metaLabel: 'PARQUE NACIONAL CANAIMA',
    distanciaTotalCm: 1000,
    rangoMaximoCm: 180,
    umbralAmarilloCm: 40,
    umbralRojoCm: 15,
    waypoints: WAYPOINTS_DIFICIL,
    obstaculos: [
      { id: 'tocones-1', tipo: 'tocones', label: 'Tocones de árboles — deforestación', posicionCm: 90, radioCm: 16 },
      { id: 'lodo-1', tipo: 'lodo', label: 'Charco de lodo — erosión del suelo', posicionCm: 200, radioCm: 11 },
      { id: 'mineria-1', tipo: 'mineria', label: 'Mina ilegal — extracción de oro', posicionCm: 310, radioCm: 13 },
      { id: 'tronco-1', tipo: 'tronco', label: 'Tronco caído en el camino', posicionCm: 430, radioCm: 15 },
      { id: 'tocones-2', tipo: 'tocones', label: 'Más tocones — tala reciente', posicionCm: 540, radioCm: 14 },
      { id: 'lodo-2', tipo: 'lodo', label: 'Otro charco de lodo — terreno inundado', posicionCm: 650, radioCm: 12 },
      { id: 'mineria-2', tipo: 'mineria', label: 'Segunda mina ilegal', posicionCm: 760, radioCm: 14 },
      { id: 'tronco-2', tipo: 'tronco', label: 'Otro tronco caído', posicionCm: 860, radioCm: 13 },
    ],
  };

  global.EcoRuta = global.EcoRuta || {};
  global.EcoRuta.MISIONES = { facil: MISION_FACIL, dificil: MISION_DIFICIL };
})(window);
