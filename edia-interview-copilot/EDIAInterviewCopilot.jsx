import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Sparkles, Bot, Mic, MicOff, Send, Timer, ArrowLeft, Flag, KeyRound, CheckCircle2, XCircle,
  AlertTriangle, Lock, ChevronRight, Lightbulb, Target, Eye, EyeOff, Download, Copy, Trophy,
  BarChart3, Brain, Rocket, Briefcase, Building2, Languages, FileText, X, Loader2, User, Zap,
  ShieldCheck, ListChecks, RotateCcw, Award, TrendingUp, MessageSquare, Compass, Settings2, Check,
  Wifi, WifiOff, GraduationCap, Layers, LifeBuoy, Wand2, HelpCircle, Hourglass,
} from "lucide-react";

/* =========================================================================
   CONSTANTES
   ========================================================================= */

const PASS_SCORE = 70;
const TOTAL_QUESTIONS = 6;
const AGENT_SECONDS = 120;

const LEVELS = ["Junior", "Semi-Senior", "Senior", "Directivo"];

const CATEGORY_LABELS = {
  comunicacion: "Comunicación",
  tecnico: "Dominio Técnico",
  problemas: "Resolución de Problemas",
  impacto: "Impacto",
};

const STAR = [
  ["Situación", "Contexto breve: dónde, cuándo y qué estaba en juego."],
  ["Tarea", "Tu responsabilidad concreta o el objetivo que debías lograr."],
  ["Acción", "Lo que TÚ hiciste paso a paso (usa verbos en primera persona)."],
  ["Resultado", "El impacto medible (%, tiempo, dinero, usuarios) y lo que aprendiste."],
];

const TECH_STRUCT = [
  ["Contexto", "Describe el sistema, la escala y la restricción principal."],
  ["Diagnóstico", "Cómo mediste o identificaste el problema (herramientas, métricas)."],
  ["Solución y trade-offs", "Qué decidiste, qué alternativas descartaste y por qué."],
  ["Resultado", "Métrica antes/después y cómo lo monitoreaste."],
];

/* =========================================================================
   BANCO DE PREGUNTAS (MODO DEMO OFFLINE)
   ========================================================================= */

const COMMON_QUESTIONS = [
  {
    id: "c1",
    cat: "comunicacion",
    comp: "Comunicación ejecutiva y encaje con el puesto (pitch personal)",
    q: {
      es: "Para empezar, cuéntame sobre ti y por qué encajas en el puesto de {role}.",
      en: "To start, tell me about yourself and why you are a good fit for the {role} position.",
    },
    structure: [
      ["Presente", "Tu rol actual y tu especialidad principal en una frase."],
      ["Pasado", "1-2 logros con cifras que prueban tu experiencia."],
      ["Futuro", "Por qué este puesto y esta empresa son tu siguiente paso lógico."],
    ],
    kw: ["experiencia", "experience", "logro", "achievement", "especializ", "speciali", "años", "years", "motiv", "aport", "value", "equipo", "team"],
    model: {
      es: "Actualmente trabajo como {role} con foco en entregar resultados medibles. En los últimos años lideré un proyecto que redujo un 30% el tiempo de entrega del equipo y mejoró la satisfacción del cliente de 7,8 a 9,1. Antes de eso construí una base sólida en procesos, colaboración con stakeholders y mejora continua. Me interesa {company} porque su apuesta por el crecimiento conecta con lo que mejor sé hacer: convertir problemas complejos en soluciones simples y medibles. En este rol quiero aportar esa experiencia desde el primer mes.",
      en: "I currently work as a {role} focused on delivering measurable outcomes. Over the last few years I led a project that cut my team's delivery time by 30% and raised customer satisfaction from 7.8 to 9.1. Before that I built a strong foundation in process, stakeholder collaboration and continuous improvement. I'm excited about {company} because its growth focus matches what I do best: turning complex problems into simple, measurable solutions. In this role I want to bring that experience from month one.",
    },
  },
  {
    id: "c2",
    cat: "problemas",
    comp: "Manejo de conflictos, empatía e influencia",
    q: {
      es: "Cuéntame sobre un conflicto con un compañero o stakeholder y cómo lo resolviste.",
      en: "Tell me about a conflict with a coworker or stakeholder and how you resolved it.",
    },
    structure: STAR,
    kw: ["escuch", "listen", "acuerdo", "agreement", "comunic", "empat", "alinea", "align", "reunión", "meeting", "datos", "data", "compromiso", "compromise"],
    model: {
      es: "En mi rol anterior como {role}, el líder de producto quería lanzar una funcionalidad en dos semanas, pero mi equipo estimaba cinco. Mi tarea era evitar un lanzamiento de baja calidad sin romper la relación. Pedí una reunión 1:1, escuché sus motivos (un compromiso con un cliente clave) y llevé datos: riesgos, incidencias de lanzamientos apresurados y una propuesta de alcance reducido. Acordamos entregar un MVP en dos semanas y el resto en la cuarta. Resultado: cumplimos la fecha con cero incidentes críticos, el cliente renovó y desde entonces planificamos juntos cada trimestre.",
      en: "In my previous role as a {role}, the product lead wanted to ship a feature in two weeks while my team estimated five. My task was to avoid a low-quality release without damaging the relationship. I asked for a 1:1, listened to their reasons (a commitment to a key client) and brought data: risks, incidents from rushed releases and a reduced-scope proposal. We agreed on an MVP in two weeks and the rest in week four. Result: we hit the date with zero critical incidents, the client renewed, and we now plan together every quarter.",
    },
  },
  {
    id: "c3",
    cat: "impacto",
    comp: "Orientación a resultados e impacto medible",
    q: {
      es: "Describe el logro profesional del que te sientes más orgulloso/a.",
      en: "Describe the professional achievement you are most proud of.",
    },
    structure: STAR,
    kw: ["lideré", "led", "logr", "achiev", "aument", "increas", "reduj", "reduc", "impacto", "impact", "métrica", "metric", "%", "ahorr", "sav"],
    model: {
      es: "En mi último empleo detecté que el proceso clave del área de {role} dependía de tareas manuales que generaban un 15% de errores. Me propuse reducir esos errores a menos del 3% en un trimestre. Mapeé el proceso con el equipo, prioricé los tres puntos de falla más costosos, implementé una automatización y una checklist de validación, y capacité a 12 personas. En tres meses los errores bajaron al 2%, ahorramos unas 40 horas al mes y la iniciativa se replicó en otras dos áreas.",
      en: "In my last job I noticed the core {role} process relied on manual tasks causing a 15% error rate. I set out to bring errors below 3% within a quarter. I mapped the process with the team, prioritized the three costliest failure points, implemented an automation plus a validation checklist, and trained 12 people. In three months errors dropped to 2%, we saved about 40 hours a month, and the initiative was replicated in two other teams.",
    },
  },
  {
    id: "c4",
    cat: "problemas",
    comp: "Autoconciencia, responsabilidad y aprendizaje",
    q: {
      es: "Háblame de un error o fracaso profesional y qué aprendiste de él.",
      en: "Tell me about a professional mistake or failure and what you learned from it.",
    },
    structure: [...STAR, ["Aprendizaje", "Qué cambiaste en tu forma de trabajar para que no se repita."]],
    kw: ["aprend", "learn", "responsab", "accountab", "error", "mistake", "mejor", "improv", "proceso", "process", "cambi", "chang"],
    model: {
      es: "Al inicio de mi carrera como {role} me comprometí con una fecha de entrega sin validar dependencias con otro equipo. Era responsable de coordinar la entrega y, a una semana del cierre, descubrí que faltaba una integración crítica. Asumí el error ante mi jefe y el cliente, propuse un plan de recuperación con entregas parciales y trabajé con el otro equipo para priorizar la integración. Entregamos con 6 días de retraso pero sin perder al cliente. Aprendí a hacer un mapa de dependencias antes de comprometer fechas; desde entonces mis estimaciones se cumplen en más del 90% de los casos.",
      en: "Early in my career as a {role} I committed to a deadline without validating dependencies with another team. I was responsible for coordinating the delivery and, one week before the deadline, discovered a critical integration was missing. I owned the mistake with my manager and the client, proposed a recovery plan with partial deliveries and worked with the other team to prioritize the integration. We delivered 6 days late but kept the client. I learned to build a dependency map before committing to dates; since then my estimates are met over 90% of the time.",
    },
  },
  {
    id: "c5",
    cat: "comunicacion",
    comp: "Motivación, investigación de la empresa y visión de aporte",
    q: {
      es: "¿Por qué quieres trabajar en {company} y qué aportarías en tus primeros 90 días?",
      en: "Why do you want to work at {company}, and what would you contribute in your first 90 days?",
    },
    structure: [
      ["Investigación", "Algo específico de la empresa: producto, misión, mercado o noticia reciente."],
      ["Conexión", "Cómo tu experiencia resuelve una necesidad concreta de ellos."],
      ["Plan 30-60-90", "Aprender → Contribuir → Liderar una mejora medible."],
    ],
    kw: ["misión", "mission", "producto", "product", "cliente", "customer", "plan", "90", "30", "60", "aport", "contribu", "cultura", "culture", "crecimiento", "growth"],
    model: {
      es: "Me atrae {company} porque está apostando por crecer con foco en el cliente, y eso conecta con mi experiencia como {role}. En los primeros 30 días me enfocaría en entender a los usuarios, los procesos y las métricas del equipo, reuniéndome con los stakeholders clave. Entre el día 30 y 60 entregaría mis primeras contribuciones y detectaría 2-3 oportunidades de mejora rápida. Hacia el día 90 lideraría una de ellas con un objetivo medible, por ejemplo reducir un 20% el tiempo de un proceso crítico, para demostrar impacto desde el primer trimestre.",
      en: "I'm drawn to {company} because it is betting on customer-centric growth, which connects with my experience as a {role}. In my first 30 days I'd focus on understanding users, processes and team metrics, meeting key stakeholders. Between days 30 and 60 I'd ship my first contributions and identify 2-3 quick-win opportunities. By day 90 I'd lead one of them with a measurable goal, for example reducing a critical process time by 20%, to show impact in my first quarter.",
    },
  },
];

