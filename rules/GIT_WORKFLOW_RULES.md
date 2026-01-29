# 🤖 AI Agent: GitHub Master Protocol
**Project:** hotmart-automation
**Role:** DevOps & Project Manager AI
**Date:** 2026

Este documento sirve como la **Fuente de la Verdad** para el Agente de AI encargado de gestionar el repositorio. El objetivo es mantener un proyecto profesional, documentado y listo para auditoría o venta.

---

## 1. 🏛️ Estructura y Reglas de Ramas (Code)
**Estado:** `main` es sagrada. `dev` es la zona de integración.

* **`main` (Production):** 🛑 **PROTEGIDA**. Prohibido commit directo. Solo acepta merges desde `dev` vía Pull Request (PR) aprobado.
* **`dev` (Staging):** Rama base para todo desarrollo. Debe estar siempre sincronizada antes de crear nuevas ramas.
* **Ramas de Trabajo:** Nomenclatura obligatoria vinculada a Issues.
    * `feature/ID-descripcion-corta` (Nuevas funciones)
    * `fix/ID-descripcion-corta` (Corrección de errores)
    * `hotfix/ID-descripcion-corta` (Errores críticos en main)
    * `docs/ID-descripcion-corta` (Documentación)

---

## 2. 📋 Gestión de Tareas (Issues & Projects)
**Regla de Oro:** "No ticket, no code".

1.  **Issues:** Antes de escribir una línea de código, debe existir un Issue.
    * Labels obligatorios: `bug`, `enhancement`, `documentation`, `wontfix`.
2.  **Projects (Kanban):**
    * Todo Issue nuevo va a la columna **Todo**.
    * Al crear rama, mover a **In Progress**.
    * Al crear PR, mover a **Review**.
    * Al cerrar PR, mover a **Done**.

---

## 3. 🛠️ Comandos de Activación (Triggers)
El agente debe escuchar estos comandos en el prompt para iniciar el **Ciclo de Vida Completo**:

| Trigger | Acción Automatizada (Flujo) | Ejemplo de Rama |
| :--- | :--- | :--- |
| **`/FEA: [Titulo]`** | 1. Crea Issue "Feature: [Titulo]" <br> 2. Crea rama desde `dev` <br> 3. Genera código <br> 4. Sube cambios | `feature/15-nuevo-login` |
| **`/FIX: [Error]`** | 1. Crea Issue "Bug: [Error]" <br> 2. Crea rama desde `dev` <br> 3. Corrige código <br> 4. Sube cambios | `fix/16-error-menu` |
| **`/HOT: [Error]`** | 1. Crea Issue "Hotfix: [Error]" <br> 2. Crea rama desde **`main`** <br> 3. Corrige código <br> 4. Sube cambios urgentes | `hotfix/17-crash-servidor` |
| **`/DOC: [Tema]`** | 1. Crea Issue "Docs: [Tema]" <br> 2. Crea rama desde `dev` <br> 3. Actualiza MD/Wiki <br> 4. Sube cambios | `docs/18-guia-usuario` |

---

## 4. 🔄 Protocolo de Pull Requests (PR)
El agente debe usar la CLI de GitHub (`gh`) para crear PRs con esta plantilla:

**Titulo:** `[Tipo] Titulo del cambio (#ID_Issue)`
**Cuerpo del PR:**
```markdown
## 📝 Descripción
[Resumen claro de qué hace este código]

## 🔗 Issue Relacionado
Closes #[ID]

## ✅ Checklist de Calidad
- [ ] El código pasa el linter (Clean Code).
- [ ] Se han agregado/actualizado tests (GitHub Actions).
- [ ] Documentación actualizada.

5. 🚦 Integración Continua (GitHub Actions)
El agente debe verificar el estado de los Actions antes de sugerir un merge.

Si el Action falla (❌), la prioridad #1 es arreglar el código.

Si el Action pasa (✅), se puede proceder al Review.

📚 Recursos de Aprendizaje para el Agente
Usa estos enlaces para entender la sintaxis y comandos necesarios:

CLI Manual: https://cli.github.com/manual/

Project Automation: https://docs.github.com/en/issues/planning-and-tracking-with-projects

Flow Strategy: https://docs.github.com/en/get-started/using-github/github-flow