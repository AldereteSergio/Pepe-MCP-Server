/**
 * MCP tool schemas. Descriptores compactos; alineados a CPQO en skill `pepe-research-brief`.
 */

/** Texto único: CONTEXT · PROBLEM · QUESTIONS (lista) · OBJECTIVES (numerados). Opcional SCOPE/NON-GOALS. */
const Q_CPQO =
  "Un solo string CPQO (skill pepe-research-brief): CONTEXT · PROBLEM · QUESTIONS (bullets) · OBJECTIVES (1..n numerados). Opcional SCOPE/NON-GOALS.";

const E_CPQO_MIN =
  "CONTEXT: Servicio Node en prod. PROBLEM: Picos CPU sin correlación. QUESTIONS:\\n- ¿Patrones típicos de cuello?\\nOBJECTIVES:\\n(1) Hipótesis ordenadas\\n(2) Cómo aislar DB vs app";

export const TOOL_SCHEMAS = [
  {
    name: "chat_perplexity",
    description:
      "Hilo conversacional con Pepe; guarda contexto (chat_id). Usa CPQO en `message` o turnos cortos si el hilo ya cargó el brief.",
    category: "Conversation",
    keywords: ["pepe", "chat", "historial", "cpqo", "mcp"],
    use_cases: ["Iterar tras search", "Aclarar un hallazgo con el mismo chat_id"],
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: `${Q_CPQO} Follow-up: puede acotarse si CONTEXT ya está en el historial.`,
          examples: [
            "CONTEXT: Mismo DD que antes. PROBLEM: Falta competidor X. QUESTIONS: ¿Pricing 2025? OBJECTIVES: (1) Tabla planes (2) URLs",
          ],
        },
        chat_id: {
          type: "string",
          description: "Opcional. Mismo ID = continuar hilo; omitir = chat nuevo.",
          examples: ["123e4567-e89b-12d3-a456-426614174000"],
        },
        model: {
          type: "string",
          description: "Opcional. Modelo Pro Perplexity (p.ej. list_available_models).",
          examples: ["Claude Sonnet 4.6"],
        },
        attachments: {
          type: "array",
          items: { type: "string" },
          description: "Opcional. Rutas absolutas de archivos.",
          examples: [["/home/u/doc.pdf"]],
        },
      },
      required: ["message"],
    },
    examples: [
      {
        description: "Turno con CPQO",
        input: {
          message:
            "CONTEXT: API interna. PROBLEM: 503 intermitente. QUESTIONS: ¿Qué revisar primero? OBJECTIVES: (1) Checklist (2) Docs comunes",
        },
        output: { response: "Respuesta Pepe con síntesis y siguientes pasos." },
      },
    ],
    related_tools: ["search", "deep_research"],
  },
  {
    name: "extract_url_content",
    description:
      "Texto limpio de una URL (menos ruido que la página). No reemplaza CPQO en search; sirve para traer evidencia puntual.",
    category: "Information Extraction",
    keywords: ["pepe", "url", "extraer", "articulo", "github"],
    use_cases: ["Citar una fuente concreta", "README o issue de GitHub"],
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL a extraer.",
          examples: ["https://example.com/post"],
        },
        depth: {
          type: "number",
          description: "Opcional. Profundidad de enlaces internos 1–5 (defecto 1).",
          minimum: 1,
          maximum: 5,
          default: 1,
          examples: [1, 2],
        },
      },
      required: ["url"],
    },
    examples: [
      {
        description: "Una página",
        input: { url: "https://example.com/doc" },
        output: { status: "Success", content: [{ title: "T", textContent: "…" }] },
      },
    ],
    related_tools: ["search", "get_documentation"],
  },
  {
    name: "get_documentation",
    description:
      "Buscar documentación y ejemplos oficiales vía Pepe. `query` en CPQO: qué stack, qué falla, qué entregables (snippets, breaking changes, etc.).",
    category: "Technical Reference",
    keywords: ["pepe", "docs", "api", "referencia"],
    use_cases: ["Onboarding en librería", "Error de integración con fuentes actuales"],
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: Q_CPQO,
          examples: [E_CPQO_MIN],
        },
      },
      required: ["query"],
    },
    examples: [
      {
        description: "Docs React",
        input: {
          query:
            "CONTEXT: App con React 19. PROBLEM: Hydration warnings. QUESTIONS: ¿Cambios vs 18? OBJECTIVES: (1) Lista breaking (2) Link docs oficiales",
        },
        output: { response: "Síntesis + enlaces a documentación relevante." },
      },
    ],
    related_tools: ["search", "check_deprecated_code"],
  },
  {
    name: "find_apis",
    description:
      "Descubrir/comparar APIs externas vía Pepe. `query` en CPQO: restricciones (región, SLA, presupuesto), preguntas de comparación, objetivos medibles.",
    category: "API Discovery",
    keywords: ["pepe", "api", "integracion", "saas"],
    use_cases: ["Elegir proveedor", "Alternativas a un vendor"],
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: Q_CPQO,
          examples: [E_CPQO_MIN],
        },
      },
      required: ["query"],
    },
    examples: [
      {
        description: "Pagos LATAM",
        input: {
          query:
            "CONTEXT: Checkout B2C. PROBLEM: Stripe caro en moneda local. QUESTIONS: ¿Alternativas con presencia LATAM? OBJECTIVES: (1) Comparativa 3 opciones (2) Fees públicos",
        },
        output: { response: "Comparativa breve con fuentes." },
      },
    ],
    related_tools: ["get_documentation", "search"],
  },
  {
    name: "check_deprecated_code",
    description:
      "Contrastar código o patrones con estado actual en la web. `query` en CPQO: stack, snippet o patrón, y qué certeza necesitás (reemplazo, fecha deprecación, migración).",
    category: "Code Analysis",
    keywords: ["pepe", "deprecado", "migracion", "legado"],
    use_cases: ["Antes de bump mayor", "Auditar API obsoleta en el repo"],
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: `${Q_CPQO} Incluir código o identificadores en CONTEXT/OBJECTIVES.`,
          examples: [
            "CONTEXT: React 18 class component. PROBLEM: lifecycle legacy. QUESTIONS: ¿Qué API reemplaza X? OBJECTIVES: (1) Migración mínima (2) Doc oficial",
          ],
        },
      },
      required: ["query"],
    },
    examples: [
      {
        description: "API deprecada",
        input: {
          query:
            "CONTEXT: Node 18 + librería Z. PROBLEM: warning deprecación. QUESTIONS: ¿Versión sustituta? OBJECTIVES: (1) API nueva (2) Ejemplo mínimo",
        },
        output: { response: "Estado de la API y pistas de migración." },
      },
    ],
    related_tools: ["get_documentation", "search"],
  },
  {
    name: "search",
    description:
      "Investigación web en una pasada (Perplexity). Elegí `detail_level`: brief ≈1–2 objetivos, normal ≈3–5, detailed ≈6–8 en OBJECTIVES (skill pepe-research-brief). Para informe amplio multi-fuente usá `deep_research`.",
    category: "Web Search",
    keywords: ["pepe", "search", "cpqo", "investigar", "web"],
    use_cases: ["Síntesis con fuentes", "Pregunta acotada con CPQO"],
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: Q_CPQO,
          examples: [E_CPQO_MIN],
        },
        detail_level: {
          type: "string",
          enum: ["brief", "normal", "detailed"],
          description:
            "Opcional. Alineado a skill: brief | normal | detailed ≈ cantidad de OBJECTIVES (1–2 / 3–5 / 6–8).",
          examples: ["brief", "detailed"],
        },
        model: {
          type: "string",
          description: "Opcional. Modelo Pro (ver list_available_models).",
          examples: ["Claude Sonnet 4.6"],
        },
        attachments: {
          type: "array",
          items: { type: "string" },
          description: "Opcional. Rutas absolutas (imagen, PDF, etc.).",
          examples: [["/home/u/captura.png"]],
        },
        stream: {
          type: "boolean",
          description: "Opcional. Streaming de salida (defecto false).",
          examples: [false],
        },
      },
      required: ["query"],
    },
    examples: [
      {
        description: "search + detail_level",
        input: {
          query:
            "CONTEXT: Competidor fintech. PROBLEM: Datos públicos dispersos. QUESTIONS: ¿Posicionamiento 18m? OBJECTIVES: (1) Hechos verificables (2) Lagunas (3) URLs",
          detail_level: "brief",
        },
        output: { response: "Resumen con fuentes y límites de lo inferible." },
      },
    ],
    related_tools: ["chat_perplexity", "deep_research"],
  },
  {
    name: "list_available_models",
    description:
      "Lista modelos Pro disponibles en tu cuenta Perplexity antes de fijar `model` en search/chat.",
    category: "Configuration",
    keywords: ["pepe", "modelos", "perplexity", "config"],
    use_cases: ["Elegir motor", "Comprobar acceso Pro"],
    inputSchema: {
      type: "object",
      properties: {},
    },
    examples: [
      {
        description: "Listar",
        input: {},
        output: { models: ["Sonar", "Claude Sonnet 4.6"] },
      },
    ],
    related_tools: ["search", "chat_perplexity"],
  },
  {
    name: "deep_research",
    description:
      "Modo investigación amplia (más pasadas/fuentes que `search`). Mismo CPQO; suele requerir muchos OBJECTIVES (≥6 si el tema es grande). Skill pepe-research-brief.",
    category: "Web Search",
    keywords: ["pepe", "deep", "research", "informe", "cpqo"],
    use_cases: ["Informe estratégico", "Mapa de literatura o mercado"],
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: Q_CPQO,
          examples: [E_CPQO_MIN],
        },
        attachments: {
          type: "array",
          items: { type: "string" },
          description: "Opcional. Rutas absolutas (datasets, PDFs).",
          examples: [["/home/u/informe.pdf"]],
        },
      },
      required: ["query"],
    },
    examples: [
      {
        description: "Informe amplio",
        input: {
          query:
            "CONTEXT: Mercado editorial Asia→Latam. PROBLEM: Acuerdos poco documentados. QUESTIONS: (varias subpreguntas sector). OBJECTIVES: (1)…(8) mapa de fuentes y vacíos",
        },
        output: { response: "Reporte largo multi-sección con referencias." },
      },
    ],
    related_tools: ["search", "chat_perplexity"],
  },
] as const;