const PROFILE_QUESTIONS = {
  tech: [
    {
      id: "t1", cat: "tecnico", comp: "Optimización de rendimiento y pensamiento sistémico",
      q: { es: "Si una aplicación en producción se vuelve lenta, ¿cómo diagnosticas y optimizas su rendimiento?", en: "If a production application becomes slow, how do you diagnose and optimize its performance?" },
      structure: TECH_STRUCT,
      kw: ["profil", "métrica", "metric", "lighthouse", "cache", "caché", "lazy", "bundle", "query", "consulta", "índice", "index", "latencia", "latency", "monitor", "memo", "cdn", "render"],
      model: {
        es: "Primero mido antes de optimizar: reviso las métricas de monitoreo (latencia p95, Core Web Vitals, uso de CPU) y reproduzco el problema con un profiler. En un caso real como {role}, el LCP estaba en 4,2 s; el diagnóstico mostró un bundle de 1,8 MB y consultas sin índice. Apliqué code splitting y lazy loading, añadí caché en el CDN y creé índices en las dos consultas más lentas. Descarté reescribir el módulo porque el costo era alto frente al beneficio. Resultado: el LCP bajó a 1,6 s, la latencia p95 de la API un 60% y la conversión subió un 8%. Dejé alertas para detectar regresiones.",
        en: "I measure before optimizing: I check monitoring metrics (p95 latency, Core Web Vitals, CPU) and reproduce the issue with a profiler. In a real case as a {role}, LCP was 4.2s; diagnosis showed a 1.8 MB bundle and unindexed queries. I applied code splitting and lazy loading, added CDN caching and created indexes on the two slowest queries. I ruled out rewriting the module because the cost outweighed the benefit. Result: LCP dropped to 1.6s, API p95 latency by 60%, and conversion rose 8%. I set alerts to catch regressions.",
      },
    },
    {
      id: "t2", cat: "tecnico", comp: "Diseño de arquitectura y toma de decisiones técnicas",
      q: { es: "Describe un proyecto técnico complejo y las decisiones de arquitectura que tomaste.", en: "Describe a complex technical project and the architecture decisions you made." },
      structure: TECH_STRUCT,
      kw: ["arquitectura", "architecture", "escalab", "scalab", "trade-off", "microservicio", "microservice", "api", "componente", "component", "decisión", "decision", "mantenib", "maintainab", "patrón", "pattern"],
      model: {
        es: "Como {role} participé en migrar un monolito que soportaba 50.000 usuarios diarios y tenía despliegues de 2 horas. Mi responsabilidad era diseñar la nueva capa de frontend y su contrato con las APIs. Propuse una arquitectura modular por dominios con una librería de componentes compartida y un BFF para desacoplar el frontend del backend. Evalué micro-frontends, pero los descarté por la complejidad operativa para un equipo de 6 personas. Resultado: los despliegues pasaron de 2 horas a 10 minutos, los bugs de regresión bajaron un 45% y el onboarding de nuevos devs pasó de 3 semanas a 1.",
        en: "As a {role} I helped migrate a monolith serving 50,000 daily users with 2-hour deployments. I was responsible for designing the new frontend layer and its API contract. I proposed a domain-based modular architecture with a shared component library and a BFF to decouple frontend from backend. I evaluated micro-frontends but discarded them due to operational complexity for a team of 6. Result: deployments went from 2 hours to 10 minutes, regression bugs fell 45% and developer onboarding dropped from 3 weeks to 1.",
      },
    },
    {
      id: "t3", cat: "tecnico", comp: "Calidad de software, testing y buenas prácticas",
      q: { es: "¿Cómo garantizas la calidad del código en tu equipo (testing, code review, CI/CD)?", en: "How do you ensure code quality in your team (testing, code review, CI/CD)?" },
      structure: [
        ["Principios", "Tu filosofía de calidad (prevenir > corregir)."],
        ["Prácticas", "Testing (unit/integración/e2e), code review, linters, CI/CD."],
        ["Ejemplo real", "Un caso donde estas prácticas evitaron o resolvieron un problema."],
        ["Métrica", "Cobertura, bugs en producción, tiempo de review, frecuencia de despliegue."],
      ],
      kw: ["test", "unit", "integraci", "integration", "e2e", "review", "ci", "cd", "pipeline", "cobertura", "coverage", "lint", "estándar", "standard", "automatiz", "automat"],
      model: {
        es: "Mi principio es que la calidad se construye, no se inspecciona al final. En mi equipo como {role} definimos una pirámide de testing: tests unitarios para la lógica, de integración para las APIs y unos pocos e2e para los flujos críticos. Todo pasa por un pipeline de CI con lint, tests y análisis estático antes de que un PR pueda fusionarse, y cada PR necesita una revisión con una checklist. Cuando lo implanté, la cobertura subió del 35% al 80%, los bugs en producción bajaron un 50% y pasamos de desplegar cada dos semanas a varias veces por día.",
        en: "My principle is that quality is built in, not inspected at the end. In my team as a {role} we defined a testing pyramid: unit tests for logic, integration tests for APIs and a few e2e tests for critical flows. Everything goes through a CI pipeline with linting, tests and static analysis before a PR can merge, and every PR needs a review with a checklist. When I introduced it, coverage rose from 35% to 80%, production bugs fell 50% and we moved from deploying every two weeks to several times a day.",
      },
    },
    {
      id: "t4", cat: "problemas", comp: "Gestión de incidentes y resolución bajo presión",
      q: { es: "Cuéntame sobre un bug crítico en producción y cómo lo resolviste.", en: "Tell me about a critical production bug and how you resolved it." },
      structure: STAR,
      kw: ["incidente", "incident", "rollback", "log", "monitor", "causa raíz", "root cause", "hotfix", "postmortem", "comunic", "prioriz", "usuarios", "users"],
      model: {
        es: "Un viernes, como {role}, el checkout empezó a fallar para el 20% de los usuarios tras un despliegue. Me tocaba liderar la respuesta. Primero hice rollback para frenar el impacto en 8 minutos, comuniqué el estado al equipo de soporte y luego analicé logs y trazas: una variable de entorno faltaba en una región. Corregí la configuración, añadí una validación en el pipeline y un test de humo post-despliegue. Recuperamos el 100% de las ventas en menos de 30 minutos y, tras el postmortem, no volvimos a tener incidentes de configuración en 6 meses.",
        en: "One Friday, as a {role}, checkout started failing for 20% of users after a deployment. I had to lead the response. I first rolled back to stop the impact within 8 minutes, informed support, then analyzed logs and traces: an environment variable was missing in one region. I fixed the config, added a pipeline validation and a post-deploy smoke test. We restored 100% of sales in under 30 minutes and, after the postmortem, had no configuration incidents for 6 months.",
      },
    },
  ],
  data: [
    {
      id: "d1", cat: "tecnico", comp: "Calidad de datos y rigor analítico",
      q: { es: "¿Cómo abordas un análisis cuando los datos están incompletos, duplicados o sucios?", en: "How do you approach an analysis when data is incomplete, duplicated or dirty?" },
      structure: TECH_STRUCT,
      kw: ["limpieza", "cleaning", "nulos", "null", "duplicad", "duplicat", "outlier", "valid", "sql", "python", "pandas", "imput", "calidad", "quality", "supuesto", "assumption"],
      model: {
        es: "Primero perfilo los datos: porcentaje de nulos, duplicados, outliers y consistencia entre fuentes. En un proyecto como {role}, el 18% de los registros de ventas tenía campos vacíos y había duplicados por cargas repetidas. Deduplicé con SQL usando claves compuestas, imputé valores solo donde el sesgo era bajo y documenté cada supuesto. También acordé con ingeniería una validación en origen. El análisis final se entregó a tiempo con un intervalo de confianza claro, y la tasa de registros inválidos bajó del 18% al 3% en dos meses.",
        en: "I start by profiling the data: null rates, duplicates, outliers and consistency across sources. In a project as a {role}, 18% of sales records had empty fields and there were duplicates from repeated loads. I deduplicated with SQL using composite keys, imputed values only where bias was low, and documented every assumption. I also agreed with engineering on validation at the source. The final analysis shipped on time with a clear confidence interval, and invalid records dropped from 18% to 3% in two months.",
      },
    },
    {
      id: "d2", cat: "impacto", comp: "Traducción de análisis a decisiones de negocio",
      q: { es: "Describe un análisis tuyo que haya influido en una decisión de negocio importante.", en: "Describe an analysis of yours that influenced an important business decision." },
      structure: STAR,
      kw: ["decisión", "decision", "negocio", "business", "insight", "hallazgo", "finding", "kpi", "ingreso", "revenue", "churn", "segment", "recomend", "recommend", "%"],
      model: {
        es: "Como {role}, el equipo comercial quería aumentar la inversión en un canal que parecía el más rentable. Me pidieron validar la decisión. Construí un análisis de cohortes y atribución multitouch y descubrí que ese canal traía clientes con un churn 2,5 veces mayor. Presenté el hallazgo con un dashboard y una recomendación: redistribuir el 30% del presupuesto hacia el canal de referidos. La dirección aprobó el cambio y en dos trimestres el LTV promedio subió un 22% con el mismo presupuesto.",
        en: "As a {role}, the sales team wanted to increase spend on a channel that looked the most profitable. I was asked to validate that decision. I built a cohort and multi-touch attribution analysis and found that channel brought customers with 2.5x higher churn. I presented the finding with a dashboard and a recommendation: shift 30% of the budget to the referral channel. Leadership approved it and within two quarters average LTV rose 22% with the same budget.",
      },
    },
    {
      id: "d3", cat: "comunicacion", comp: "Storytelling con datos para audiencias no técnicas",
      q: { es: "¿Cómo explicarías un hallazgo técnico complejo a un directivo sin conocimientos técnicos?", en: "How would you explain a complex technical finding to an executive with no technical background?" },
      structure: [
        ["Mensaje clave", "Empieza por la conclusión y su impacto en el negocio."],
        ["Analogía / visual", "Un gráfico simple o una analogía cotidiana."],
        ["Evidencia", "1-2 números que sostienen el mensaje."],
        ["Recomendación", "Qué decisión tomar y qué pasa si no se toma."],
      ],
      kw: ["conclusión", "conclusion", "impacto", "impact", "visual", "gráfico", "chart", "analog", "simple", "recomend", "recommend", "negocio", "business", "historia", "story"],
      model: {
        es: "Empiezo por la conclusión, no por el método. Por ejemplo, como {role} tuve que explicar un modelo de predicción de churn al director general. Le dije: 'Podemos anticipar qué clientes se irán con un mes de antelación, como un parte meteorológico, y eso protege unos 200.000 USD al trimestre'. Usé un único gráfico con tres segmentos de riesgo y evité términos como 'regresión'. Cerré con una recomendación concreta: una campaña de retención para el segmento de alto riesgo. Aprobó el piloto en la misma reunión y el churn de ese segmento bajó un 15%.",
        en: "I lead with the conclusion, not the method. For example, as a {role} I had to explain a churn prediction model to the CEO. I said: 'We can predict which customers will leave a month in advance, like a weather forecast, and that protects about $200,000 per quarter.' I used a single chart with three risk segments and avoided terms like 'regression'. I closed with a concrete recommendation: a retention campaign for the high-risk segment. The pilot was approved in the same meeting and churn in that segment dropped 15%.",
      },
    },
    {
      id: "d4", cat: "tecnico", comp: "Diseño de métricas, KPIs y dashboards",
      q: { es: "¿Cómo diseñarías los KPIs y el dashboard para medir el éxito de un nuevo producto en {company}?", en: "How would you design the KPIs and dashboard to measure the success of a new product at {company}?" },
      structure: TECH_STRUCT,
      kw: ["kpi", "north star", "métrica", "metric", "retención", "retention", "conversión", "conversion", "funnel", "embudo", "dashboard", "segment", "objetivo", "goal", "okr", "cohort"],
      model: {
        es: "Partiría del objetivo de negocio y definiría una North Star Metric, por ejemplo usuarios activos semanales que completan la acción clave. Debajo, métricas del embudo (adquisición, activación, retención a 30 días, conversión a pago) y métricas de salud como tiempo de carga o tickets de soporte. Como {role}, diseñaría el dashboard en tres niveles: ejecutivo (3-4 KPIs con tendencia), táctico (embudo por segmento) y diagnóstico (cohortes). En un caso similar, este enfoque redujo de 5 a 1 día el tiempo para detectar caídas de activación y ayudó a subir la retención un 12%.",
        en: "I'd start from the business goal and define a North Star Metric, for example weekly active users completing the key action. Below it, funnel metrics (acquisition, activation, 30-day retention, paid conversion) and health metrics like load time or support tickets. As a {role}, I'd design the dashboard in three levels: executive (3-4 KPIs with trends), tactical (funnel by segment) and diagnostic (cohorts). In a similar case, this approach cut the time to detect activation drops from 5 days to 1 and helped raise retention by 12%.",
      },
    },
  ],
  sales: [
    {
      id: "s1", cat: "problemas", comp: "Manejo de objeciones y negociación",
      q: { es: "Un cliente te dice: 'Su solución es demasiado cara'. ¿Cómo manejas esa objeción?", en: "A client tells you: 'Your solution is too expensive.' How do you handle that objection?" },
      structure: [
        ["Escuchar", "Valida la objeción y haz preguntas para entender el fondo."],
        ["Reencuadrar", "Pasa de precio a valor / ROI con datos del cliente."],
        ["Evidencia", "Caso de éxito o cifra comparable."],
        ["Cierre", "Propón un siguiente paso concreto (piloto, plan, opciones)."],
      ],
      kw: ["escuch", "listen", "valor", "value", "roi", "pregunt", "question", "necesidad", "need", "caso", "case", "ahorr", "sav", "cierre", "close", "piloto", "pilot", "descuento", "discount"],
      model: {
        es: "Primero valido la objeción sin ponerme a la defensiva: 'Entiendo, es una inversión importante. ¿Con qué lo estás comparando?'. Con sus respuestas reencuadro hacia el valor: si su equipo pierde 20 horas semanales en tareas manuales, nuestra solución se paga en 4 meses. Como {role}, uso un caso de éxito de su mismo sector con cifras reales y propongo un siguiente paso concreto, como un piloto de 30 días con métricas de éxito acordadas. Con este enfoque subí mi tasa de cierre tras objeción de precio del 18% al 35% sin dar descuentos agresivos.",
        en: "First I validate the objection without getting defensive: 'I understand, it's a significant investment. What are you comparing it to?' Using their answers, I reframe toward value: if their team loses 20 hours a week on manual tasks, our solution pays for itself in 4 months. As a {role}, I use a success story from their industry with real numbers and propose a concrete next step, like a 30-day pilot with agreed success metrics. With this approach I raised my close rate after price objections from 18% to 35% without aggressive discounts.",
      },
    },
    {
      id: "s2", cat: "tecnico", comp: "Metodología de prospección y gestión del pipeline",
      q: { es: "Describe tu proceso de prospección y cómo construyes y mantienes tu pipeline.", en: "Describe your prospecting process and how you build and maintain your pipeline." },
      structure: [
        ["ICP", "Cliente ideal y criterios de calificación (BANT, MEDDIC...)."],
        ["Cadencia", "Canales, frecuencia y personalización del contacto."],
        ["Herramientas", "CRM, métricas de seguimiento y forecast."],
        ["Resultados", "Conversión por etapa, tamaño de pipeline, cuota."],
      ],
      kw: ["icp", "crm", "pipeline", "cadencia", "cadence", "bant", "meddic", "calific", "qualif", "linkedin", "llamada", "call", "conversión", "conversion", "forecast", "cuota", "quota"],
      model: {
        es: "Empiezo definiendo mi ICP con datos de los clientes más rentables y califico con BANT. Como {role}, trabajo una cadencia de 12 días que combina email personalizado, LinkedIn y llamadas, y bloqueo 2 horas diarias solo para prospectar. Todo queda en el CRM con próximos pasos y fechas, y reviso cada semana la conversión por etapa para detectar cuellos de botella. Mantengo un pipeline de 3 veces mi cuota. Con este sistema pasé de un 4% a un 9% de conversión de lead a reunión y cerré el año al 118% de cuota.",
        en: "I start by defining my ICP using data from the most profitable customers and qualify with BANT. As a {role}, I run a 12-day cadence combining personalized email, LinkedIn and calls, and block 2 hours a day just for prospecting. Everything lives in the CRM with next steps and dates, and I review stage conversion weekly to spot bottlenecks. I keep a pipeline at 3x quota. With this system I went from 4% to 9% lead-to-meeting conversion and closed the year at 118% of quota.",
      },
    },
    {
      id: "s3", cat: "impacto", comp: "Capacidad de cierre en ventas complejas",
      q: { es: "Cuéntame sobre la venta más difícil que hayas cerrado.", en: "Tell me about the toughest deal you have ever closed." },
      structure: STAR,
      kw: ["cierre", "close", "decisor", "decision maker", "stakeholder", "negoci", "propuesta", "proposal", "contrato", "contract", "ingreso", "revenue", "competidor", "competitor", "ciclo", "cycle"],
      model: {
        es: "Como {role}, perseguí durante 7 meses a una cuenta enterprise que usaba a nuestro principal competidor. Mi objetivo era entrar con un contrato anual. Mapeé a los 6 stakeholders, identifiqué que el director financiero era el verdadero decisor y construí un caso de ROI con su propio equipo de operaciones. Organicé un piloto en un área y, con los resultados, presenté una propuesta escalonada. Cerramos un contrato de 240.000 USD anuales, el mayor de mi región ese año, y la cuenta se expandió un 40% al año siguiente.",
        en: "As a {role}, I pursued an enterprise account using our main competitor for 7 months. My goal was to land an annual contract. I mapped the 6 stakeholders, identified the CFO as the real decision maker and built an ROI case with their own operations team. I set up a pilot in one department and, with the results, presented a phased proposal. We closed a $240,000 annual contract, the largest in my region that year, and the account expanded 40% the following year.",
      },
    },
    {
      id: "s4", cat: "problemas", comp: "Resiliencia y planificación bajo presión de cuota",
      q: { es: "¿Qué haces cuando a mitad de trimestre estás muy por debajo de tu cuota?", en: "What do you do when you are well below quota halfway through the quarter?" },
      structure: STAR,
      kw: ["cuota", "quota", "pipeline", "prioriz", "prioritiz", "plan", "forecast", "oportunidad", "opportunit", "acelera", "accelerat", "upsell", "análisis", "analysis", "gerente", "manager"],
      model: {
        es: "Me pasó como {role}: a mitad de trimestre estaba al 38% de la cuota. Mi tarea era recuperar sin sacrificar margen. Analicé el pipeline y clasifiqué las oportunidades por probabilidad y tamaño, concentré el 70% de mi tiempo en las 8 con mayor probabilidad, activé upsell en clientes actuales y pedí apoyo a mi gerente para acelerar dos aprobaciones legales. También aumenté la prospección diaria. Cerré el trimestre al 104% de la cuota y convertí ese plan en una rutina de revisión quincenal.",
        en: "It happened to me as a {role}: halfway through the quarter I was at 38% of quota. My task was to recover without sacrificing margin. I analyzed the pipeline and ranked opportunities by probability and size, focused 70% of my time on the top 8, triggered upsells with current customers and asked my manager to help speed up two legal approvals. I also increased daily prospecting. I closed the quarter at 104% of quota and turned that plan into a biweekly review routine.",
      },
    },
  ],
  general: [
    {
      id: "g1", cat: "problemas", comp: "Priorización y gestión del tiempo",
      q: { es: "¿Cómo priorizas cuando tienes varias tareas urgentes al mismo tiempo?", en: "How do you prioritize when you have several urgent tasks at the same time?" },
      structure: STAR,
      kw: ["prioriz", "prioritiz", "urgente", "urgent", "importante", "important", "eisenhower", "impacto", "impact", "plazo", "deadline", "comunic", "deleg", "planific", "plan"],
      model: {
        es: "Uso una matriz de impacto y urgencia y comunico los trade-offs. Por ejemplo, como {role}, en una misma semana tuve un cierre de reporte para dirección, una auditoría y una incidencia con un cliente. Evalué el impacto de cada una, negocié con mi jefe mover la fecha interna del reporte dos días, delegué la preparación de evidencias de auditoría a un compañero y atendí primero al cliente. Entregamos las tres cosas sin incumplir ningún plazo externo y el cliente aumentó su contrato un 10% ese trimestre.",
        en: "I use an impact-urgency matrix and communicate trade-offs. For example, as a {role}, in a single week I had a leadership report, an audit and a client issue. I assessed each one's impact, negotiated with my manager to move the internal report date by two days, delegated audit evidence prep to a colleague and handled the client first. We delivered all three without missing any external deadline, and the client grew their contract by 10% that quarter.",
      },
    },
    {
      id: "g2", cat: "impacto", comp: "Mejora continua y optimización de procesos",
      q: { es: "Describe un proceso que hayas mejorado significativamente.", en: "Describe a process you significantly improved." },
      structure: STAR,
      kw: ["proceso", "process", "mejora", "improv", "eficien", "efficien", "automatiz", "automat", "tiempo", "time", "costo", "cost", "ahorr", "sav", "estandar", "standard", "%"],
      model: {
        es: "Como {role}, el proceso de aprobación de solicitudes tardaba 9 días y generaba quejas constantes. Me propuse reducirlo a menos de 3 días. Medí cada etapa, descubrí que el 60% del tiempo se perdía esperando firmas por correo, e implementé un flujo digital con aprobaciones paralelas y recordatorios automáticos, capacitando a los 4 equipos involucrados. En dos meses el tiempo bajó a 2,5 días, las quejas cayeron un 70% y liberamos unas 25 horas mensuales del equipo.",
        en: "As a {role}, our request approval process took 9 days and generated constant complaints. I set out to bring it under 3 days. I measured each stage, found 60% of the time was lost waiting for email signatures, and implemented a digital workflow with parallel approvals and automatic reminders, training the 4 teams involved. Within two months the time fell to 2.5 days, complaints dropped 70% and we freed about 25 team hours per month.",
      },
    },
    {
      id: "g3", cat: "comunicacion", comp: "Liderazgo e influencia sin autoridad formal",
      q: { es: "Cuéntame sobre una vez en la que lideraste o influiste en otros sin tener autoridad formal.", en: "Tell me about a time you led or influenced others without formal authority." },
      structure: STAR,
      kw: ["influ", "lider", "lead", "convenc", "persuad", "alinea", "align", "stakeholder", "confianza", "trust", "datos", "data", "visión", "vision", "colabor"],
      model: {
        es: "Como {role}, noté que tres áreas usaban versiones distintas de los mismos datos de clientes, lo que causaba errores en las campañas. No tenía autoridad sobre esos equipos, pero quería unificar la fuente. Preparé un análisis con el costo de los errores (unos 15.000 USD al trimestre), me reuní con cada líder para entender sus necesidades y propuse un piloto pequeño con quien estaba más abierto. Con el éxito del piloto, los otros dos equipos se sumaron. En cuatro meses teníamos una única fuente de datos y los errores de campaña bajaron un 80%.",
        en: "As a {role}, I noticed three teams used different versions of the same customer data, causing campaign errors. I had no authority over those teams but wanted to unify the source. I prepared an analysis of the cost of errors (about $15,000 per quarter), met each leader to understand their needs and proposed a small pilot with the most open one. After the pilot succeeded, the other two teams joined. Within four months we had a single data source and campaign errors dropped 80%.",
      },
    },
    {
      id: "g4", cat: "tecnico", comp: "Dominio de las competencias clave del puesto",
      q: { es: "¿Cuál es la habilidad técnica más importante para un {role} y cómo la has demostrado?", en: "What is the most important hard skill for a {role}, and how have you demonstrated it?" },
      structure: [
        ["Habilidad", "Nombra la habilidad y por qué es crítica para el puesto."],
        ["Evidencia", "Un proyecto concreto donde la aplicaste."],
        ["Profundidad", "Herramientas, métodos o certificaciones que la respaldan."],
        ["Resultado", "El impacto medible que generó."],
      ],
      kw: ["habilidad", "skill", "herramienta", "tool", "método", "method", "certific", "proyecto", "project", "aplic", "appl", "resultado", "result", "actualiz", "curso", "course"],
      model: {
        es: "Para un {role}, la habilidad más crítica es convertir información compleja en decisiones accionables. La demostré al liderar la reorganización del reporte mensual de mi área: usé herramientas de análisis y visualización, entrevisté a los usuarios del reporte y reduje 40 indicadores a 8 realmente útiles. Me formo continuamente con cursos y certificaciones del sector. Resultado: el tiempo de preparación bajó de 3 días a 4 horas y la dirección empezó a usarlo en su comité semanal.",
        en: "For a {role}, the most critical skill is turning complex information into actionable decisions. I demonstrated it by leading the redesign of my area's monthly report: I used analysis and visualization tools, interviewed report users and reduced 40 indicators to 8 truly useful ones. I keep learning through industry courses and certifications. Result: prep time dropped from 3 days to 4 hours and leadership began using it in their weekly committee.",
      },
    },
  ],
};

