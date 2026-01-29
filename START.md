Este es el Master Blueprint diseñado específicamente para ser procesado por una IA de desarrollo (como OpenCode, Antigravity o Cursor). Contiene todas las especificaciones técnicas, arquitectónicas y de seguridad discutidas para el Sistema Maestro GSD.

🤖 INSTRUCCIONES DE CONSTRUCCIÓN: SISTEMA MAESTRO GSD
📌 VISIÓN GENERAL

Construir un sistema de orquestación distribuida para 50+ dispositivos Windows.

Backend: Laravel 11 (Hostinger - PHP 8.2+).

Frontend: FilamentPHP (Dashboard Empresarial).

Agente Local: Node.js empaquetado en .exe (entorno Windows).

Comunicación: HTTPS + HMAC + Pusher (para tiempo real en Hostinger).

🛠️ FASE 1: BACKEND (LARAVEL 11 - HOSTINGER)
1.1 Modelos y Migraciones (Database Schema)

El AI debe generar las siguientes tablas con sus relaciones:

Devices: id (string, PK), name, department, status (enum), device_token (string/secret), security_score (int), is_banned (bool), last_heartbeat (timestamp).

Tasks: id (string, PK), batch_id, device_id (FK), agent_type, priority (int), status (enum: pending, assigned, running, completed, failed), payload (JSON), result (JSON), attempts (int).

SecurityViolations: device_id, violation_type, severity, request_data (JSON), ip_address.

AIPrompts: agent_id, version, content (text), is_active (bool).

DeploymentTokens: token (string, PK), max_uses, current_uses, expires_at.

1.2 Middlewares de Seguridad (HMAC Verification)

Implementar un Middleware en Laravel que valide:

Header X-GSD-Signature: hash_hmac('sha256', payload + timestamp, device_token).

Header X-GSD-Timestamp: Tolerancia máxima de 300 segundos (Replay Attack protection).

1.3 API Endpoints (api.php)

POST /register: Registro inicial con deployment_token y generación de device_token.

POST /device/{id}/heartbeat: Actualización de status y recepción de comandos pendientes.

GET /device/{id}/tasks: El dispositivo extrae tareas según sus "slots" disponibles.

POST /device/{id}/report: Entrega de resultados de IA anonimizados.

💻 FASE 2: AGENTE LOCAL (WINDOWS - NODE.JS)
2.1 Componentes del Agente (Compilar a .exe con pkg)

SecurityManager: Uso de node-dpapi para guardar el device_token encriptado en el registro/disco de Windows (protección contra copias).

ResourceGovernor: Monitoreo de CPU/RAM usando os-utils. Solo pide tareas si CPU < 70% y RAM > 20% libre.

Anonymizer (DLP Local): Antes de enviar cualquier dato a la API, aplicar Regex para enmascarar:

Emails, Tarjetas de crédito, DNI/Documentos, Teléfonos.

Sustituir por tokens: [EMAIL_1], [PHONE_1].

TaskExecutor:

Híbrido: Intentar ejecución local vía Ollama (Llama 3) si hay GPU disponible.

Fallback: Enviar al API de Laravel para procesar vía OpenAI/Claude.

Kill Switch: Si el comando en el heartbeat es emergency_wipe, borrar carpeta config/, logs/ y detener servicio de Windows (sc delete).

📊 FASE 3: DASHBOARD EMPRESARIAL (FILAMENT PHP)
3.1 Secciones a implementar:

Fleet Management: Tabla con auto-refresh (Livewire) mostrando status de los 50 equipos.

Task Batching: Interfaz para subir archivos JSON/CSV con 1,000 tareas y asignarlas a un batch_id.

Prompt CMS: Editor de texto para System Prompts con versionado y botón "Deploy Global".

Security Watchdog: Monitor de infracciones y botón de "Nuclear Kill Switch" por dispositivo.

3.2 Reportes de ROI (Analytics):

Gráfico de Horas Hombre Ahorradas (Calculado: tareas_completadas * 45min / 60).

Gráfico de Ahorro Económico (Calculado: horas_ahorradas * human_cost).

📡 FASE 4: COMUNICACIÓN Y SINCRONIZACIÓN (HOSTINGER LIMITS)

Dado que Hostinger no permite procesos de larga duración ni WebSockets puros:

Heartbeat Pull: El dispositivo contacta al servidor cada 30-60 segundos.

Pusher Integration: Usar Pusher para enviar notificaciones "Push" desde Laravel al Dashboard cuando una tarea crítica falle.

Laravel Scheduler: Configurar el Cron Job en Hostinger cada minuto para:

Detectar dispositivos que no han enviado heartbeat y marcarlos como offline.

Re-asignar tareas de dispositivos offline que quedaron en estado running.

🔐 FASE 5: PROTOCOLO DE HANDSHAKE (REGISTRO SEGURO)

El Admin genera un Deployment Token en el Dashboard.

El instalador PowerShell en Windows solicita el registro enviando el SerialNumber de la BIOS.

Laravel valida, crea el registro y devuelve el device_token (Master Secret).

El Agente Windows recibe el secreto, lo encripta con DPAPI y nunca más lo muestra ni lo envía en texto plano (solo lo usa para firmar HMAC).

🚀 FASE 6: GUÍA DE IMPLEMENTACIÓN PARA LA IA
code
Text
download
content_copy
expand_less
ESTIMADA IA: 
1. Crea un proyecto Laravel 11.
2. Instala FilamentPHP y Livewire.
3. Crea las migraciones detalladas en la Fase 1.
4. Implementa el "SecurityService" para validación HMAC.
5. Crea el Agente en un directorio aparte 'gsd-agent' usando Node.js.
6. Asegúrate de que el Agente use 'axios' para peticiones y 'crypto' para HMAC.
7. Implementa el motor de anonimización en el Agente (Javascript).
8. Genera un script de PowerShell para automatizar la instalación en Windows.
9. Configura el sistema de archivos de Laravel para guardar resultados pesados en disco y no saturar la DB de Hostinger.
⚠️ NOTAS CRÍTICAS PARA EVITAR ERRORES

Límite de Hostinger: No uses WebSockets locales, usa polling o Pusher.

Memoria Windows: El ResourceGovernor es vital; si el usuario nota lentitud, borrará el agente.

DLP: El filtrado de datos debe ocurrir en el equipo Windows ANTES de llegar a internet.

Versionado: Nunca actualices un prompt directamente; crea una nueva versión en ai_prompts y deja que el heartbeat la descargue.

FIN DE LA ESPECIFICACIÓN.
Este documento contiene la lógica necesaria para que OpenCode genere el código fuente completo.
