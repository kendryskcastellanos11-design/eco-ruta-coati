# Eco Ruta — Misión 1

Simulador web (front end + back end en JavaScript puro, sin dependencias) del
juego didáctico de **Sendel**, un coatí que vive en el Parque Nacional Canaima
y debe cruzar el Bosque del CNTI para volver a casa. Sendel recorre un
sendero y un sensor de proximidad simulado (tipo
ultrasónico HC‑SR04) enciende un semáforo LED según la distancia al
obstáculo más cercano por delante:

- 🟢 **VERDE** — camino libre.
- 🟡 **AMARILLO** — obstáculo aproximándose (antes del rojo).
- 🔴 **ROJO** — obstáculo muy cerca: Sendel se detiene y aparece un reto de
  programación por bloques (estilo Scratch/mBlock) para decidir qué hacer.

Pensado para enseñar programación a niños de 6 a 12 años: nada de código de
texto, todo se resuelve arrastrando bloques y viendo el resultado animado en
la escena. Al llegar a la meta, unos tepuyes de Canaima aparecen al fondo y
se lanza una lluvia de confeti con un mensaje de felicitación.

## Cómo abrirlo

Opción rápida: doble clic en [`index.html`](index.html) (todo funciona con
rutas relativas, no requiere servidor ni build).

Si tu navegador bloquea `fetch`/módulos en `file://`, sirve la carpeta con
cualquier servidor estático, por ejemplo:

```bash
npx serve .
```

Al abrir, aparece primero una pantalla de bienvenida con la historia de la
misión (Sendel debe cruzar el Bosque del CNTI para volver a casa, en el
Parque Nacional Canaima) y un botón **"Comenzar misión"**; al pulsarlo se
entra al juego, que arranca en dificultad Fácil.

## Dificultades

| Dificultad | Edad recomendada | Obstáculos | Recorrido |
| --- | --- | --- | --- |
| 🐣 Fácil | 6 a 8 años | 4 | Corto, una sola curva en S |
| 🌟 Avanzado | 9 a 12 años | 8 | Largo, con dos lazos extra antes de la meta |

El selector de dificultad es un interruptor fijo en la barra superior
(**🐣 Fácil / 🌟 Avanzado**), visible y usable en cualquier momento durante
la partida — no es un modal ni requiere recargar la página. Cambiar de
dificultad reinicia esa misión desde cero (no se puede "continuar" a mitad
de camino entre un recorrido corto y uno largo, ya que son pistas
distintas), pero el cambio ocurre al instante. Si Sendel está a mitad de un
esquive, el botón lo avisa con un mensaje en vez de interrumpirlo. Ambas
dificultades comparten el mismo backend y las mismas reglas de sensor —
sólo cambian los datos en `js/backend/mission-data.js` (`MISIONES.facil` /
`MISIONES.dificil`).

## Controles

| Acción | Tecla / botón |
| --- | --- |
| Avanzar / retroceder | `→` `←` o botones |
| Modo automático (Sendel se conduce solo y resuelve los obstáculos él mismo) | `espacio` o botón "Auto" |
| Reiniciar misión | botón "Reiniciar" |
| Abrir/cerrar el panel de Sendel | botón "🧩 Panel de Sendel" |
| Cambiar dificultad | interruptor "🐣 Fácil / 🌟 Avanzado" de la barra superior |

En modo manual, tras resolver el **último** obstáculo del recorrido, Sendel
camina solo el resto del camino hasta la meta — no hace falta seguir
pulsando "Avanzar".

### El reto "Programa a Sendel"

Cuando el semáforo se pone en 🔴 **ROJO** (en modo manual, sin autoplay), se
abre automáticamente el panel derecho ("Terminal de Sendel") con un mini
editor de bloques:

1. Aparece un bloque de evento fijo: *"Cuando el semáforo esté 🔴 ROJO"*.
2. Debajo hay una ranura vacía y 3 bloques de acción para arrastrar (uno
   correcto — *"Rodear el obstáculo"* — y dos incorrectos, distintos cada
   vez: *"Seguir avanzando"*, *"Detenerse y esperar"*, *"Retroceder"*).
3. El niño arrastra el bloque que cree correcto a la ranura y pulsa
   **▶ Ejecutar programa**.
4. Si es el bloque correcto, Sendel **rodea el obstáculo** con una animación
   en arco (no le pasa por encima) y la misión continúa. Si es incorrecto,
   aparece una explicación amigable y puede volver a intentarlo.

El panel también tiene pestañas de **⚙️ Ajustes** (calibración en vivo del
rango máximo y los umbrales amarillo/rojo) y **📜 Registro** (log tipo
"serial monitor" de cada evento) — útiles para que un adulto/docente ajuste
la dificultad fina o explique el comportamiento como si fuera la salida de
un microcontrolador real.

## Arquitectura

