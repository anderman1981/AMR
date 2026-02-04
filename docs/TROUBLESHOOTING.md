# 🔧 Solución de Errores - AMROIS

## Error: OnboardingTour.jsx - 500 Internal Server Error

### Causa
Falta instalar la dependencia `react-joyride` que es requerida por el componente OnboardingTour.

### Solución

**1. Instalar dependencias faltantes:**

```bash
cd dashboard
npm install react-joyride socket.io-client
```

**2. Reiniciar el servidor de desarrollo:**

```bash
# Detener el servidor actual (Ctrl+C)
# Luego reiniciar:
npm run dev
```

**3. Verificar que el servidor esté corriendo:**

```bash
# Debería ver:
# ➜  Local:   http://localhost:3465/
# ➜  Network: use --host to expose
```

---

## Dependencias Requeridas (Fase 1)

### Frontend (dashboard/)
```json
{
  "react-joyride": "^2.7.0",
  "socket.io-client": "^4.6.0"
}
```

### Backend (raíz del proyecto)
```json
{
  "socket.io": "^4.6.0"
}
```

---

## Instalación Completa

Si prefieres instalar todo de una vez:

```bash
# Backend
npm install socket.io

# Frontend
cd dashboard
npm install react-joyride socket.io-client
cd ..
```

---

## Verificación

Después de instalar, verifica que no haya errores:

1. Abre el navegador en `http://localhost:3465`
2. Abre la consola del navegador (F12)
3. No deberías ver errores de módulos faltantes
4. El onboarding tour debería aparecer automáticamente

---

## Otros Errores Comunes

### Error: "Cannot find module 'react-joyride'"
**Solución**: Instalar `npm install react-joyride` en `dashboard/`

### Error: "Cannot find module 'socket.io'"
**Solución**: Instalar `npm install socket.io` en la raíz del proyecto

### Error: "Port 3465 already in use"
**Solución**: 
```bash
# Matar el proceso que usa el puerto
lsof -ti:3465 | xargs kill -9
# Luego reiniciar
npm run dev
```

---

**Creado**: 2026-02-03  
**Última actualización**: 2026-02-03
