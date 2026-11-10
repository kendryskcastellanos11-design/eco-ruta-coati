# EDIA Interview Copilot

Aplicación React de un solo archivo (`EDIAInterviewCopilot.jsx`) para entrenar entrevistas de trabajo con un copiloto IA paso a paso.

## Cómo ejecutarla

- **Artifact de Claude:** copia todo el contenido de `EDIAInterviewCopilot.jsx` en un artifact React. Usa Tailwind CSS y `lucide-react`, que ya están disponibles ahí.
- **Proyecto Vite/Next:** instala `react`, `lucide-react` y Tailwind CSS, e importa el componente por defecto.

## Funcionalidades

- Landing, configuración de misión, espacio de trabajo dividido (60/40) y reporte ejecutivo.
- **IA nativa:** llama a `https://api.anthropic.com/v1/messages` con `claude-sonnet-4-20250514`, sin API Key dentro de los Artifacts de Claude. La API Key opcional sirve para usar el código fuera de Claude.
- Indicador de estado: "IA Activa", "Conectando IA..." o "Modo Respaldo Local". Si la red o la API fallan, se activa solo el **motor de respaldo local**: preguntas por perfil (tech, datos, ventas, general) y evaluación basada en STAR, métricas, palabras clave de la pregunta y de la vacante, longitud y claridad.
- Modo Copiloto (guiado) y Modo Agente Evaluador (sin pistas automáticas, 2 min por pregunta, más rigor y botón "Simular fin de tiempo" para pruebas).
- Panel derecho con 3 pestañas: **Guía en Vivo**, **Soporte IA (Chat)** (chat libre con 3 consultas rápidas: ejemplo con mi perfil, qué busca el reclutador, mejorar mi borrador) y **Evaluación EDIA**.
- Umbral del 70%: la siguiente pregunta queda bloqueada hasta aprobar (con enlace "Omitir pregunta").
- Repreguntas cuando la respuesta es corta o vaga.
- Dictado por voz (Web Speech API) con mensajes claros si el navegador lo bloquea.
- Exportación del reporte a Markdown y copia al portapapeles.