```
index.html
manifest.json                   — metadata de la PWA (nombre, íconos, modo standalone)
service-worker.js               — cache offline de la app instalada
css/styles.css                  — estilos de la interfaz (responsive: móvil / tablet / escritorio)
js/backend/sensor-core.js       — lógica pura (sin DOM): SensorSimulator, EventBus
js/backend/mission-data.js      — MISIONES.facil / MISIONES.dificil (pista y obstáculos)
js/frontend/renderer.js         — dibujo de la escena en <canvas>, tepuyes, animación de esquive
js/frontend/block-challenge.js  — mini editor de bloques arrastrables (drag & drop)
js/frontend/audio.js            — efectos de sonido sintetizados con Web Audio API (sin archivos)
js/frontend/app.js              — wiring de UI, dificultades, loop de juego, confeti, IA de auto-demo
assets/sendel.png                — sprite de Sendel (fondo transparente)
assets/sendel-sad.png            — Sendel triste/preocupado, pantalla de bienvenida
assets/tronco.png                — sprite del tronco caído (fondo transparente)
assets/icon-*.png                — íconos de la app instalada (normales y "maskable" para Android)
```

**Backend** (`sensor-core.js`): modela la pista como una recta de
centímetros simulados. `SensorSimulator` calcula la distancia libre hasta el
próximo obstáculo, evalúa el estado (`VERDE`/`AMARILLO`/`ROJO`) según los
umbrales configurables, y emite eventos (`validar-estado`,
`cambio-estado`, `obstaculo-esquivado`, `meta-alcanzada`) a través de un
`EventBus` minimalista — el mismo patrón de **broadcast** que ya usa tu
proyecto mBlock ("mision coati", broadcast `Validar_Estado` hacia el sprite
"Indicador LED"). Esto es intencional: la máquina de estados aquí es
prácticamente el pseudocódigo de lo que después correrá en el ESP32 con un
sensor ultrasónico real, sólo falta:

1. Leer distancia real con `HC-SR04` (o similar) en vez de calcular la
   distancia al obstáculo más cercano en la pista simulada.
2. Sustituir `SensorSimulator` por el mismo state machine (mismos umbrales
   `umbralAmarilloCm` / `umbralRojoCm`) escrito en C++ para el ESP32.
3. Reemplazar el broadcast `Validar_Estado` de mBlock por las mismas
   transiciones de estado (`VERDE`/`AMARILLO`/`ROJO`) que ya están aquí.

**Frontend** (`renderer.js` + `block-challenge.js` + `app.js`): sólo consume
la API pública del backend (`avanzar`, `esquivarObstaculo`, `setRango`,
`setUmbrales`, `getState`, `on(...)`). No duplica ninguna regla de negocio —
así el backend se puede probar o portar de forma aislada. `app.js` puede
recrear el `SensorSimulator` y el `SceneRenderer` en cualquier momento
(`startMission(mission)`) para cambiar de dificultad sin recargar la página.

La animación de esquive (`computeDodgeArc` / `sampleDodgeArc` en
`renderer.js`) es puramente visual: calcula una curva de Bézier cuadrática
que se desvía hacia un lado del sendero para rodear el ícono del obstáculo
en vez de superponerse a él, y sólo al terminar la animación se confirma el
avance real llamando a `sim.avanzar(...)` — el backend nunca sabe que hubo
una animación, sólo ve una posición nueva.

Los tepuyes del fondo (`_drawMountains` / `_drawTepuy` en `renderer.js`) se
posicionan de forma dinámica según dónde termine el sendero de cada misión,
así que funcionan igual para el recorrido corto o el largo.

**Sonido** (`audio.js`): los efectos (acierto, error, evasión, victoria) se
sintetizan en tiempo real con osciladores de la Web Audio API — no hay
archivos `.mp3`/`.wav` que descargar ni licencias que revisar, y funciona
100% offline. El contexto de audio se desbloquea con la primera interacción
del usuario (clic o tecla), como exigen los navegadores.

## App instalable (PWA)

Gracias a `manifest.json` y `service-worker.js`, cualquiera que abra el link
puede instalar Eco Ruta como una app (ícono en la pantalla de inicio, sin
barra del navegador, y funciona offline una vez instalada) desde el menú
"Instalar aplicación" de Chrome, tanto en teléfono como en computadora.

## Próximos pasos posibles

- **Conectar el ESP32 real** vía [Web Serial API](https://developer.mozilla.org/docs/Web/API/Web_Serial_API)
  para reemplazar el sensor simulado por telemetría real del sensor
  ultrasónico.
- **Persistencia / progreso entre misiones**: guardar resultados
  (obstáculos esquivados, tiempos, paradas, dificultad elegida) en SQLite
  local o Supabase, para tener un histórico por jugador y desbloquear
  futuras misiones.
- Añadir más misiones reutilizando `sensor-core.js` con nuevas entradas en
  `MISIONES` (distinta pista, distintos obstáculos, incluso una tercera
  dificultad intermedia).
