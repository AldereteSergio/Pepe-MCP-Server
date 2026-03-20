# 🐸 Pepe: Perplexity MCP Zerver (Español)

Un servidor de investigación de alta densidad que implementa el Protocolo de Contexto de Modelo (MCP) para ofrecer capacidades de investigación potenciadas por IA a través de la interfaz web de Perplexity.

[![Compatible con MCP](https://img.shields.io/badge/MCP-Compatible-333)]()
[![Base de código en TypeScript](https://img.shields.io/badge/TypeScript-Codebase-333)]()
[![Pruebas superadas](https://img.shields.io/badge/Tests-Passing-333)]()
[![Entorno Node.js](https://img.shields.io/badge/Runtime-Node.js-333)]()

## 📌 Índice
1. [Capacidades de Investigación](#capacidades-de-investigación)
2. [Herramientas Disponibles (Pepe Tools)](#herramientas-disponibles)
3. [Filosofía SCQA + Primeros Principios](#filosofía-scqa--primeros-principios)
4. [Comenzando (Instalación y Configuración)](#comenzando)
5. [Soporte para Cuentas Pro](#-soporte-para-cuentas-pro-opcional)
6. [Comparativa Técnica](#comparativa-técnica)
7. [Solución de Problemas](#solución-de-problemas)
8. [🚀 Roadmap y Visión Futura](ROADMAP.md)

---

## Capacidades de Investigación

- **Investigación Web Inteligente**: Busca y resume contenido sin límites de API.
- **Conversaciones Persistentes**: Mantén el contexto con almacenamiento local de chat en SQLite.
- **Extracción de Contenido**: Extracción limpia de artículos con soporte para repositorios de GitHub.
- **Herramientas para Desarrolladores**: Recuperación de documentación, descubrimiento de APIs y análisis de código.
- **Operación sin llaves**: La automatización del navegador reemplaza el requisito de llaves API.

---

## Herramientas Disponibles

### Buscar (`search`)
Realiza consultas de investigación con profundidad configurable.  
*Devuelve resultados en texto plano.*

### Obtener Documentación (`get_documentation`)
Recupera documentación técnica con ejemplos.  
*Devuelve documentación estructurada.*

### Encontrar APIs (`find_apis`)
Descubre APIs relevantes para necesidades de desarrollo.  
*Devuelve listados de APIs y descripciones.*

### Revisar Código Depreciado (`check_deprecated_code`)
Analiza fragmentos de código en busca de patrones obsoletos.  
*Devuelve un reporte de análisis.*

### Extraer Contenido de URL (`extract_url_content`)
Analiza contenido web con manejo automático de GitHub.  
*Devuelve metadatos de contenido estructurado.*

### Chat (`chat_perplexity`)
Conversaciones persistentes con historial de contexto.  
*Devuelve el estado de la conversación en formato JSON.*

---

## Filosofía SCQA + Primeros Principios

Pepe no es un buscador convencional; es un **ejecutor de planes de investigación**. Para obtener resultados de élite, el agente (tú) debe aplicar:

1.  **SCQA**: Definir la **S**ituación, la **C**omplicación, la **Q**ueja (Pregunta) y la **A**cción (Respuesta esperada).
2.  **Primeros Principios**: Deconstruir problemas complejos en sus verdades fundamentales antes de investigar.

Las descripciones de las herramientas están optimizadas para forzar este comportamiento en los modelos de lenguaje.

---

## Comenzando

### Requisitos Previos
- Node.js 18+ (Recomendado v20+)
- npm (incluido con Node.js)

### Instalación
```bash
git clone https://github.com/tu-usuario/perple.git
cd perple
npm install
npm run build
```

### Configuración
Añade esto a tu archivo de configuración de MCP (ej. `mcp.json` en Cursor):
```json
{
  "mcpServers": {
    "perple": {
      "command": "node",
      "args": ["/ruta/absoluta/a/perple/build/main.js"],
      "timeout": 300
    }
  }
}
```

### Uso
Inicia comandos a través de tu cliente MCP:
- "Usa perplexity para investigar avances en computación cuántica"
- "Pregunta a perple por la documentación de React 18"
- "Inicia una conversación con perplexity sobre redes neuronales"

---

## 🔐 Soporte para Cuentas Pro (Opcional)

Usa tu suscripción de Perplexity Pro para acceder a mejores modelos (Claude 3.5 Sonnet, GPT-4o) y límites más altos.

### Configuración Única
```bash
npm run build
npm run login
```

Se abrirá una ventana del navegador. **Inicia sesión usando correo electrónico** (recomendado para mejor compatibilidad), luego cierra el navegador. ¡Tu sesión quedará guardada!

> **Nota**: El inicio de sesión con Google/SSO puede funcionar, pero el correo electrónico es más confiable con la automatización del navegador.

### Variables de Entorno

| Variable | Por defecto | Descripción |
|----------|---------|-------------|
| `PERPLEXITY_BROWSER_DATA_DIR` | `~/.perplexity-mcp` | Directorio del perfil del navegador |
| `PERPLEXITY_PERSISTENT_PROFILE` | `true` | Cambia a `false` para modo anónimo |

---

## Comparativa Técnica

| Característica       | Esta Implementación | APIs Tradicionales |
|----------------------|---------------------|-------------------|
| Autenticación        | No requerida        | Llaves API        |
| Costo                | Gratis              | Basado en uso     |
| Privacidad de Datos  | Procesamiento local | Servidores remotos|
| Integración GitHub   | Soporte nativo      | Limitado          |
| Persistencia Historial| Almacenamiento SQLite| Basado en sesión  |

---

## Solución de Problemas

**Problemas de Conexión del Servidor**
1. Verifica la ruta absoluta en la configuración.
2. Confirma la instalación de Node.js con `node -v`.
3. Asegúrate de que la compilación terminó con éxito (`npm run build`).

**Extracción de Contenido**
- Las rutas de GitHub deben usar URLs completas del repositorio.
- Ajusta la profundidad de recursión de enlaces en la configuración de origen.

---

## Orígenes y Licencia
 
Basado en - [DaInfernalCoder/perplexity-researcher-mcp](https://github.com/DaInfernalCoder/perplexity-researcher-mcp)  
Refactorizado de - [sm-moshi/docshunter](https://github.com/sm-moshi/docshunter)  

Licenciado bajo **GNU GPL v3.0** - [Ver Licencia](LICENSE)

---

> Este proyecto interactúa con Perplexity a través de la automatización del navegador. Úsalo de manera responsable y ética. La estabilidad depende de la consistencia del sitio web de Perplexity. Solo para uso educativo.
