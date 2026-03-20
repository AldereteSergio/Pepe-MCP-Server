# 🐸 Pepe Roadmap: El Futuro de la Investigación de Alta Densidad

Este documento detalla la visión y las próximas funcionalidades planeadas para **Pepe**, el servidor MCP de Perplexity optimizado para agentes de IA.

## 🚀 Próximas Implementaciones (Q2 2026)

### 1. 🎯 Focus Mode (Filtros de Búsqueda)
Implementar el selector de fuentes nativo de Perplexity para refinar la búsqueda desde el inicio.
- **Parámetro**: `focus` (enum: `web`, `academic`, `social`, `writing`, `video`, `reddit`).
- **Estado**: Pendiente de escaneo de DOM.
- **Utilidad**: Búsquedas especializadas en artículos científicos o debates en redes sociales.

### 2. 📚 Gestión de Colecciones (AI Profiles)
Integración con las colecciones de Perplexity Pro para mantener contextos persistentes por proyecto.
- **Funcionalidad**: Listar colecciones, crear nuevas y asignar hilos de chat a colecciones específicas.
- **Utilidad**: Separar investigaciones de mercado de auditorías de código.

### 3. 🔗 Extracción Estructurada de Citas
Evolucionar el extractor de contenido para mapear las citas numéricas `[1]` a sus URLs correspondientes.
- **Formato**: Devolver un objeto JSON con `answer` y `citations: { [id: number]: url: string }`.
- **Utilidad**: Verificabilidad total y reducción de alucinaciones.

### 4. 📂 Integración Local Profunda
Permitir que Pepe analice directorios completos del workspace antes de realizar una búsqueda.
- **Funcionalidad**: Herramienta `analyze_local_context` que pre-procesa archivos locales para alimentar el prompt de Perplexity.
- **Utilidad**: "Pepe, compará mi implementación de `AuthService.ts` con las mejores prácticas actuales de Next.js 15".

---

## 🛠️ Mejoras de Infraestructura

- [ ] **Streaming Nativo**: Habilitar el soporte de streaming real a través del transporte MCP para respuestas en tiempo real.
- [ ] **Auto-Recovery Pro**: Mejorar la detección de desafíos de Cloudflare y la recuperación automática de sesiones caídas.
- [ ] **Multi-Account Support**: Permitir rotación de cuentas premium si se alcanzan los límites de Deep Research.

---

## 🧠 Filosofía de Desarrollo: SCQA + First Principles
Pepe no es solo un buscador; es un **ejecutor de planes de investigación**. Cada nueva funcionalidad debe potenciar la capacidad del agente para deconstruir problemas complejos y obtener verdades fundamentales de la web.

---
*Última actualización: 20 de Marzo, 2026*
