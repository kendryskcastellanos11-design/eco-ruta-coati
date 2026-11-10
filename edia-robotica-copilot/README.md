# EDIA Robótica Copilot

Aplicación React de un solo archivo (`EDIARoboticaCopilot.jsx`) que guía proyectos de robótica educativa con **Arduino UNO**: materiales, conexiones de cada componente, código listo para cargar en la placa, pruebas y un reto final.

## Cómo ejecutarla

- **Artifact de Claude:** pega todo el contenido de `EDIARoboticaCopilot.jsx` en un Artifact React. Usa Tailwind CSS y `lucide-react`, que ya están disponibles ahí, y la IA funciona sin API Key.
- **Proyecto Vite/Next:** instala `react`, `lucide-react` y Tailwind CSS, e importa el componente por defecto.

## Flujo

1. **Catálogo:** 8 proyectos probados (semáforo, pulsador, luz nocturna con LDR, servo con potenciómetro, semáforo de distancia HC-SR04, alarma PIR, estación DHT11 y robot evasor con L298N), o **crear un proyecto con IA** describiendo la idea y los componentes disponibles.
2. **Materiales:** lista para marcar.
3. **Conexiones:** diagrama SVG generado a partir de la tabla de pines (con resaltado al pasar el ratón), tabla Componente → Pin Arduino → color de cable, y montaje paso a paso que bloquea el código hasta terminar (con opción de saltar).
4. **Código:** código comentado en español con resaltado, botón Copiar, descarga `.ino`, librerías a instalar, pasos para subirlo con el Arduino IDE y explicación por bloques.
5. **Prueba y reto:** pruebas, solución de problemas y cuestionario: con menos del 70% hay que repasar y reintentar.
6. **Resumen:** guía completa copiable o descargable en Markdown.

## Agente EDIA

Un tutor de IA que conversa con el estudiante y **actúa dentro de la app** con herramientas: ver el estado, ver el detalle del proyecto, resaltar un cable en el diagrama, marcar pasos del montaje, cambiar de fase, abrir proyectos de la biblioteca y crear proyectos nuevos con IA. Está en el panel lateral del taller (pestaña "Agente IA") y en un botón flotante en el inicio y el catálogo.

Motores, en este orden:
1. **Página publicada en claude.ai:** capacidad `sample` (usa la cuenta de Claude de quien abre la página; la primera consulta pide permiso) con las herramientas de la página.
2. **Artifact de chat o código exportado:** API de Anthropic `/v1/messages` con `tools` y un bucle de herramientas propio (`claude-sonnet-4-20250514`, API Key opcional fuera de Claude).
3. **Sin conexión:** agente local que entiende intenciones básicas ("guíame", "listo", "abre la alarma", "no funciona") y usa las mismas herramientas.
