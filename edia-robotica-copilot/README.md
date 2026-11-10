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

Panel lateral con **Guía del paso** (consejos y seguridad) y **Soporte IA (Chat)** con 3 consultas rápidas. Sin conexión, todo funciona con la biblioteca local y el soporte de respaldo.