/* =========================================================================
   UTILIDADES
   ========================================================================= */

const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const normalize = (s) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
const fill = (t, cfg) =>
  (t || "").replaceAll("{role}", cfg.role || "el puesto").replaceAll("{company}", cfg.company || "la empresa");
const fmtTime = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function detectProfile(role) {
  const r = normalize(role);
  if (/(develop|desarroll|program|software|frontend|front-end|backend|back-end|full ?stack|ingenier|engineer|devops|qa|mobile|web|tech lead|arquitect)/.test(r)) return "tech";
  if (/(dato|data|analist|analyst|bi\b|business intelligence|scien|cientific|machine learning|estadist|insight)/.test(r)) return "data";
  if (/(venta|sales|comercial|account|ejecutivo de cuenta|business develop|sdr|bdr|kam|preventa)/.test(r)) return "sales";
  return "general";
}

const STOPWORDS = new Set(normalize(
  "para como con los las del que una por sus este esta son será sera desde entre sobre más mas años experiencia trabajo empresa buscamos requisitos responsabilidades deseable conocimiento conocimientos manejo nuestro nuestra equipo cargo puesto será tendrás tendras ofrecemos the and for with you our are will your have this that from who work team role years experience strong ability skills required requirements responsibilities about into their they also must plus"
).split(" "));

function extractJDKeywords(jd) {
  const words = normalize(jd).match(/[a-z0-9+#.]{4,}/g) || [];
  const freq = {};
  words.forEach((w) => {
    const clean = w.replace(/\.+$/, "");
    if (clean.length < 4 || STOPWORDS.has(clean) || /^\d+$/.test(clean)) return;
    freq[clean] = (freq[clean] || 0) + 1;
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w]) => w);
}

function buildOfflineQuestions(cfg) {
  const profile = detectProfile(cfg.role);
  const jdKw = extractJDKeywords(cfg.jd);
  const scoreQ = (q) => q.kw.reduce((acc, k) => acc + (jdKw.some((j) => j.includes(normalize(k)) || normalize(k).includes(j)) ? 1 : 0), 0) + Math.random();
  const specific = [...PROFILE_QUESTIONS[profile]].sort((a, b) => scoreQ(b) - scoreQ(a)).slice(0, 3);
  const opener = COMMON_QUESTIONS[0];
  const others = shuffle(COMMON_QUESTIONS.slice(1)).slice(0, 2);
  const ordered = [opener, specific[0], others[0], specific[1], others[1], specific[2]];
  return ordered.map((q) => ({
    id: q.id,
    category: q.cat,
    competency: q.comp,
    question: fill(q.q[cfg.language === "Inglés" ? "en" : "es"], cfg),
    structure: q.structure.map(([label, hint]) => ({ label, hint })),
    keywords: [...new Set(q.kw.filter((k) => k.length > 2 && !/^\d+$/.test(k)).slice(0, 8))],
    rawKeywords: q.kw,
    modelAnswer: fill(q.model[cfg.language === "Inglés" ? "en" : "es"], cfg),
  }));
}

/* ---------- Motor de evaluación offline (STAR + métricas + keywords + longitud) ---------- */

const STAR_PATTERNS = {
  situacion: /\b(cuando|en mi (anterior|ultimo|último|actual)|en (un|una|el|la) (proyecto|empresa|equipo|rol|trabajo)|situacion|contexto|trabajaba|hace \d|el ano pasado|when|at my (previous|last|current)|in my (previous|last|current)|situation|context|i was working|last year|once)\b/,
  tarea: /\b(mi (objetivo|tarea|responsabilidad|meta|reto|rol)|era responsable|debia|tenia que|me pidieron|me encargaron|el reto|el desafio|el objetivo|me propuse|my (goal|task|responsibility|role|challenge)|i was (responsible|asked|tasked)|i had to|the goal|the challenge|i set out)\b/,
  accion: /\b(implemente|desarrolle|lidere|decidi|propuse|cree|disene|organice|analice|negocie|automatice|construi|coordine|priorice|capacite|presente|hice|aplique|mapee|medi|introduje|escuche|i (implemented|developed|led|decided|proposed|created|designed|organized|analyzed|negotiated|automated|built|coordinated|prioritized|trained|presented|applied|mapped|measured|introduced|listened|did))\b/,
  resultado: /\b(resultado|logramos|logre|consegui|aumento|aumente|reduj|bajo|bajaron|subio|mejoro|ahorr|cerramos|cerre|gracias a|como consecuencia|aprendi|result|we achieved|i achieved|increased|reduced|decreased|improved|saved|grew|closed|as a result|i learned|outcome)\w*/,
};

const METRIC_RE = /(\d+([.,]\d+)?\s?(%|por ?ciento|percent|x\b|k\b|mil|millon|million|usd|eur|\$|€|horas|hours|dias|days|semanas|weeks|meses|months|minutos|minutes|segundos|seconds|s\b|ms\b|usuarios|users|clientes|customers|personas|people|puntos|points))|(\$|€)\s?\d+/g;
const FILLERS_RE = /\b(eh+|em+|este|o sea|pues nada|bueno bueno|um+|uh+|like|basically|you know|kind of)\b/g;
const FIRST_PERSON_RE = /\b(yo|mi|me|i|my)\b/g;

function evaluateOffline({ question, answer, cfg, mode }) {
  const text = answer.trim();
  const norm = normalize(text);
  const wc = countWords(text);
  const senior = cfg.level === "Senior" || cfg.level === "Directivo";
  const idealMin = senior ? 90 : 65;

  const starFound = Object.fromEntries(Object.entries(STAR_PATTERNS).map(([k, re]) => [k, re.test(norm)]));
  const starCount = Object.values(starFound).filter(Boolean).length;
  const metrics = (norm.match(METRIC_RE) || []).length;
  const fillers = (norm.match(FILLERS_RE) || []).length;
  const firstPerson = (norm.match(FIRST_PERSON_RE) || []).length;
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const avgSentence = sentences.length ? wc / sentences.length : wc;

  const kwSource = question.rawKeywords || question.keywords || [];
  const kwHits = kwSource.filter((k) => norm.includes(normalize(k))).length;
  const jdKw = extractJDKeywords(cfg.jd);
  const jdHits = jdKw.filter((k) => norm.includes(k)).length;
  const roleWords = normalize(cfg.role).split(/\s+/).filter((w) => w.length > 3);
  const mentionsRole = roleWords.some((w) => norm.includes(w)) || norm.includes(normalize(cfg.company || "zzzz"));

  let lengthScore;
  if (wc < 15) lengthScore = 15;
  else if (wc < idealMin) lengthScore = 15 + ((wc - 15) / (idealMin - 15)) * 75;
  else if (wc <= 320) lengthScore = 100;
  else lengthScore = clamp(100 - (wc - 320) * 0.25, 60, 100);

  const sentenceScore = avgSentence >= 8 && avgSentence <= 30 ? 100 : avgSentence < 8 ? 60 : 55;
  const claridad = clamp(Math.round(lengthScore * 0.6 + sentenceScore * 0.4 - fillers * 6));
  const estructura = clamp(Math.round(12 + starCount * 22 + (sentences.length >= 4 ? 0 : -8)));
  const impacto = clamp(Math.round(
    (metrics === 0 ? 22 : metrics === 1 ? 68 : metrics === 2 ? 84 : 95) +
      (starFound.resultado ? 8 : 0) + (starFound.accion ? 4 : 0)
  ));
  const relevancia = clamp(Math.round(28 + Math.min(45, kwHits * 13) + Math.min(20, jdHits * 5) + (mentionsRole ? 7 : 0) + (firstPerson > 1 ? 5 : 0)));

  let score = claridad * 0.22 + impacto * 0.26 + estructura * 0.3 + relevancia * 0.22;
  if (wc < 20) score = Math.min(score, 35);
  else if (wc < 35) score = Math.min(score, 58);
  score *= 0.97;
  if (mode === "agent") score *= 0.94;
  score = Math.round(clamp(score));

  const checklist = { claridad: Math.min(claridad, 98), impacto: Math.min(impacto, 97), estructura: Math.min(estructura, 98), relevancia: Math.min(relevancia, 96) };
  const en = cfg.language === "Inglés";
  const strengths = [];
  const improvements = [];
  const missing = [];

  if (wc >= idealMin) strengths.push(`Respuesta con buen desarrollo (${wc} palabras): das suficiente contexto.`);
  if (starCount >= 3) strengths.push(`Estructura sólida: identificamos ${starCount}/4 bloques STAR.`);
  if (metrics >= 1) strengths.push(`Incluyes ${metrics} dato(s) cuantificable(s): eso transmite impacto real.`);
  if (kwHits >= 3) strengths.push("Usas vocabulario clave de la competencia evaluada.");
  if (jdHits >= 2) strengths.push("Conectas tu respuesta con requisitos de la vacante.");
  if (starFound.accion && firstPerson > 1) strengths.push("Hablas en primera persona y dejas claro tu rol en la acción.");
  if (fillers === 0 && wc > 30) strengths.push("Lenguaje limpio, sin muletillas.");

  if (wc < idealMin) {
    improvements.push(`Amplía tu respuesta: tienes ${wc} palabras; apunta a ${idealMin}-250 para nivel ${cfg.level}.`);
    missing.push(`Más desarrollo (mín. ~${idealMin} palabras)`);
  }
  if (!starFound.situacion) { improvements.push("Abre con la Situación: dónde estabas, cuándo y qué estaba en juego."); missing.push("Contexto / Situación"); }
  if (!starFound.tarea) { improvements.push("Explicita tu Tarea u objetivo: 'Mi responsabilidad era…'."); missing.push("Tu objetivo / Tarea"); }
  if (!starFound.accion) { improvements.push("Describe tus Acciones con verbos en primera persona: implementé, lideré, analicé…"); missing.push("Acciones concretas en primera persona"); }
  if (!starFound.resultado) { improvements.push("Cierra con el Resultado: ¿qué cambió gracias a ti?"); missing.push("Resultado final"); }
  if (metrics === 0) { improvements.push("Cuantifica el impacto: %, tiempo ahorrado, dinero, usuarios o clientes."); missing.push("Al menos 1-2 métricas"); }
  if (kwHits < 2) {
    const sug = (question.keywords || []).slice(0, 4).join(", ");
    improvements.push(`Integra conceptos de la competencia${sug ? ` (ej.: ${sug})` : ""}.`);
    missing.push("Palabras clave de la competencia");
  }
  if (fillers > 1) improvements.push(`Reduce muletillas (detectamos ${fillers}).`);
  if (avgSentence > 30) improvements.push("Usa frases más cortas: tus oraciones son muy largas y pierden claridad.");
  if (!strengths.length) strengths.push("Diste un primer intento: ahora toca construir sobre él.");
  if (!improvements.length) improvements.push("Para llegar al Top 1%, añade el aprendizaje o cómo escalaste el resultado.");

  let followUp = "";
  if (wc < 40) followUp = en ? "That's quite brief. Could you walk me through a specific example in more detail?" : "Es una respuesta bastante breve. ¿Podrías contarme un ejemplo concreto con más detalle?";
  else if (!starFound.accion) followUp = en ? "What exactly did YOU do, step by step?" : "¿Qué hiciste tú específicamente, paso a paso?";
  else if (metrics === 0) followUp = en ? "How would you quantify the result? What numbers show the impact?" : "¿Cómo cuantificarías el resultado? ¿Qué cifras demuestran el impacto?";
  else if (!starFound.resultado) followUp = en ? "And what was the final outcome?" : "¿Y cuál fue el resultado final?";

  return { score, checklist, strengths: strengths.slice(0, 4), improvements: improvements.slice(0, 4), missing, followUp, modelAnswer: question.modelAnswer, wordCount: wc, source: "local" };
}

/* ---------- Motor IA (Anthropic /v1/messages) ---------- */

function extractJSON(text) {
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const start = firstArr !== -1 && (firstArr < firstObj || firstObj === -1) ? firstArr : firstObj;
  const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (start === -1 || end === -1) throw new Error("La IA no devolvió JSON válido");
  return JSON.parse(text.slice(start, end + 1));
}

const DEFAULT_MODEL = "claude-sonnet-4-20250514";
const AI_TIMEOUT_MS = 45000;

async function callLLM(api, system, user, maxTokens = 3000) {
  const headers = { "Content-Type": "application/json" };
  if (api.key) {
    headers["x-api-key"] = api.key;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), AI_TIMEOUT_MS) : null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      signal: controller?.signal,
      body: JSON.stringify({
        model: api.model || DEFAULT_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: `${system}\n\n${user}` }],
      }),
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 160)}`);
    const data = await res.json();
    if (data.stop_reason === "refusal") throw new Error("El modelo declinó la solicitud");
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    if (!text) throw new Error("Respuesta vacía de la IA");
    return text;
  } catch (err) {
    if (err.name === "AbortError") throw new Error("Tiempo de espera agotado");
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function pingAI(api) {
  const out = await callLLM(api, "Responde únicamente con la palabra OK.", "Prueba de conexión.", 10);
  return /ok/i.test(out);
}

async function askSupportAI(api, { cfg, question, draft, lastEval, history, message }) {
  const system = `Eres el Soporte IA de EDIA Interview Copilot: un coach de entrevistas experto, cercano y muy concreto. Respondes en español (si te piden un ejemplo de respuesta, escríbelo en ${cfg.language}). Usa párrafos cortos y viñetas cuando ayuden. Máximo 220 palabras. No inventes datos del candidato: usa marcadores como [tu métrica] cuando falte información. Responde solo con el texto para el candidato.`;
  const convo = history.slice(-6).map((m) => `${m.role === "user" ? "Candidato" : "Soporte EDIA"}: ${m.text}`).join("\n");
  const user = `CONTEXTO DE LA ENTREVISTA
