# AMR Project - Entornos Separados (DEV y MAIN)

## 🏗️ Estructura de Entornos

### Entorno de Desarrollo (DEV) - Actual
**Ubicación:** `/Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR`

#### Características DEV:
- **Base de Datos:** `amrois_dev_system`
- **Usuario DB:** `amrois_dev_user`
- **Puertos:** 
  - API: `5467` (interno: 4123)
  - Dashboard: `5468` (interno: 80)
  - PostgreSQL: `5532`
  - Redis: `6380`
  - Ollama: `11435`
  - Nginx: `8080/8443`
- **Contenedores:** Todos con sufijo `-dev`
- **Environment:** `NODE_ENV=development`

---

### Entorno de Producción (MAIN) - Por Crear
**Ubicación Sugerida:** `/Users/andersonmartinezrestrepo/MAIN-PROJECTS/AMR` o similar

#### Características MAIN (Estándar):
- **Base de Datos:** `amrois_system`
- **Usuario DB:** `amrois_user`
- **Puertos:**
  - API: `4123`
  - Dashboard: `4124`
  - PostgreSQL: `5432`
  - Redis: `6379`
  - Ollama: `11434`
  - Nginx: `80/443`
- **Contenedores:** Nombres estándar (sin sufijo)
- **Environment:** `NODE_ENV=production`

---

## 🚀 Comandos de Gestión

### Entorno DEV
```bash
cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR
./start-amr-services.sh
```

### Ver estado DEV
```bash
docker ps | grep amrois | grep dev
```

### Logs DEV
```bash
docker logs amrois-api-dev
docker logs amrois-dashboard-dev
docker logs amrois-postgres-dev
docker logs amrois-redis-dev
docker logs amrois-ollama-dev
docker logs amrois-nginx-dev
```

---

## 🔄 Separación Clave

1. **Puertos Diferentes:** Evita conflictos entre entornos
2. **Bases de Datos Separadas:** Datos aislados
3. **Contenedores con Nombres Únicos:** Fácil identificación
4. **Redes Docker Separadas:** Aislamiento completo
5. **Volúmenes Diferentes:** Persistencia separada

---

## 📋 Checklist para Entorno MAIN

Cuando crees el entorno MAIN, asegúrate de:

- [ ] Usar puertos estándar (4123, 4124, 5432, 6379, 11434)
- [ ] Configurar `NODE_ENV=production`
- [ ] Usar nombres de base de datos sin sufijo `dev`
- [ ] No usar sufijo `-dev` en nombres de contenedores
- [ ] Configurar volúmenes separados
- [ ] Usar red Docker diferente (ej: `amrois-main-network`)

---

## 🛡️ Aislamiento

Los entornos están completamente aislados:
- **Datos:** Bases de datos y volúmenes separados
- **Red:** Contenedores no pueden comunicarse entre entornos
- **Procesos:** Sin conflicto de puertos o servicios
- **Configuración:** Variables de entorno independientes

Esta estructura permite desarrollo seguro sin afectar el entorno de producción. 🔒