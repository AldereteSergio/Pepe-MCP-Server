/**
 * MCP Tool Schema Definitions
 * Comprehensive schemas for all available tools including descriptions, input/output schemas, examples, and metadata
 */
export const TOOL_SCHEMAS = [
    {
        name: "chat_perplexity",
        description: "Modo chat interactivo de Pepe. OBLIGATORIO PARA EL AGENTE: Aplicar SCQA para mantener la coherencia del hilo. Deconstruir la intención del usuario y proporcionar respuestas basadas en hechos frescos de la web. Pepe mantiene el historial; tu consulta debe ser un paso lógico en la investigación continua, integrando archivos adjuntos si es necesario.",
        category: "Conversation",
        keywords: ["pepe", "chat", "conversacion", "dialogo", "discusion", "historial", "contexto"],
        use_cases: [
            "Continuar conversaciones de varios turnos con Pepe.",
            "Análisis iterativo de temas complejos.",
            "Discutir y profundizar en archivos subidos.",
        ],
        inputSchema: {
            type: "object",
            properties: {
                message: {
                    type: "string",
                    description: "El mensaje para Pepe. Debe ser parte de un plan de investigación.",
                    examples: [
                        "Pepe, analiza los puntos de fricción en este mercado según lo que hablamos.",
                    ],
                },
                chat_id: {
                    type: "string",
                    description: "Opcional: ID de un chat existente. Si no se proporciona, Pepe inicia uno nuevo.",
                    examples: ["123e4567-e89b-12d3-a456-426614174000"],
                },
                model: {
                    type: "string",
                    description: "Opcional: El modelo de IA específico que Pepe debe usar (ej. 'Claude Sonnet 4.6').",
                    examples: ["Claude Sonnet 4.6", "GPT-5.4"],
                },
                attachments: {
                    type: "array",
                    items: { type: "string" },
                    description: "Opcional: Lista de rutas de archivos absolutas para que Pepe analice en el chat.",
                    examples: [["/home/user/documento.pdf"]],
                },
            },
            required: ["message"],
        },
        examples: [
            {
                description: "Pregunta con contexto",
                input: { message: "Pepe, ¿cómo afecta esto a nuestra situación actual?" },
                output: {
                    chat_id: "nuevo-id",
                    response: "Basado en la situación analizada...",
                },
            },
        ],
        related_tools: ["search", "deep_research"],
    },
    {
        name: "extract_url_content",
        description: "Extractor de contenido puro de Pepe. OBLIGATORIO PARA EL AGENTE: Usar cuando necesites datos crudos de una URL específica para alimentar tu análisis SCQA. Pepe limpia el ruido (anuncios, menús) y extrae el núcleo del texto. Soporta repositorios de GitHub.",
        category: "Information Extraction",
        keywords: [
            "pepe",
            "extraer",
            "url",
            "web",
            "contenido",
            "limpiar",
            "articulo",
            "github",
            "scraping",
        ],
        use_cases: [
            "Obtener el texto limpio de una noticia o blog.",
            "Analizar el README o código de un repo de GitHub.",
            "Proveer contexto real de una web a Pepe.",
        ],
        inputSchema: {
            type: "object",
            properties: {
                url: {
                    type: "string",
                    description: "La URL de la cual Pepe debe extraer el contenido.",
                    examples: ["https://www.ejemplo.com/articulo"],
                },
                depth: {
                    type: "number",
                    description: "Opcional: Profundidad de exploración de enlaces (1-5). Por defecto 1.",
                    minimum: 1,
                    maximum: 5,
                    default: 1,
                    examples: [1, 3],
                },
            },
            required: ["url"],
        },
        examples: [
            {
                description: "Extracción de artículo",
                input: { url: "https://ejemplo.com/noticia" },
                output: {
                    status: "Success",
                    content: [{ title: "Título", textContent: "Contenido..." }],
                },
            },
        ],
        related_tools: ["search", "get_documentation"],
    },
    {
        name: "get_documentation",
        description: "Recuperador de documentación técnica de Pepe. OBLIGATORIO PARA EL AGENTE: Aplicar SCQA para identificar qué falta en tu conocimiento técnico. Pepe busca fuentes oficiales y ejemplos de uso actualizados para resolver complicaciones de implementación.",
        category: "Technical Reference",
        keywords: ["pepe", "docs", "documentacion", "api", "referencia", "ejemplos", "libreria"],
        use_cases: [
            "Aprender nuevas tecnologías.",
            "Resolver errores de código con docs actualizadas.",
            "Encontrar ejemplos de implementación.",
        ],
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "El plan de investigación técnica detallado para Pepe.",
                    examples: ["SITUATION: ... COMPLICATION: ... OBJECTIVES: ..."],
                },
            },
            required: ["query"],
        },
        examples: [
            {
                description: "Búsqueda de documentación",
                input: { query: "SITUATION: Uso de React Hooks... OBJECTIVES: 1. Encontrar ejemplos de useEffect..." },
                output: {
                    response: "El hook useEffect permite realizar efectos secundarios...",
                },
            },
        ],
        related_tools: ["search", "check_deprecated_code"],
    },
    {
        name: "find_apis",
        description: "Descubridor de APIs de Pepe. OBLIGATORIO PARA EL AGENTE: Aplicar SCQA para definir el problema técnico que la API debe resolver. Pepe busca y compara opciones externas basadas en tus requerimientos de negocio y técnicos.",
        category: "API Discovery",
        keywords: ["pepe", "api", "integracion", "servicios", "endpoints", "sdk", "externo"],
        use_cases: [
            "Encontrar alternativas a servicios existentes.",
            "Evaluar APIs por costo o funcionalidad.",
            "Descubrir herramientas para nuevas features.",
        ],
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "El plan de descubrimiento de APIs detallado para Pepe.",
                    examples: ["SITUATION: ... COMPLICATION: ... OBJECTIVES: ..."],
                },
            },
            required: ["query"],
        },
        examples: [
            {
                description: "Búsqueda de APIs de pago",
                input: {
                    query: "SITUATION: Necesidad de pagos en Latam... OBJECTIVES: 1. Comparar Stripe vs locales...",
                },
                output: {
                    response: "PayPal ofrece procesamiento global...",
                },
            },
        ],
        related_tools: ["get_documentation", "search"],
    },
    {
        name: "check_deprecated_code",
        description: "Auditor de código de Pepe. OBLIGATORIO PARA EL AGENTE: Aplicar SCQA para entender el contexto del legado y los riesgos de la deuda técnica. Pepe verifica contra la web si existen mejores alternativas o si el código es obsoleto.",
        category: "Code Analysis",
        keywords: ["pepe", "depreciado", "obsoleto", "migracion", "upgrade", "deuda-tecnica"],
        use_cases: [
            "Preparar actualizaciones de dependencias.",
            "Identificar patrones de código antiguos.",
            "Asegurar compatibilidad futura.",
        ],
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "El plan de auditoría de código detallado para Pepe, incluyendo el fragmento de código.",
                    examples: ["SITUATION: Código legacy en React... COMPLICATION: componentWillMount..."],
                },
            },
            required: ["query"],
        },
        examples: [
            {
                description: "Auditoría de React",
                input: {
                    query: "SITUATION: Migración a React 18... COMPLICATION: Uso de componentWillMount... OBJECTIVES: ...",
                },
                output: {
                    response: "componentWillMount está depreciado en React 17+...",
                },
            },
        ],
        related_tools: ["get_documentation", "search"],
    },
    {
        name: "search",
        description: "Investigación web de alta densidad de Pepe. OBLIGATORIO PARA EL AGENTE: Aplicar SCQA + Primeros principios. Deconstruir la solicitud del usuario en puntos de investigación atómicos. Definir Situación, Complicación y Objetivos. Pepe es un ejecutor puro; tu consulta debe ser un plan de investigación profesional, no una simple pregunta.",
        category: "Web Search",
        keywords: ["pepe", "search", "busqueda", "web", "investigar", "informacion", "encontrar"],
        use_cases: [
            "Responder preguntas complejas con datos frescos.",
            "Validar hipótesis con información en tiempo real.",
            "Investigar mercados o tendencias con archivos adjuntos.",
        ],
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "El plan de investigación detallado para Pepe.",
                    examples: ["SITUATION: ... COMPLICATION: ... OBJECTIVES: ..."],
                },
                detail_level: {
                    type: "string",
                    enum: ["brief", "normal", "detailed"],
                    description: "Opcional: Nivel de detalle del reporte de Pepe.",
                    examples: ["brief", "detailed"],
                },
                model: {
                    type: "string",
                    description: "Opcional: Modelo Pro a usar (ej. 'Claude Sonnet 4.6').",
                    examples: ["Claude Sonnet 4.6"],
                },
                attachments: {
                    type: "array",
                    items: { type: "string" },
                    description: "Opcional: Rutas de archivos para que Pepe suba.",
                    examples: [["/home/user/imagen.jpg"]],
                },
                stream: {
                    type: "boolean",
                    description: "Opcional: Habilitar streaming (por defecto false).",
                    examples: [true],
                },
            },
            required: ["query"],
        },
        examples: [
            {
                description: "Búsqueda estructurada",
                input: { query: "SITUATION: Mercado X... OBJECTIVES: 1. Analizar precios..." },
                output: { response: "Análisis completo del mercado X..." },
            },
        ],
        related_tools: ["chat_perplexity", "deep_research"],
    },
    {
        name: "list_available_models",
        description: "Lista de modelos Pro de Pepe. Úsalo para saber qué motores de IA tienes disponibles en tu cuenta de Perplexity (Claude, GPT, Gemini, etc.) antes de lanzar una búsqueda avanzada con Pepe.",
        category: "Configuration",
        keywords: ["pepe", "modelos", "lista", "disponibles", "configuracion", "opciones"],
        use_cases: [
            "Verificar qué modelos Pro puede usar Pepe.",
            "Confirmar acceso a funciones premium.",
        ],
        inputSchema: {
            type: "object",
            properties: {},
        },
        examples: [
            {
                description: "Listar modelos",
                input: {},
                output: {
                    models: ["Sonar", "GPT-5.4", "Claude Sonnet 4.6"],
                },
            },
        ],
        related_tools: ["search", "chat_perplexity"],
    },
    {
        name: "deep_research",
        description: "Investigación profunda y multi-paso de Pepe. OBLIGATORIO PARA EL AGENTE: Aplicar SCQA + Primeros principios de forma exhaustiva. Este es el modo de mayor potencia; tu consulta debe ser un diseño de investigación completo. Pepe explorará múltiples fuentes para generar un reporte de élite.",
        category: "Web Search",
        keywords: ["pepe", "deep", "research", "profundo", "intensivo", "reporte", "analisis"],
        use_cases: [
            "Análisis de mercado de alto nivel.",
            "Investigaciones técnicas complejas.",
            "Generación de reportes estratégicos detallados.",
        ],
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "El diseño de investigación completo para Pepe.",
                    examples: ["SITUATION: ... COMPLICATION: ... OBJECTIVES: ..."],
                },
                attachments: {
                    type: "array",
                    items: { type: "string" },
                    description: "Opcional: Rutas de archivos para la investigación profunda de Pepe.",
                    examples: [["/home/user/datos.csv"]],
                },
            },
            required: ["query"],
        },
        examples: [
            {
                description: "Deep research estratégico",
                input: { query: "SITUATION: Expansión Latam... OBJECTIVES: 1. Evaluar competidores..." },
                output: { response: "Reporte estratégico de élite..." },
            },
        ],
        related_tools: ["search", "chat_perplexity"],
    },
];