- Puesto: ${cfg.role} | Empresa/Industria: ${cfg.company || "-"} | Nivel: ${cfg.level} | Idioma: ${cfg.language}
- Modo: ${cfg.mode === "agent" ? "Agente Evaluador (simulación real)" : "Copiloto guiado"}
- Vacante/CV: ${cfg.jd || "no proporcionado"}
- Pregunta actual del entrevistador: ${question.question}
- Competencia evaluada: ${question.competency}
- Estructura sugerida: ${question.structure.map((s) => s.label).join(" → ")}
- Borrador actual del candidato: ${draft ? `"""${draft}"""` : "(vacío)"}
- Última evaluación: ${lastEval ? `${lastEval.score}/100. Pendiente: ${(lastEval.missing || lastEval.improvements || []).join("; ")}` : "sin evaluar aún"}

CONVERSACIÓN PREVIA CON EL SOPORTE
${convo || "(ninguna)"}

MENSAJE DEL CANDIDATO
${message}`;
  return callLLM(api, system, user, 1200);
}

/* ---------- Motor local de Soporte (respaldo sin red) ---------- */

const CATEGORY_TIPS = {
  comunicacion: "El reclutador mide si comunicas con claridad, foco y seguridad. Abre con la conclusión y conecta todo con el puesto.",
  tecnico: "El reclutador busca profundidad real: herramientas, métodos, decisiones y trade-offs, no solo definiciones.",
  problemas: "El reclutador evalúa cómo piensas bajo presión: diagnóstico, opciones que consideraste, la decisión y lo que aprendiste.",
  impacto: "El reclutador quiere evidencia de resultados: cifras concretas y tu contribución personal al logro.",
};

function localSupport({ kind, message, cfg, question, draft, lastEval }) {
  const role = cfg.role || "el puesto";
  if (kind === "example") {
    return `Aquí tienes un ejemplo adaptado a un perfil ${cfg.level} de ${role}${cfg.company ? ` para ${cfg.company}` : ""}:\n\n"${question.modelAnswer}"\n\n👉 Reemplaza las cifras y el contexto por tu experiencia real: un reclutador detecta enseguida una historia inventada.`;
  }
  if (kind === "recruiter") {
    return `🎯 Competencia evaluada: ${question.competency}.\n\n${CATEGORY_TIPS[question.category] || CATEGORY_TIPS.comunicacion}\n\nEstructura que más puntúa:\n${question.structure.map((s, i) => `${i + 1}. ${s.label}: ${s.hint}`).join("\n")}\n\nConceptos que suman puntos: ${question.keywords.slice(0, 6).join(", ")}.`;
  }
  if (kind === "improve") {
    if (!draft.trim()) return "Primero escribe un borrador en la caja de respuesta del entrevistador (aunque sea en 2-3 frases) y vuelve a pulsar \"Mejorar mi borrador\". Lo analizaré y te propondré una versión más sólida.";
    const ev = evaluateOffline({ question, answer: draft, cfg, mode: cfg.mode });
    const firstSentence = draft.trim().split(/(?<=[.!?])\s+/)[0].replace(/[.!?]+$/, "");
    const lower = firstSentence.charAt(0).toLowerCase() + firstSentence.slice(1);
    const improved = cfg.language === "Inglés"
      ? `In my role as ${role} at [company/project], ${lower}. My goal was to [specific, measurable objective]. To achieve it, I [action 1], [action 2] and [action 3]. As a result, [metric: %, time, money or users], and I learned [key lesson].`
      : `En mi rol como ${role} en [empresa/proyecto], ${lower}. Mi objetivo era [objetivo concreto y medible]. Para lograrlo, [acción 1 en primera persona], [acción 2] y [acción 3]. Como resultado, [métrica: %, tiempo, dinero o usuarios] y aprendí [aprendizaje clave].`;
    return `📊 Estimación de tu borrador: ${ev.score}/100 (${ev.wordCount} palabras).\n\n${ev.missing.length ? `Lo que falta:\n${ev.missing.slice(0, 4).map((m) => `• ${m}`).join("\n")}` : "Tu borrador ya cubre lo esencial. Pule el cierre con un aprendizaje."}\n\n✍️ Versión mejorada (completa los corchetes con tus datos):\n"${improved}"`;
  }
  const m = normalize(message);
  if (/(no tengo experiencia|sin experiencia|poca experiencia|nunca he|no he trabajado|lack experience|no experience)/.test(m)) {
    return `Es muy común y tiene solución. Usa la fórmula Puente:\n1. Reconoce con honestidad: "No lo he hecho en un entorno laboral…"\n2. Transfiere: "…pero en [proyecto académico/personal/voluntariado] hice algo equivalente: [acción]".\n3. Demuestra aprendizaje: "Aprendí [herramienta/concepto] en [tiempo] y obtuve [resultado]".\n4. Proyecta: "En ${cfg.company || "este rol"} lo aplicaría en [ejemplo concreto]".\n\nNunca digas solo "no tengo experiencia": termina siempre con evidencia de que aprendes rápido.`;
  }
  if (/(nervio|ansiedad|miedo|bloque|me quedo en blanco|nervous|anxious)/.test(m)) {
    return "Para controlar los nervios:\n• Pide unos segundos: \"Buena pregunta, déjame pensarlo un momento\" es totalmente profesional.\n• Ancla tu respuesta en la estructura (Situación → Tarea → Acción → Resultado): te da un mapa aunque te quedes en blanco.\n• Respira en 4-4-4 antes de contestar.\n• Practica aquí en voz alta con el micrófono: la repetición reduce la ansiedad.";
  }
  if (/(salario|sueldo|pretension|remuneracion|salary|compensation)/.test(m)) {
    return `Sobre la pretensión salarial:\n• Investiga el rango de mercado para ${role} nivel ${cfg.level}.\n• Da un rango, no una cifra: "Según mi investigación y experiencia, busco entre [X] y [Y]".\n• Si es muy pronto, devuelve la pregunta con cortesía: "Me gustaría entender mejor el alcance del rol; ¿qué rango tienen previsto?".\n• Habla del paquete total (beneficios, formación, flexibilidad).`;
  }
  if (/(debilidad|defecto|punto debil|weakness)/.test(m)) {
    return "Para la pregunta de debilidades:\n1. Elige una debilidad real pero no crítica para el puesto.\n2. Muestra conciencia: cómo la detectaste.\n3. Explica el plan concreto que aplicas para mejorarla.\n4. Cierra con evidencia de progreso (\"desde entonces…\").\nEvita clichés como \"soy demasiado perfeccionista\".";
  }
  if (/(pregunta.*(final|reclutador|yo)|que pregunto|questions to ask)/.test(m)) {
    return `Buenas preguntas para cerrar la entrevista:\n• "¿Cómo se medirá el éxito en este rol en los primeros 90 días?"\n• "¿Cuál es el mayor reto del equipo ahora mismo?"\n• "¿Cómo es un día típico de un ${role} aquí?"\n• "¿Cuáles son los siguientes pasos del proceso?"`;
  }
  if (/(metrica|numero|cifra|cuantific|no tengo datos|metric|numbers)/.test(m)) {
    return "Si no tienes cifras exactas, usa aproximaciones honestas:\n• Tiempo: \"reduje de ~3 días a 1\".\n• Escala: \"para un equipo de 8 personas / 200 clientes\".\n• Comparación: \"el doble de rápido\", \"la mitad de errores\".\n• Feedback: \"la satisfacción del cliente subió de 7 a 9\".\nUn número aproximado y razonable siempre es mejor que ninguno.";
  }
  if (/(star|estructura|como respondo|como empiezo|structure)/.test(m)) {
    return `Para esta pregunta usa:\n${question.structure.map((s, i) => `${i + 1}. ${s.label}: ${s.hint}`).join("\n")}\n\nDistribución ideal: 15% contexto, 10% objetivo, 50% acciones, 25% resultado.`;
  }
  return `Te ayudo con la pregunta actual: "${question.question}"\n\n${CATEGORY_TIPS[question.category] || CATEGORY_TIPS.comunicacion}\n\nPasos sugeridos:\n${question.structure.map((s, i) => `${i + 1}. ${s.label}`).join(" → ")}\n\n${lastEval && lastEval.score < PASS_SCORE ? `Para aprobar te falta: ${(lastEval.missing.length ? lastEval.missing : lastEval.improvements).slice(0, 3).join("; ")}.` : "Usa los botones rápidos para pedirme un ejemplo con tu perfil o que mejore tu borrador."}\n\n(Respuesta del Motor de Respaldo Local: conecta la IA para respuestas totalmente personalizadas.)`;
}

async function generateQuestionsAI(api, cfg) {
  const system = "Eres EDIA, un reclutador senior y coach experto en entrevistas laborales. Respondes SOLO con JSON válido, sin texto adicional.";
  const user = `Genera exactamente ${TOTAL_QUESTIONS} preguntas de entrevista para:
