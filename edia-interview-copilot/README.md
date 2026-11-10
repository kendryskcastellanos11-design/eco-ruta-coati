# EDIA Interview Copilot

Aplicación React de un solo archivo (`EDIAInterviewCopilot.jsx`) para entrenar entrevistas de trabajo con un copiloto IA paso a paso.

## Cómo ejecutarla

- **Artifact de Claude:** copia todo el contenido de `EDIAInterviewCopilot.jsx` en un artifact React. Usa Tailwind CSS y `lucide-react`, que ya están disponibles ahí.
- **Proyecto Vite/Next:** instala `react`, `lucide-react` y Tailwind CSS, e importa el componente por defecto.

## Funcionalidades

- Landing, configuración de misión, espacio de trabajo dividido (60/40) y reporte ejecutivo.
- **Modo Demo Offline** (por defecto): banco de más de 8 preguntas por perfil (tech, datos, ventas, general), con preguntas comunes y específicas, y evaluación basada en STAR, métricas, palabras clave (de la pregunta y de la vacante), longitud y claridad.
- **Modo IA** opcional: API Key de Anthropic Claude (por defecto `claude-opus-5-5`) u OpenAI. Si la API falla, vuelve automáticamente al modo demo.
- Modo Copiloto (guiado) y Modo Agente Evaluador (sin ayudas, 2 min por pregunta, más rigor).
- Umbral del 70%: la siguiente pregunta queda bloqueada hasta aprobar (con opción de omitirla).
- Repreguntas cuando la respuesta es corta o superficial.
- Dictado por voz (Web Speech API, Chrome/Edge).
- Exportación del reporte a Markdown y copia al portapapeles.
