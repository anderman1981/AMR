# 📚 AMROIS - Sistema de Gestión Inteligente de Biblioteca Personal

## 🎯 **Qué hace el sistema**

**AMROIS** es una plataforma de gestión de biblioteca personal que utiliza **Inteligencia Artificial** para transformar libros digitales (PDF, EPUB, MOBI) en conocimiento accionable.

---

## ✨ **Funcionalidades Principales**

### 1. **Gestión de Libros**
- Escaneo automático de directorios
- Soporte multi-formato (PDF, EPUB, MOBI, TXT, DOCX)
- Extracción automática de texto
- Visualizador integrado de documentos

### 2. **Análisis Inteligente con IA**
- **Resúmenes automáticos**: Genera análisis estructural de cada libro
- **Extracción de insights**: Identifica ideas clave y tareas accionables
- **Generación de citas**: Extrae las mejores frases para compartir
- **Formularios interactivos**: Detecta y extrae ejercicios/cuestionarios del libro

### 3. **Coach Literario AI**
- **Chat por libro**: Conversa con un coach especializado en cada libro
- **Chat global**: Consulta toda tu biblioteca simultáneamente
- **Búsqueda contextual (RAG)**: Respuestas basadas en el contenido real de tus libros
- **Recomendaciones personalizadas**: Sugiere lecturas según tus objetivos

### 4. **Sistema Multi-Agente**
- **Agentes especializados** que procesan libros en background
- **Cola de tareas** para procesamiento asíncrono
- **Monitoreo en tiempo real** del progreso
- **Arquitectura escalable** para múltiples dispositivos

---

## 🏗️ **Arquitectura Técnica**

### **Backend**
- **Node.js + Express**: API REST
- **SQLite**: Base de datos ligera y portable
- **Ollama**: LLM local (privacidad total, sin costos de API)
- **Better-sqlite3**: Alto rendimiento en queries

### **Frontend**
- **React + Vite**: Interfaz moderna y rápida
- **Ant Design**: Componentes UI profesionales
- **React Query**: Gestión de estado y cache
- **Foliate.js**: Lector de ebooks avanzado

### **IA/ML**
- **Ollama (LLaMA 3)**: Modelo local para generación de texto
- **RAG (Retrieval-Augmented Generation)**: Búsqueda contextual en biblioteca
- **Multi-provider support**: Preparado para OpenAI, Anthropic, Google

---

## 💼 **Propuesta de Valor Comercial**

### **Diferenciadores**
1. ✅ **100% Local-First**: Sin dependencia de APIs externas (privacidad total)
2. ✅ **Costo $0 en IA**: Usa modelos open-source locales
3. ✅ **Multi-formato**: Soporta todos los formatos populares
4. ✅ **Coach personalizado**: No solo resume, sino que enseña y guía
5. ✅ **Extracción de formularios**: Única en el mercado para libros de autoayuda

### **Casos de Uso**
- 📖 **Estudiantes**: Resúmenes automáticos, extracción de conceptos clave
- 💼 **Profesionales**: Gestión de biblioteca técnica, búsqueda rápida de información
- 🧠 **Coaches/Terapeutas**: Biblioteca de recursos con acceso instantáneo
- 📚 **Lectores ávidos**: Organización y aprovechamiento máximo de lecturas

### **Modelos de Negocio Posibles**
1. **SaaS B2C**: $9.99/mes - Biblioteca personal ilimitada
2. **Licencia Empresarial**: $499/año - Para equipos y organizaciones
3. **White Label**: Venta a editoriales/plataformas educativas
4. **Freemium**: 10 libros gratis, ilimitado con suscripción

---

## 📊 **Estado Actual del Proyecto**

### **Funcionalidades Implementadas** ✅
- [x] Gestión completa de libros (CRUD)
- [x] Extracción de texto multi-formato
- [x] Análisis con IA (resúmenes, insights, citas)
- [x] Chat por libro con contexto
- [x] Chat global con búsqueda RAG
- [x] Visualizador de PDFs/EPUBs
- [x] Sistema de agentes en background
- [x] Dashboard con estadísticas
- [x] Extracción de formularios interactivos

### **Tecnología Probada** ✅
- [x] API REST funcional (puertos 3464/3467)
- [x] Base de datos SQLite optimizada
- [x] Integración Ollama (LLaMA 3)
- [x] Frontend React responsive
- [x] Sistema de tareas asíncronas

---

## 🚀 **Viabilidad Comercial**

### **Fortalezas**
- ✅ **MVP funcional** y demostrable
- ✅ **Stack moderno** y escalable
- ✅ **Costo operativo bajo** (sin APIs de pago)
- ✅ **Diferenciación clara** vs competencia
- ✅ **Mercado en crecimiento** (EdTech, Productividad)

### **Próximos Pasos para Comercialización**
1. **Pulir UX/UI**: Diseño más atractivo y onboarding
2. **Testing con usuarios**: Validar propuesta de valor
3. **Deployment cloud**: Versión SaaS con Ollama en servidor
4. **Landing page**: Marketing y captación de early adopters
5. **Pricing strategy**: Definir modelo de suscripción

---

## 🎯 **Resumen Ejecutivo**

**AMROIS** es una plataforma de gestión de biblioteca personal con IA que transforma libros en conocimiento accionable. Utiliza tecnología local-first (Ollama + LLaMA 3) para ofrecer análisis inteligente, chat contextual y extracción de insights sin costos recurrentes de API.

**Mercado objetivo**: Estudiantes, profesionales, coaches y lectores que buscan maximizar el valor de sus lecturas.

**Diferenciador clave**: Coach literario personalizado con búsqueda RAG en toda la biblioteca, extracción de formularios y procesamiento 100% local.

**Estado**: MVP funcional, listo para validación con usuarios y refinamiento comercial.

---

## 📸 **Capturas de Pantalla**

### Dashboard Principal
- Estadísticas en tiempo real
- Chat global con Coach AI
- Métricas de procesamiento

### Vista de Libro
- Visualizador de PDF/EPUB integrado
- Análisis estructural generado por IA
- Chat contextual por libro
- Extracción de citas y formularios

### Sistema de Agentes
- Procesamiento en background
- Cola de tareas con progreso
- Monitoreo de salud del sistema

---

## 🔧 **Requisitos Técnicos**

### **Para Desarrollo**
- Node.js 20+
- Ollama instalado localmente
- 8GB RAM mínimo
- 10GB espacio en disco

### **Para Producción (SaaS)**
- Servidor con GPU (para Ollama)
- 16GB RAM mínimo
- PostgreSQL (migración desde SQLite)
- CDN para assets estáticos

---

## 📞 **Contacto**

Para más información sobre licenciamiento, demostración o inversión:
- **Email**: [Tu email]
- **Demo**: [URL del demo]
- **Documentación**: Ver `README.md` en el repositorio