- Puesto: ${cfg.role}
- Empresa/Industria: ${cfg.company || "no especificada"}
- Nivel: ${cfg.level}
- Idioma de las preguntas y respuestas modelo: ${cfg.language}
- Vacante / CV: ${cfg.jd || "no proporcionado"}

Mezcla preguntas conductuales (STAR) y técnicas del puesto. Devuelve un objeto JSON:
{"questions":[{"question":"...","competency":"competencia evaluada (en español)","category":"comunicacion|tecnico|problemas|impacto","structure":[{"label":"Situación","hint":"..."}],"keywords":["5-8 conceptos clave"],"modelAnswer":"respuesta ideal Top 1% de 120-170 palabras en ${cfg.language}, en primera persona y con métricas"}]}
Las etiquetas "structure" y "hint" deben estar en español.`;
  const out = extractJSON(await callLLM(api, system, user, 4000));
  const list = Array.isArray(out) ? out : out.questions;
  if (!Array.isArray(list) || list.length < TOTAL_QUESTIONS) throw new Error("Respuesta incompleta de la IA");
  return list.slice(0, TOTAL_QUESTIONS).map((q, i) => ({
    id: `ai${i}`,
    category: CATEGORY_LABELS[q.category] ? q.category : "comunicacion",
    competency: q.competency || "Competencia general",
    question: q.question,
    structure: (q.structure || STAR.map(([label, hint]) => ({ label, hint }))).map((s) => (Array.isArray(s) ? { label: s[0], hint: s[1] } : s)),
    keywords: q.keywords || [],
    rawKeywords: q.keywords || [],
    modelAnswer: q.modelAnswer || "",
  }));
}

async function evaluateAI(api, { question, answer, cfg, mode, history }) {
  const strict = mode === "agent"
    ? "Evalúa con el rigor de un reclutador senior en una entrevista real: sé exigente."
    : "Evalúa como un coach exigente pero pedagógico.";
  const system = `Eres EDIA, evaluador experto de entrevistas laborales. ${strict} Respondes SOLO con JSON válido.`;
  const user = `Puesto: ${cfg.role} | Empresa: ${cfg.company || "-"} | Nivel: ${cfg.level} | Idioma: ${cfg.language}
Vacante/CV: ${cfg.jd || "-"}
Pregunta: ${question.question}
Competencia: ${question.competency}
Intentos previos del candidato: ${history.length}
Respuesta del candidato: """${answer}"""

Devuelve JSON:
{"score":0-100,"checklist":{"claridad":0-100,"impacto":0-100,"estructura":0-100,"relevancia":0-100},"strengths":["2-4 puntos en español"],"improvements":["2-4 correcciones concretas en español"],"missing":["lo mínimo que falta para superar 70, en español"],"followUp":"repregunta breve del entrevistador en ${cfg.language} si la respuesta es superficial o corta; si no, cadena vacía","modelAnswer":"respuesta Top 1% de 120-170 palabras en ${cfg.language} adaptada al puesto"}`;
  const out = extractJSON(await callLLM(api, system, user, 2000));
  const ck = out.checklist || {};
  return {
    score: Math.round(clamp(Number(out.score) || 0)),
    checklist: {
      claridad: Math.round(clamp(Number(ck.claridad) || 0)),
      impacto: Math.round(clamp(Number(ck.impacto) || 0)),
      estructura: Math.round(clamp(Number(ck.estructura) || 0)),
      relevancia: Math.round(clamp(Number(ck.relevancia) || 0)),
    },
    strengths: out.strengths || [],
    improvements: out.improvements || [],
    missing: out.missing || [],
    followUp: out.followUp || "",
    modelAnswer: out.modelAnswer || question.modelAnswer,
    wordCount: countWords(answer),
    source: "ai",
  };
}

/* ---------- Reporte ---------- */

function computeReport(questions, results, cfg) {
  const answered = questions
    .map((q, i) => ({ q, i, r: results[i] }))
    .filter((x) => x.r && x.r.attempts.length);
  const best = (r) => r.attempts.reduce((b, a) => (a.eval.score > b.eval.score ? a : b), r.attempts[0]);
  const scores = answered.map((x) => best(x.r).eval.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const avgOf = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

  const tech = answered.filter((x) => x.q.category === "tecnico");
  const competencies = {
    "Comunicación": avgOf(answered.map((x) => best(x.r).eval.checklist.claridad)),
    "Dominio Técnico": avgOf((tech.length ? tech : answered).map((x) => (tech.length ? best(x.r).eval.score : best(x.r).eval.checklist.relevancia))),
    "Resolución de Problemas": avgOf(answered.map((x) => best(x.r).eval.checklist.estructura)),
    "Impacto": avgOf(answered.map((x) => best(x.r).eval.checklist.impacto)),
  };

  const tips = {
    "Comunicación": ["Practica tu pitch en voz alta", "Graba 3 respuestas con el micrófono, escúchalas y elimina muletillas. Apunta a frases de menos de 25 palabras y a abrir siempre con la conclusión."],
    "Dominio Técnico": ["Refuerza el vocabulario del puesto", `Repasa la vacante de ${cfg.role} y prepara un ejemplo concreto para cada requisito técnico, mencionando herramientas, métodos y trade-offs.`],
    "Resolución de Problemas": ["Domina la estructura STAR", "Escribe 5 historias de tu carrera en formato Situación-Tarea-Acción-Resultado y ensáyalas hasta contarlas en menos de 2 minutos."],
    "Impacto": ["Cuantifica cada logro", "Crea un 'banco de métricas': para cada experiencia anota %, tiempo, dinero o usuarios impactados. Ninguna respuesta sin al menos un número."],
  };
  const plan = Object.entries(competencies).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([k, v]) => ({ competency: k, score: v, title: tips[k][0], detail: tips[k][1] }));

  return {
    avg,
    ready: avg >= PASS_SCORE && answered.length >= Math.min(4, questions.length),
    answeredCount: answered.length,
    skipped: questions.filter((_, i) => results[i]?.skipped).length,
    competencies,
    plan,
    rows: answered.map((x) => ({ ...x, bestAttempt: best(x.r) })),
  };
}

function buildMarkdown(cfg, questions, results, report) {
  const lines = [];
  lines.push("# EDIA Interview Copilot — Reporte de Entrenamiento", "");
  lines.push(`- **Fecha:** ${new Date().toLocaleString()}`);
  lines.push(`- **Puesto:** ${cfg.role}`);
  lines.push(`- **Empresa / Industria:** ${cfg.company || "-"}`);
  lines.push(`- **Nivel:** ${cfg.level}`);
  lines.push(`- **Idioma:** ${cfg.language}`);
  lines.push(`- **Modo:** ${cfg.mode === "agent" ? "Agente Evaluador (Simulación Real)" : "Copiloto EDIA (Guiado)"}`, "");
  lines.push(`## Resultado global: ${report.avg}/100 — ${report.ready ? "Listo para la entrevista ✅" : "En entrenamiento 🔄"}`, "");
  lines.push("## Competencias", "");
  Object.entries(report.competencies).forEach(([k, v]) => lines.push(`- **${k}:** ${v}/100`));
  lines.push("", "## Plan de acción", "");
  report.plan.forEach((p, i) => lines.push(`${i + 1}. **${p.title}** (${p.competency}: ${p.score}/100) — ${p.detail}`));
  lines.push("", "## Historial de preguntas", "");
  questions.forEach((q, i) => {
    const r = results[i];
    lines.push(`### Pregunta ${i + 1}: ${q.question}`, "", `*Competencia:* ${q.competency}`, "");
    if (!r || !r.attempts.length) { lines.push(r?.skipped ? "_Omitida sin respuesta._" : "_No respondida._", ""); return; }
    r.attempts.forEach((a, j) => {
      lines.push(`**Intento ${j + 1} — ${a.eval.score}/100**`, "", `> ${a.answer.replace(/\n/g, "\n> ")}`, "");
      lines.push(`Checklist: Claridad ${a.eval.checklist.claridad} · Impacto ${a.eval.checklist.impacto} · Estructura ${a.eval.checklist.estructura} · Relevancia ${a.eval.checklist.relevancia}`, "");
      lines.push("Lo que hiciste bien:", ...a.eval.strengths.map((s) => `- ✅ ${s}`), "");
      lines.push("Qué corregir:", ...a.eval.improvements.map((s) => `- ⚠️ ${s}`), "");
    });
    if (r.skipped) lines.push("_Pregunta omitida antes de alcanzar el 70%._", "");
    lines.push("**Respuesta Modelo Top 1%:**", "", r.attempts[r.attempts.length - 1].eval.modelAnswer || q.modelAnswer, "");
  });
  return lines.join("\n");
}

/* =========================================================================
   COMPONENTES UI BASE
   ========================================================================= */

const Glass = ({ className = "", children }) => (
  <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl shadow-black/20 ${className}`}>{children}</div>
);

function Logo({ size = "md" }) {
  const box = size === "lg" ? "w-14 h-14" : "w-9 h-9";
  const icon = size === "lg" ? 28 : 18;
  return (
    <div className="flex items-center gap-3">
      <div className={`${box} rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 relative`}>
        <Brain size={icon} className="text-white" />
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
      </div>
      <div className="leading-tight">
        <div className={`font-black tracking-tight text-white ${size === "lg" ? "text-3xl" : "text-base"}`}>
          EDIA <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Interview Copilot</span>
        </div>
        {size !== "lg" && <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Entrenamiento con IA</div>}
      </div>
    </div>
  );
}

function StatusPill({ api, compact = false }) {
  const map = {
    online: { cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400", icon: <Wifi size={14} />, label: "IA Activa" },
    checking: { cls: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300", dot: "bg-cyan-400", icon: <Loader2 size={14} className="animate-spin" />, label: "Conectando IA..." },
    offline: { cls: "border-amber-500/30 bg-amber-500/10 text-amber-300", dot: "bg-amber-400", icon: <WifiOff size={14} />, label: "Modo Respaldo Local" },
  };
  const st = map[api.status] || map.offline;
  return (
    <div title={api.status === "offline" && api.error ? `Motivo: ${api.error}` : st.label} className={`flex items-center gap-2 rounded-full font-medium border ${st.cls} ${compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-1.5 text-xs"}`}>
      {st.icon}
      <span className={compact ? "hidden xl:inline" : "hidden sm:inline"}>{st.label}</span>
      <span className={`w-2 h-2 rounded-full ${st.dot} animate-pulse`} />
    </div>
  );
}

function ScoreBar({ value, height = "h-3" }) {
  const pass = value >= PASS_SCORE;
  return (
    <div className={`w-full ${height} rounded-full bg-slate-800 overflow-hidden relative`}>
      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${pass ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-red-600 to-red-400"}`} style={{ width: `${value}%` }} />
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/40" style={{ left: `${PASS_SCORE}%` }} />
    </div>
  );
}

function ApiModal({ api, onSave, onClose }) {
  const [key, setKey] = useState(api.key || "");
  const [model, setModel] = useState(api.model || "");
  const [show, setShow] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm fade-in">
      <Glass className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-bold"><KeyRound size={18} className="text-cyan-400" /> Conexión de IA</div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"><X size={18} /></button>
        </div>
        <div className="mb-4"><StatusPill api={api} /></div>
        {api.status === "offline" && api.error && <p className="text-[11px] text-amber-300/80 mb-4">Último error: {api.error}</p>}
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">Dentro de los Artifacts de Claude la IA funciona de forma nativa y <b className="text-slate-200">no necesitas API Key</b>. Ingresa una clave de Anthropic solo si exportas este código fuera de Claude.</p>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Key de Anthropic (opcional)</label>
        <div className="relative mt-2 mb-4">
          <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <button onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-500">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Modelo</label>
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={DEFAULT_MODEL} className="w-full mt-2 mb-4 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500" />
        <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">La clave solo vive en la memoria de esta pestaña. Si la red o la API fallan, EDIA activa automáticamente el Motor de Respaldo Local (STAR + palabras clave de la vacante).</p>
        <div className="flex gap-2">
          <button onClick={() => { onSave({ key: "", model: model.trim() }); onClose(); }} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm hover:bg-slate-800 flex items-center justify-center gap-1.5"><RotateCcw size={14} /> {key ? "Quitar clave" : "Reintentar"}</button>
          <button onClick={() => { onSave({ key: key.trim(), model: model.trim() }); onClose(); }} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-semibold">Guardar y conectar</button>
        </div>
      </Glass>
    </div>
  );
}

function TopBrandBar({ api, onOpenApi, onHome }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={onHome}><Logo /></button>
        <div className="flex items-center gap-3">
          <StatusPill api={api} />
          <button onClick={onOpenApi} title="API Key opcional" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition">
            <KeyRound size={14} /> <span className="hidden sm:inline">API Key</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================================
   PANTALLA 1: LANDING
   ========================================================================= */

function Landing({ onStart }) {
  const steps = [
    { icon: Settings2, title: "1. Configura tu vacante", text: "Define el puesto, la empresa, tu nivel y pega la descripción de la vacante o tu CV.", color: "from-cyan-500 to-cyan-400" },
    { icon: LifeBuoy, title: "2. Practica con Soporte IA en vivo", text: "Guía en tiempo real y un chat de soporte IA 24/7 para resolver dudas o mejorar tu borrador.", color: "from-indigo-500 to-indigo-400" },
    { icon: Trophy, title: "3. Supera el 70% para avanzar", text: "Cada respuesta se evalúa. Si no llegas al 70, reescribe aplicando el feedback.", color: "from-emerald-500 to-emerald-400" },
  ];
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 sm:py-20 fade-in">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-8">
          <Sparkles size={14} /> Modo Agente · Soporte IA 24/7 · Evaluación STAR
        </div>
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          Tu copiloto inteligente con soporte IA 24/7 para <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">dominar cualquier entrevista</span>
        </h1>
        <p className="mt-5 text-slate-400 text-base sm:text-lg">Entrena con un entrevistador IA que se adapta a tu vacante, recibe feedback inmediato y no avances hasta dominar cada respuesta.</p>
        <button onClick={onStart} className="group mt-10 inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-lg shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.03] transition-all glow">
          <Rocket size={22} /> Comenzar Entrenamiento <ChevronRight size={20} className="group-hover:translate-x-1 transition" />
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-5 mt-16">
        {steps.map(({ icon: Icon, title, text, color }) => (
          <Glass key={title} className="p-6 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}><Icon size={20} className="text-white" /></div>
            <h3 className="font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
          </Glass>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Respaldo local automático si falla la red</span>
        <span className="flex items-center gap-1.5"><Mic size={14} className="text-cyan-400" /> Responde hablando con tu micrófono</span>
        <span className="flex items-center gap-1.5"><Languages size={14} className="text-indigo-400" /> Español e Inglés</span>
      </div>
    </main>
  );
}

/* =========================================================================
   PANTALLA 2: ONBOARDING
   ========================================================================= */

function Setup({ initial, onBack, onLaunch, loading }) {
  const [cfg, setCfg] = useState(initial);
  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));
  const valid = cfg.role.trim().length > 1;
  const examples = ["Frontend Developer", "Analista de Datos", "Ejecutivo de Ventas", "Project Manager"];
  const input = "w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition";
  const Label = ({ icon: Icon, children }) => (
    <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"><Icon size={14} className="text-cyan-400" /> {children}</label>
  );
  return (
    <main className="max-w-4xl mx-auto px-4 py-10 fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6"><ArrowLeft size={16} /> Volver</button>
      <div className="mb-8">
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-2">Paso 1 de 3</div>
        <h2 className="text-3xl font-black text-white">Configura tu misión</h2>
        <p className="text-slate-400 mt-2">EDIA adaptará las preguntas, la evaluación y las respuestas modelo a tu vacante.</p>
      </div>
      <Glass className="p-6 sm:p-8 space-y-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label icon={Briefcase}>Rol / Puesto objetivo *</Label>
            <input className={input} value={cfg.role} onChange={(e) => set("role", e.target.value)} placeholder="Ej. Frontend Developer" />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {examples.map((ex) => (
                <button key={ex} onClick={() => set("role", ex)} className="text-[11px] px-2 py-1 rounded-md bg-slate-800/80 text-slate-400 hover:text-cyan-300 hover:bg-slate-800">{ex}</button>
              ))}
            </div>
          </div>
          <div>
            <Label icon={Building2}>Industria / Empresa objetivo</Label>
            <input className={input} value={cfg.company} onChange={(e) => set("company", e.target.value)} placeholder="Ej. Fintech, Mercado Libre, Retail..." />
          </div>
        </div>
        <div>
          <Label icon={GraduationCap}>Nivel de experiencia</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEVELS.map((l) => (
              <button key={l} onClick={() => set("level", l)} className={`py-2.5 rounded-xl text-sm font-medium border transition ${cfg.level === l ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-slate-800 text-slate-400 hover:border-slate-700"}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <Label icon={Languages}>Idioma de la entrevista</Label>
          <div className="grid grid-cols-2 gap-2 sm:w-1/2">
            {["Español", "Inglés"].map((l) => (
              <button key={l} onClick={() => set("language", l)} className={`py-2.5 rounded-xl text-sm font-medium border transition ${cfg.language === l ? "border-indigo-500 bg-indigo-500/10 text-indigo-300" : "border-slate-800 text-slate-400 hover:border-slate-700"}`}>{l === "Español" ? "🇪🇸 Español" : "🇺🇸 Inglés"}</button>
            ))}
          </div>
        </div>
        <div>
          <Label icon={FileText}>Descripción de la vacante y/o resumen del CV</Label>
          <textarea className={`${input} min-h-[130px] resize-y`} value={cfg.jd} onChange={(e) => set("jd", e.target.value)} placeholder="Pega aquí la Job Description y/o un resumen de tu experiencia. EDIA extraerá las palabras clave para personalizar preguntas y evaluación." />
          <div className="text-right text-[11px] text-slate-600 mt-1">{countWords(cfg.jd)} palabras</div>
        </div>
        <div>
          <Label icon={Layers}>Modo de entrenamiento</Label>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { v: "copilot", icon: Compass, title: "Modo Copiloto EDIA (Guiado)", text: "Pistas, estructura y soporte en vivo antes y después de responder.", accent: "cyan" },
              { v: "agent", icon: Bot, title: "Modo Agente Evaluador (Simulación Real)", text: "Sin pistas automáticas durante la respuesta, 2 minutos por pregunta y evaluación con rigor de reclutador senior.", accent: "indigo" },
            ].map(({ v, icon: Icon, title, text, accent }) => {
              const on = cfg.mode === v;
              return (
                <button key={v} onClick={() => set("mode", v)} className={`text-left p-4 rounded-xl border transition relative ${on ? (accent === "cyan" ? "border-cyan-500 bg-cyan-500/10" : "border-indigo-500 bg-indigo-500/10") : "border-slate-800 hover:border-slate-700"}`}>
                  {on && <CheckCircle2 size={18} className={`absolute top-3 right-3 ${accent === "cyan" ? "text-cyan-400" : "text-indigo-400"}`} />}
                  <Icon size={22} className={accent === "cyan" ? "text-cyan-400" : "text-indigo-400"} />
                  <div className="font-bold text-white mt-2 text-sm pr-6">{title}</div>
                  <div className="text-xs text-slate-400 mt-1 leading-relaxed">{text}</div>
                </button>
              );
            })}
          </div>
        </div>
        <button disabled={!valid || loading} onClick={() => onLaunch(cfg)} className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-lg hover:shadow-cyan-500/30 transition">
          {loading ? <><Loader2 size={18} className="animate-spin" /> EDIA está preparando tu entrevista...</> : <><Zap size={18} /> Iniciar simulación ({TOTAL_QUESTIONS} preguntas)</>}
        </button>
      </Glass>
    </main>
  );
}

/* =========================================================================
   PANTALLA 3: WORKSPACE
   ========================================================================= */

function GuidePanel({ question, mode, unlocked, hideHints, setHideHints }) {
  if (mode === "agent" && !unlocked) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4"><Lock size={26} className="text-indigo-400" /></div>
        <h4 className="text-white font-bold">Ayudas bloqueadas</h4>
        <p className="text-sm text-slate-400 mt-2 max-w-xs">Estás en <span className="text-indigo-300">Modo Agente Evaluador</span>. Responde como en una entrevista real; la guía se desbloquea tras tu primera evaluación. Si lo necesitas, el Soporte IA sigue disponible bajo demanda.</p>
      </div>
    );
  }
  return (
    <div className="space-y-5 fade-in">
      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2"><Target size={14} /> Qué evalúa el reclutador</div>
        <div className="text-white font-semibold">{question.competency}</div>
        <div className="text-xs text-slate-400 mt-1">Categoría: {CATEGORY_LABELS[question.category]}</div>
      </div>
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"><ListChecks size={14} className="text-indigo-400" /> Estructura recomendada</div>
        <div className="space-y-2">
          {question.structure.map((s, i) => (
            <div key={i} className="flex gap-3 items-stretch">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                {i < question.structure.length - 1 && <div className="w-px flex-1 bg-slate-700 my-1" />}
              </div>
              <div className="pb-2">
                <div className="text-sm font-semibold text-white">{s.label}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{s.hint}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider"><Lightbulb size={14} className="text-amber-400" /> Conceptos recomendados</div>
          <button onClick={() => setHideHints(!hideHints)} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 px-2 py-1 rounded-md border border-slate-800">
            {hideHints ? <><Eye size={12} /> Mostrar pistas</> : <><EyeOff size={12} /> Ocultar pistas</>}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {question.keywords.map((k, i) => (
            <span key={i} className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${hideHints ? "border-slate-800 bg-slate-800 text-transparent select-none blur-[3px]" : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"}`}>{k}</span>
          ))}
        </div>
        {hideHints && <p className="text-[11px] text-slate-500 mt-2">Modo memoria: intenta recordar los conceptos por tu cuenta.</p>}
      </div>
    </div>
  );
}

function EvalPanel({ evalData, loading, attempts, onNext, onSkip, isLast, mode }) {
  const [showModel, setShowModel] = useState(false);
  useEffect(() => setShowModel(false), [evalData]);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative w-20 h-20 mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
          <Brain size={28} className="absolute inset-0 m-auto text-cyan-300 animate-pulse" />
        </div>
        <div className="text-white font-semibold">EDIA está analizando tu respuesta...</div>
        <div className="text-xs text-slate-500 mt-2">Estructura STAR · Métricas · Palabras clave · Claridad</div>
      </div>
    );
  }
  if (!evalData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <BarChart3 size={36} className="text-slate-700 mb-3" />
        <div className="text-slate-300 font-semibold">Aún no hay evaluación</div>
        <div className="text-sm text-slate-500 mt-1">Envía tu respuesta y EDIA la evaluará al instante.</div>
      </div>
    );
  }
  const pass = evalData.score >= PASS_SCORE;
  const checks = [
    ["Claridad", evalData.checklist.claridad],
    ["Impacto / Métricas", evalData.checklist.impacto],
    ["Estructura STAR", evalData.checklist.estructura],
    ["Relevancia al puesto", evalData.checklist.relevancia],
  ];
  return (
    <div className="space-y-5 fade-in">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">Intento {attempts} · {evalData.source === "ai" ? "Evaluación IA" : "Motor de Respaldo Local"}{mode === "agent" ? " · Rigor reclutador" : ""}</div>
        <div className={`text-6xl font-black tabular-nums score-pop ${pass ? "text-emerald-400" : "text-red-400"}`}>{evalData.score}<span className="text-2xl text-slate-600">/100</span></div>
        <div className="mt-3"><ScoreBar value={evalData.score} /></div>
        <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>0</span><span className="text-slate-400">Umbral {PASS_SCORE}</span><span>100</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {checks.map(([label, v]) => (
          <div key={label} className={`p-3 rounded-xl border ${v >= PASS_SCORE ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-800 bg-slate-950/40"}`}>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              {v >= PASS_SCORE ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> : <XCircle size={14} className="text-red-400 shrink-0" />}
              <span className="truncate">{label}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <ScoreBar value={v} height="h-1.5" />
              <span className="text-xs font-bold text-white tabular-nums">{v}</span>
            </div>
          </div>
        ))}
      </div>

      {!pass ? (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 shake">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm"><AlertTriangle size={16} /> Copiloto EDIA: aún no alcanzas el {PASS_SCORE}%</div>
          <p className="text-xs text-amber-100/80 mt-2">Te faltan <b>{PASS_SCORE - evalData.score} puntos</b>. Reescribe tu respuesta en el chat aplicando esto:</p>
          <ul className="mt-2 space-y-1">
            {(evalData.missing.length ? evalData.missing : evalData.improvements).slice(0, 4).map((m, i) => (
              <li key={i} className="text-xs text-amber-100 flex gap-2"><span className="text-amber-400">→</span>{m}</li>
            ))}
          </ul>
          <button disabled className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 text-slate-500 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed"><Lock size={14} /> Siguiente pregunta bloqueada</button>
          <button onClick={onSkip} className="mt-2 w-full text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-2">Omitir pregunta</button>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 unlock">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm"><Award size={16} /> ¡Respuesta aprobada! Siguiente pregunta desbloqueada.</div>
          <button onClick={onNext} className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 text-sm font-black flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/30 transition glow-green">
            {isLast ? <><Trophy size={16} /> Ver Reporte Final</> : <>Avanzar a la siguiente pregunta <ChevronRight size={16} /></>}
          </button>
        </div>
      )}

      <div>
        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Lo que hiciste bien</div>
        <ul className="space-y-1.5">{evalData.strengths.map((s, i) => <li key={i} className="flex gap-2 text-sm text-slate-300"><CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />{s}</li>)}</ul>
      </div>
      <div>
        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Qué corregir</div>
        <ul className="space-y-1.5">{evalData.improvements.map((s, i) => <li key={i} className="flex gap-2 text-sm text-slate-300"><AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />{s}</li>)}</ul>
      </div>
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 overflow-hidden">
        <button onClick={() => setShowModel(!showModel)} className="w-full flex items-center justify-between p-3 text-sm font-bold text-indigo-300">
          <span className="flex items-center gap-2"><Sparkles size={15} /> Respuesta Modelo Top 1%</span>
          <ChevronRight size={16} className={`transition ${showModel ? "rotate-90" : ""}`} />
        </button>
        {showModel && <p className="px-4 pb-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line fade-in">{evalData.modelAnswer}</p>}
      </div>
    </div>
  );
}

function SupportPanel({ messages, loading, onAsk, hasDraft, api, isAgent }) {
  const [input, setInput] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  const quick = [
    ["example", "Dame un ejemplo con mi perfil", User],
    ["recruiter", "¿Qué busca el reclutador aquí?", HelpCircle],
    ["improve", "Mejorar mi borrador", Wand2],
  ];
  const send = () => { if (!input.trim() || loading) return; onAsk("free", input); setInput(""); };
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-800/60">
        <span className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${api.status === "online" ? "bg-emerald-400" : api.status === "checking" ? "bg-cyan-400" : "bg-amber-400"}`} />{api.status === "online" ? "Soporte IA conectado · 24/7" : api.status === "checking" ? "Conectando con la IA..." : "Soporte con Motor de Respaldo Local"}</span>
        {isAgent && <span className="text-indigo-300/80">Ayuda bajo demanda</span>}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[260px]">
        {messages.map((m, i) => {
          const mine = m.role === "user";
          return (
            <div key={i} className={`flex gap-2 msg-in ${mine ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${mine ? "bg-slate-700" : "bg-gradient-to-br from-emerald-500 to-cyan-500"}`}>{mine ? <User size={14} className="text-slate-200" /> : <LifeBuoy size={14} className="text-white" />}</div>
              <div className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${mine ? "bg-cyan-500/15 border border-cyan-500/30 text-slate-100 rounded-tr-sm" : "bg-slate-800/70 border border-slate-700/60 text-slate-200 rounded-tl-sm"}`}>{m.text}</div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-2 msg-in">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"><LifeBuoy size={14} className="text-white" /></div>
            <div className="rounded-2xl px-3 py-2.5 bg-slate-800/70 border border-slate-700/60 text-xs text-slate-400 flex items-center gap-2"><Loader2 size={13} className="animate-spin text-cyan-300" /> EDIA está pensando tu respuesta...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {quick.map(([k, l, Icon]) => (
            <button key={k} disabled={loading} onClick={() => onAsk(k)} title={k === "improve" && !hasDraft ? "Escribe primero un borrador en la caja del entrevistador" : l} className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-cyan-200 hover:bg-cyan-500/15 disabled:opacity-40 transition">
              <Icon size={12} /> {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={2}
            placeholder="Pregunta lo que quieras al copiloto... (Enter para enviar)"
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-[13px] text-white placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/60"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white disabled:opacity-30"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function Workspace({ cfg, api, questions, onHome, onOpenApi, onFinish, setApiFailed }) {
  const en = cfg.language === "Inglés";
  const [idx, setIdx] = useState(0);
  const [messages, setMessages] = useState(() => [
    {
      role: "interviewer",
      text: en
        ? `Hi! I'm Ava, the EDIA interviewer for the ${cfg.role} position${cfg.company ? ` at ${cfg.company}` : ""}. We'll go through ${TOTAL_QUESTIONS} questions. Take your time and be specific.`
        : `¡Hola! Soy Ava, la entrevistadora EDIA para el puesto de ${cfg.role}${cfg.company ? ` en ${cfg.company}` : ""}. Haremos ${TOTAL_QUESTIONS} preguntas. Tómate tu tiempo y sé específico/a.`,
    },
    { role: "interviewer", text: questions[0].question, qIndex: 0 },
  ]);
  const [results, setResults] = useState(() => questions.map(() => ({ attempts: [], skipped: false, passed: false })));
  const [answer, setAnswer] = useState("");
  const [tab, setTab] = useState("guide");
  const [loading, setLoading] = useState(false);
  const [hideHints, setHideHints] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [micError, setMicError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [startedAt] = useState(Date.now());
  const [qStart, setQStart] = useState(Date.now());
  const [frozen, setFrozen] = useState(null);
  const [supportMsgs, setSupportMsgs] = useState(() => [
    { role: "assistant", text: `¡Hola! Soy el Soporte IA de EDIA. Estoy contigo durante toda la entrevista para ${cfg.role}: pregúntame lo que quieras (cómo explicar falta de experiencia, cómo cuantificar un logro, qué responder…) o usa los botones rápidos.` },
  ]);
  const [supportLoading, setSupportLoading] = useState(false);
  const recRef = useRef(null);
  const chatEnd = useRef(null);
  const autoSubmitted = useRef(false);

  const current = questions[idx];
  const res = results[idx];
  const lastEval = res.attempts.length ? res.attempts[res.attempts.length - 1].eval : null;
  const passed = lastEval && lastEval.score >= PASS_SCORE;
  const isAgent = cfg.mode === "agent";

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => () => recRef.current?.stop(), []);

  const elapsedQ = ((frozen ?? now) - qStart) / 1000;
  const remaining = AGENT_SECONDS - elapsedQ;
  const totalElapsed = (now - startedAt) / 1000;

  const stopMic = () => { recRef.current?.stop(); setListening(false); setInterim(""); };

  const toggleMic = () => {
    setMicError("");
    if (listening) { stopMic(); return; }
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setMicError("Tu navegador no soporta dictado por voz (prueba Chrome o Edge). Puedes seguir escribiendo tu respuesta."); return; }
    let rec;
    try { rec = new SR(); } catch (err) { setMicError("El navegador bloqueó el reconocimiento de voz en este entorno. Escribe tu respuesta o abre la app en una pestaña propia."); return; }
    rec.lang = en ? "en-US" : "es-ES";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interimText += t;
      }
      if (finalText) setAnswer((a) => (a ? `${a.trimEnd()} ${finalText.trim()}` : finalText.trim()));
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      const msgs = {
        "not-allowed": "Permiso de micrófono denegado o bloqueado por el entorno. Revisa los permisos del navegador.",
        "service-not-allowed": "El navegador no permite el servicio de dictado aquí. Escribe tu respuesta.",
        "audio-capture": "No se detectó ningún micrófono conectado.",
        "network": "El dictado necesita conexión a internet.",
        "no-speech": "No se detectó voz. Pulsa el micrófono e inténtalo de nuevo.",
        "aborted": "",
      };
      const m = msgs[e.error] ?? `Error de micrófono: ${e.error}`;
      if (m) setMicError(m);
      setListening(false);
    };
    rec.onend = () => { setListening(false); setInterim(""); };
    try { rec.start(); recRef.current = rec; setListening(true); } catch (err) { setMicError("No se pudo iniciar el micrófono."); }
  };

  const submit = useCallback(async (forcedText) => {
    const text = (forcedText ?? answer).trim();
    if (!text || loading) return;
    stopMic();
    setFrozen(Date.now());
    setMessages((m) => [...m, { role: "user", text, qIndex: idx }]);
    setAnswer("");
    setTab("eval");
    setLoading(true);
    let ev;
    const started = Date.now();
    try {
      if (api.status === "offline") throw new Error("local");
      ev = await evaluateAI(api, { question: current, answer: text, cfg, mode: cfg.mode, history: res.attempts });
    } catch (err) {
      if (err.message !== "local") setApiFailed(err.message);
      ev = evaluateOffline({ question: current, answer: text, cfg, mode: cfg.mode });
    }
    const wait = 1100 - (Date.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    setResults((rs) => rs.map((r, i) => (i === idx ? { ...r, attempts: [...r.attempts, { answer: text, eval: ev }], passed: r.passed || ev.score >= PASS_SCORE } : r)));
    const pass = ev.score >= PASS_SCORE;
    let reply;
    if (pass) {
      reply = isAgent
        ? (en ? "Thank you, noted. Let's continue when you're ready." : "Gracias, queda registrado. Continuemos cuando estés listo/a.")
        : (en ? "Great answer! That's what I was looking for." : "¡Excelente respuesta! Eso es justo lo que buscaba.");
    } else {
      reply = ev.followUp || (en ? "I'd like you to strengthen that answer. Could you give it another try?" : "Me gustaría que reforzaras esa respuesta. ¿Lo intentas de nuevo?");
    }
    setMessages((m) => [...m, { role: "interviewer", text: reply, followUp: !pass, ack: true }]);
    setLoading(false);
    if (!pass) { setQStart(Date.now()); setFrozen(null); autoSubmitted.current = false; }
  }, [answer, loading, idx, current, cfg, api, res.attempts, isAgent, en, setApiFailed]);

  useEffect(() => {
    if (!isAgent || frozen || loading || passed) return;
    if (remaining <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      submit(answer.trim() || (en ? "(No answer — time is up)" : "(Sin respuesta — tiempo agotado)"));
    }
  }, [remaining, isAgent, frozen, loading, passed, answer, submit, en]);

  const goNext = (skipped = false) => {
    stopMic();
    const newResults = results.map((r, i) => (i === idx && skipped ? { ...r, skipped: true } : r));
    if (skipped) setResults(newResults);
    if (idx >= questions.length - 1) { onFinish(newResults); return; }
    const n = idx + 1;
    setIdx(n);
    setMessages((m) => [
      ...m,
      ...(skipped ? [{ role: "system", text: "Pregunta omitida. Puedes revisarla en el reporte final." }] : []),
      { role: "interviewer", text: questions[n].question, qIndex: n },
    ]);
    setTab("guide");
    setAnswer("");
    setQStart(Date.now());
    setFrozen(null);
    autoSubmitted.current = false;
  };

  const askSupport = async (kind, rawText) => {
    if (supportLoading) return;
    const prompts = {
      example: "Dame un ejemplo con mi perfil",
      recruiter: "¿Qué busca el reclutador aquí?",
      improve: "Mejorar mi borrador",
    };
    const userText = kind === "free" ? rawText.trim() : prompts[kind];
    if (!userText) return;
    const history = supportMsgs;
    setSupportMsgs((m) => [...m, { role: "user", text: userText }]);
    setSupportLoading(true);
    const draft = answer.trim();
    const aiMessage = {
      example: `Escribe un ejemplo de respuesta ideal (en ${cfg.language}) para la pregunta actual, adaptado a mi perfil (${cfg.level}, ${cfg.role}${cfg.jd ? ", usando datos de la vacante/CV" : ""}). Después explica en 2 viñetas por qué funciona.`,
      recruiter: "Explícame qué busca realmente el reclutador con la pregunta actual, qué señales de alerta evita y cómo debería estructurar mi respuesta.",
      improve: draft ? `Mejora mi borrador actual: dame una estimación de puntaje, 2-3 correcciones concretas y una versión mejorada lista para usar en ${cfg.language}, manteniendo mis datos reales.` : "Aún no tengo borrador. Dame una plantilla para empezar a escribir mi respuesta.",
      free: userText,
    }[kind];
    let reply;
    const started = Date.now();
    try {
      if (api.status === "offline") throw new Error("local");
      reply = await askSupportAI(api, { cfg, question: current, draft, lastEval, history, message: aiMessage });
    } catch (err) {
      if (err.message !== "local") setApiFailed(err.message);
      reply = localSupport({ kind, message: userText, cfg, question: current, draft, lastEval });
    }
    const wait = 700 - (Date.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    setSupportMsgs((m) => [...m, { role: "assistant", text: reply, kind }]);
    setSupportLoading(false);
  };

  const simulateTimeout = () => {
    const t = Date.now();
    setQStart(t - AGENT_SECONDS * 1000 - 1000);
    setNow(t);
  };

  const wc = countWords(answer);
  const timerDanger = isAgent && remaining <= 30;

  return (
    <div className="flex flex-col h-screen fade-in">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl z-20">
        <div className="px-3 sm:px-5 h-16 flex items-center gap-2 sm:gap-4">
          <button onClick={onHome} title="Volver al inicio" className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><ArrowLeft size={18} /></button>
          <div className="hidden md:block"><Logo /></div>
          <div className="flex-1 min-w-0 max-w-xs mx-auto">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1"><span>Pregunta <b className="text-white">{idx + 1}</b> de {questions.length}</span><span>{Math.round(((idx + (passed ? 1 : 0)) / questions.length) * 100)}%</span></div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-700" style={{ width: `${((idx + (passed ? 1 : 0)) / questions.length) * 100}%` }} /></div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-sm font-mono tabular-nums ${timerDanger ? "border-red-500/50 bg-red-500/10 text-red-300 animate-pulse" : "border-slate-800 text-slate-300"}`} title={isAgent ? "Tiempo restante para esta pregunta" : "Tiempo total de sesión"}>
            <Timer size={15} /> {isAgent ? fmtTime(remaining) : fmtTime(totalElapsed)}
          </div>
          {isAgent && !frozen && !passed && !loading && (
            <button onClick={simulateTimeout} title="Simular fin de tiempo (pruebas rápidas)" className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-slate-700 text-[11px] text-slate-500 hover:text-amber-300 hover:border-amber-500/50 whitespace-nowrap">
              <Hourglass size={13} /> <span className="hidden lg:inline">Simular fin de tiempo</span>
            </button>
          )}
          <button onClick={onOpenApi} className="hidden sm:block" title="Estado de la IA / API Key opcional"><StatusPill api={api} compact /></button>
          <button onClick={toggleMic} title="Dictar respuesta" className={`p-2 rounded-lg border transition ${listening ? "border-red-500 bg-red-500/20 text-red-300 mic-pulse" : "border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/50"}`}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button onClick={() => onFinish(results)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-white font-medium whitespace-nowrap">
            <Flag size={15} /> <span className="hidden sm:inline">Finalizar y ver Reporte</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Entrevistador */}
        <section className="lg:w-3/5 flex flex-col min-h-[70vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800/80">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 bg-slate-900/40">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center"><Bot size={20} className="text-white" /></div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Ava · Entrevistadora EDIA</div>
              <div className="text-[11px] text-slate-500">{isAgent ? "Modo Agente Evaluador · Simulación real" : "Modo Copiloto · Guiado"} · {cfg.level}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
            {messages.map((m, i) => {
              if (m.role === "system") return <div key={i} className="text-center text-[11px] text-slate-500 italic">{m.text}</div>;
              const mine = m.role === "user";
              return (
                <div key={i} className={`flex gap-3 msg-in ${mine ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${mine ? "bg-slate-700" : "bg-gradient-to-br from-indigo-500 to-cyan-500"}`}>{mine ? <User size={16} className="text-slate-200" /> : <Bot size={16} className="text-white" />}</div>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${mine ? "bg-cyan-500/15 border border-cyan-500/30 text-slate-100 rounded-tr-sm" : m.followUp ? "bg-amber-500/10 border border-amber-500/30 text-amber-50 rounded-tl-sm" : "bg-slate-800/70 border border-slate-700/60 text-slate-100 rounded-tl-sm"}`}>
                    {m.qIndex !== undefined && !mine && !m.followUp && <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">Pregunta {m.qIndex + 1}</div>}
                    {m.followUp && <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1"><MessageSquare size={10} /> Repregunta</div>}
                    {m.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex gap-3 msg-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
                <div className="rounded-2xl px-4 py-3 bg-slate-800/70 border border-slate-700/60 flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 dot" /><span className="w-2 h-2 rounded-full bg-cyan-400 dot" style={{ animationDelay: ".15s" }} /><span className="w-2 h-2 rounded-full bg-cyan-400 dot" style={{ animationDelay: ".3s" }} />
                </div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950/60">
            {lastEval && !passed && !loading && (
              <div className="mb-2 flex items-center gap-2 text-xs text-amber-300"><RotateCcw size={13} /> Reescribe tu respuesta aplicando el feedback del Copiloto (intento {res.attempts.length + 1}).</div>
            )}
            {micError && <div className="mb-2 text-xs text-red-400">{micError}</div>}
            <div className={`rounded-2xl border bg-slate-900/80 transition ${listening ? "border-red-500/50" : "border-slate-800 focus-within:border-cyan-500/60"}`}>
              <textarea
                value={answer + (interim ? ` ${interim}` : "")}
                onChange={(e) => { setAnswer(e.target.value); setInterim(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); } }}
                disabled={loading || passed}
                placeholder={passed ? "Respuesta aprobada. Avanza a la siguiente pregunta desde el panel EDIA." : listening ? "Escuchando... habla con naturalidad." : "Escribe tu respuesta aquí (Ctrl + Enter para enviar)..."}
                className="w-full bg-transparent px-4 pt-3 pb-1 text-sm text-white placeholder-slate-600 resize-none focus:outline-none min-h-[110px] max-h-60 disabled:opacity-50"
              />
              <div className="flex items-center justify-between px-3 pb-2.5">
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className={wc >= (cfg.level === "Senior" || cfg.level === "Directivo" ? 90 : 65) ? "text-emerald-400" : ""}>{wc} palabras</span>
                  {listening && <span className="flex items-center gap-1 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Dictando</span>}
                  {!isAgent && wc > 0 && <span className="hidden sm:inline">Objetivo: {cfg.level === "Senior" || cfg.level === "Directivo" ? "90-250" : "65-250"}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleMic} disabled={loading || passed} className={`sm:hidden p-2 rounded-lg ${listening ? "text-red-300" : "text-slate-400"}`}>{listening ? <MicOff size={16} /> : <Mic size={16} />}</button>
                  <button onClick={() => submit()} disabled={!answer.trim() || loading || passed} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-semibold disabled:opacity-30 hover:shadow-lg hover:shadow-cyan-500/30 transition">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Panel Copiloto */}
        <aside className="lg:w-2/5 flex flex-col min-h-[60vh] lg:min-h-0 bg-slate-900/30">
          <div className="flex p-2 gap-1 border-b border-slate-800/60">
            {[["guide", "Guía en Vivo", "Guía", Compass], ["support", "Soporte IA (Chat)", "Soporte", LifeBuoy], ["eval", "Evaluación EDIA", "Evaluación", BarChart3]].map(([k, l, short, Icon]) => (
              <button key={k} onClick={() => setTab(k)} className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl text-xs sm:text-sm font-semibold transition ${tab === k ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-500/30" : "text-slate-500 hover:text-slate-300 border border-transparent"}`}>
                <Icon size={15} className="shrink-0" /> <span className="hidden 2xl:inline truncate">{l}</span><span className="2xl:hidden truncate">{short}</span>
                {k === "eval" && lastEval && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${passed ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{lastEval.score}</span>}
                {k === "support" && supportLoading && <Loader2 size={12} className="animate-spin text-cyan-300" />}
              </button>
            ))}
          </div>
          {tab === "support" ? (
            <SupportPanel messages={supportMsgs} loading={supportLoading} onAsk={askSupport} hasDraft={!!answer.trim()} api={api} isAgent={isAgent} />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {tab === "guide" ? (
                <GuidePanel question={current} mode={cfg.mode} unlocked={res.attempts.length > 0} hideHints={hideHints} setHideHints={setHideHints} />
              ) : (
                <EvalPanel evalData={lastEval} loading={loading} attempts={res.attempts.length} onNext={() => goNext(false)} onSkip={() => goNext(true)} isLast={idx === questions.length - 1} mode={cfg.mode} />
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* =========================================================================
   PANTALLA 4: REPORTE
   ========================================================================= */

function Report({ cfg, questions, results, onRestart, onHome }) {
  const report = useMemo(() => computeReport(questions, results, cfg), [questions, results, cfg]);
  const md = useMemo(() => buildMarkdown(cfg, questions, results, report), [cfg, questions, results, report]);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(null);

  const download = () => {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EDIA-reporte-${(cfg.role || "entrevista").replace(/\s+/g, "-").toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(md); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = md;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const circ = 2 * Math.PI * 54;
  const pass = report.avg >= PASS_SCORE;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-1">Reporte Ejecutivo Final</div>
          <h2 className="text-3xl font-black text-white">{cfg.role}{cfg.company ? <span className="text-slate-500"> · {cfg.company}</span> : null}</h2>
          <div className="text-sm text-slate-500 mt-1">{cfg.level} · {cfg.language} · {cfg.mode === "agent" ? "Modo Agente Evaluador" : "Modo Copiloto EDIA"}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copy} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-200 text-sm hover:bg-slate-800">{copied ? <><Check size={16} className="text-emerald-400" /> Copiado</> : <><Copy size={16} /> Copiar</>}</button>
          <button onClick={download} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-semibold"><Download size={16} /> Descargar .md</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Glass className="p-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="54" stroke="rgb(30 41 59)" strokeWidth="10" fill="none" />
              <circle cx="60" cy="60" r="54" stroke={pass ? "rgb(52 211 153)" : "rgb(248 113 113)"} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - report.avg / 100)} style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-4xl font-black ${pass ? "text-emerald-400" : "text-red-400"}`}>{report.avg}</div>
              <div className="text-xs text-slate-500">promedio global</div>
            </div>
          </div>
          <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${report.ready ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/15 text-amber-300 border border-amber-500/40"}`}>
            {report.ready ? <><Trophy size={16} /> Listo para la entrevista</> : <><TrendingUp size={16} /> En entrenamiento</>}
          </div>
          {!report.ready && <p className="mt-2 text-[11px] text-slate-500 max-w-[16rem]">{report.avg >= PASS_SCORE ? "Responde al menos 4 preguntas para obtener el estado \"Listo para la entrevista\"." : `Necesitas un promedio de ${PASS_SCORE} o más para estar listo/a.`}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 w-full text-center">
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800"><div className="text-xl font-bold text-white">{report.answeredCount}/{questions.length}</div><div className="text-[11px] text-slate-500">respondidas</div></div>
            <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800"><div className="text-xl font-bold text-white">{report.skipped}</div><div className="text-[11px] text-slate-500">omitidas</div></div>
          </div>
        </Glass>

        <Glass className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-white font-bold mb-5"><BarChart3 size={18} className="text-cyan-400" /> Desempeño por competencias</div>
          <div className="flex items-end justify-around gap-3 h-56 border-b border-slate-800 relative">
            <div className="absolute left-0 right-0 border-t border-dashed border-white/20" style={{ bottom: `${PASS_SCORE}%` }}><span className="absolute -top-4 right-0 text-[10px] text-slate-500">Umbral {PASS_SCORE}</span></div>
            {Object.entries(report.competencies).map(([k, v]) => (
              <div key={k} className="flex-1 flex flex-col items-center justify-end h-full max-w-[90px]">
                <div className={`text-sm font-bold mb-1 ${v >= PASS_SCORE ? "text-emerald-400" : "text-red-400"}`}>{v}</div>
                <div className={`w-full rounded-t-lg bar-grow ${v >= PASS_SCORE ? "bg-gradient-to-t from-emerald-600 to-emerald-400" : "bg-gradient-to-t from-indigo-600 to-cyan-400"}`} style={{ height: `${Math.max(v, 3)}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-around gap-3 mt-2">
            {Object.keys(report.competencies).map((k) => <div key={k} className="flex-1 max-w-[90px] text-center text-[11px] text-slate-400 leading-tight">{k}</div>)}
          </div>
        </Glass>
      </div>

      <Glass className="p-6 mt-5">
        <div className="flex items-center gap-2 text-white font-bold mb-4"><Rocket size={18} className="text-indigo-400" /> Plan de acción personalizado</div>
        <div className="grid md:grid-cols-3 gap-4">
          {report.plan.map((p, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-indigo-500/40 transition">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
                <div className="text-sm font-bold text-white">{p.title}</div>
              </div>
              <div className="text-[11px] text-slate-500 mb-2">{p.competency}: {p.score}/100</div>
              <p className="text-sm text-slate-300 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
      </Glass>

      <Glass className="p-6 mt-5">
        <div className="flex items-center gap-2 text-white font-bold mb-4"><ListChecks size={18} className="text-cyan-400" /> Historial de respuestas</div>
        {questions.map((q, i) => {
          const r = results[i];
          const best = r.attempts.length ? r.attempts.reduce((b, a) => (a.eval.score > b.eval.score ? a : b)) : null;
          return (
            <div key={i} className="border-b border-slate-800/60 last:border-0">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center gap-3 py-3 text-left">
                <span className={`w-10 text-center text-sm font-bold tabular-nums ${best ? (best.eval.score >= PASS_SCORE ? "text-emerald-400" : "text-red-400") : "text-slate-600"}`}>{best ? best.eval.score : "—"}</span>
                <span className="flex-1 text-sm text-slate-200">{q.question}</span>
                {r.skipped && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">Omitida</span>}
                <span className="text-[10px] text-slate-500 hidden sm:inline">{r.attempts.length} intento(s)</span>
                <ChevronRight size={16} className={`text-slate-500 transition ${open === i ? "rotate-90" : ""}`} />
              </button>
              {open === i && (
                <div className="pb-4 pl-12 space-y-3 fade-in">
                  {best ? (
                    <>
                      <div className="text-xs text-slate-500">Mejor respuesta:</div>
                      <p className="text-sm text-slate-300 bg-slate-950/50 rounded-xl p-3 border border-slate-800 whitespace-pre-wrap">{best.answer}</p>
                      <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1"><Sparkles size={12} /> Respuesta Modelo Top 1%</div>
                      <p className="text-sm text-slate-400 leading-relaxed">{best.eval.modelAnswer}</p>
                    </>
                  ) : <p className="text-sm text-slate-500">Sin respuesta registrada.</p>}
                </div>
              )}
            </div>
          );
        })}
      </Glass>

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <button onClick={onRestart} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold"><RotateCcw size={16} /> Entrenar de nuevo</button>
        <button onClick={onHome} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800">Volver al inicio</button>
      </div>
    </main>
  );
}

/* =========================================================================
   APP
   ========================================================================= */

const STYLES = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes msgIn { from { opacity: 0; transform: translateY(10px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes pop { 0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
@keyframes shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-5px) } 40%,80% { transform: translateX(5px) } }
@keyframes unlock { 0% { transform: scale(.92); opacity: 0; box-shadow: 0 0 0 0 rgba(52,211,153,.6) } 60% { transform: scale(1.02); opacity: 1; box-shadow: 0 0 0 14px rgba(52,211,153,0) } 100% { transform: scale(1) } }
@keyframes glow { 0%,100% { box-shadow: 0 0 24px rgba(6,182,212,.35) } 50% { box-shadow: 0 0 44px rgba(99,102,241,.55) } }
@keyframes glowGreen { 0%,100% { box-shadow: 0 0 0 rgba(52,211,153,0) } 50% { box-shadow: 0 0 24px rgba(52,211,153,.5) } }
@keyframes dot { 0%,80%,100% { transform: scale(.6); opacity: .4 } 40% { transform: scale(1); opacity: 1 } }
@keyframes micPulse { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,.6) } 100% { box-shadow: 0 0 0 12px rgba(239,68,68,0) } }
@keyframes barGrow { from { transform: scaleY(0) } to { transform: scaleY(1) } }
.fade-in { animation: fadeIn .45s ease-out both }
.msg-in { animation: msgIn .35s ease-out both }
.score-pop { animation: pop .6s cubic-bezier(.2,.8,.2,1) both }
.shake { animation: shake .5s ease-in-out }
.unlock { animation: unlock .7s ease-out both }
.glow { animation: glow 3s ease-in-out infinite }
.glow-green { animation: glowGreen 1.8s ease-in-out infinite }
.dot { animation: dot 1.2s infinite ease-in-out }
.mic-pulse { animation: micPulse 1.2s infinite }
.bar-grow { transform-origin: bottom; animation: barGrow 1s cubic-bezier(.2,.8,.2,1) both }
::-webkit-scrollbar { width: 8px; height: 8px } ::-webkit-scrollbar-thumb { background: rgb(51 65 85); border-radius: 8px } ::-webkit-scrollbar-track { background: transparent }
`;

const DEFAULT_CFG = { role: "", company: "", level: "Semi-Senior", language: "Español", jd: "", mode: "copilot" };

export default function EDIAInterviewCopilot() {
  const [screen, setScreen] = useState("landing");
  const [api, setApi] = useState({ key: "", model: "", status: "checking", error: "" });
  const [showApi, setShowApi] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT_CFG);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [preparing, setPreparing] = useState(false);
  const [toast, setToast] = useState("");
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 6000); return () => clearTimeout(t); }, [toast]);

  const connect = useCallback(async (conf) => {
    setApi({ key: conf.key, model: conf.model, status: "checking", error: "" });
    try {
      const ok = await pingAI(conf);
      setApi({ key: conf.key, model: conf.model, status: ok ? "online" : "offline", error: ok ? "" : "Respuesta inesperada" });
    } catch (err) {
      setApi({ key: conf.key, model: conf.model, status: "offline", error: err.message || "Sin conexión" });
    }
  }, []);

  useEffect(() => { connect({ key: "", model: "" }); }, [connect]);

  const apiFailed = useCallback((msg) => {
    setApi((a) => ({ ...a, status: "offline", error: msg }));
    setToast(`La IA no respondió (${(msg || "").slice(0, 80)}). EDIA activó el Modo Respaldo Local.`);
  }, []);

  const launch = async (c) => {
    setCfg(c);
    setPreparing(true);
    let qs;
    const started = Date.now();
    try {
      if (api.status === "offline") throw new Error("local");
      qs = await generateQuestionsAI(api, c);
    } catch (err) {
      if (err.message !== "local") apiFailed(err.message);
      qs = buildOfflineQuestions(c);
    }
    const wait = 900 - (Date.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    setQuestions(qs);
    setResults([]);
    setSessionKey((k) => k + 1);
    setPreparing(false);
    setScreen("workspace");
  };

  const goHome = () => {
    if (screen === "workspace" && !window.confirm("¿Salir de la simulación? Se perderá el progreso de esta sesión.")) return;
    setScreen("landing");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden">
      <style>{STYLES}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgb(148 163 184) 1px, transparent 1px), linear-gradient(90deg, rgb(148 163 184) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative">
        {screen !== "workspace" && <TopBrandBar api={api} onOpenApi={() => setShowApi(true)} onHome={goHome} />}
        {screen === "landing" && <Landing onStart={() => setScreen("setup")} />}
        {screen === "setup" && <Setup initial={cfg} onBack={() => setScreen("landing")} onLaunch={launch} loading={preparing} />}
        {screen === "workspace" && questions.length > 0 && (
          <Workspace key={sessionKey} cfg={cfg} api={api} questions={questions} onHome={goHome} onOpenApi={() => setShowApi(true)} setApiFailed={apiFailed} onFinish={(r) => { setResults(r); setScreen("report"); }} />
        )}
        {screen === "report" && (
          <Report cfg={cfg} questions={questions} results={results.length ? results : questions.map(() => ({ attempts: [], skipped: false }))} onRestart={() => setScreen("setup")} onHome={() => setScreen("landing")} />
        )}
      </div>

      {showApi && <ApiModal api={api} onSave={connect} onClose={() => setShowApi(false)} />}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] px-4 py-3 rounded-xl border border-amber-500/40 bg-slate-900/95 text-amber-200 text-sm shadow-2xl flex gap-2 fade-in">
          <AlertTriangle size={18} className="shrink-0 text-amber-400" /> {toast}
        </div>
      )}
    </div>
  );
}
