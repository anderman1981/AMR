# ⚠️ ACCIÓN REQUERIDA - Instalar Dependencias

## Problema Actual

El dashboard está mostrando un error 500 porque faltan dependencias de npm.

## Solución Inmediata

**Ejecuta estos comandos en tu terminal:**

```bash
# 1. Ir al directorio del dashboard
cd /Users/andersonmartinezrestrepo/DEV-PROJECTS/AMR/dashboard

# 2. Instalar dependencias faltantes
npm install react-joyride socket.io-client

# 3. Volver a la raíz del proyecto
cd ..

# 4. Instalar dependencias del backend
npm install socket.io

# 5. Reiniciar el servidor de desarrollo
cd dashboard
npm run dev
```

## Verificación

Después de instalar, verifica que el dashboard cargue sin errores:
1. Abre http://localhost:3465
2. No deberías ver errores en la consola
3. El dashboard debería cargar normalmente

## Activar OnboardingTour

Una vez instaladas las dependencias, descomenta estas líneas en `dashboard/src/pages/Dashboard.jsx`:

**Línea 12**:
```javascript
// Cambiar de:
// import OnboardingTour from '../components/OnboardingTour'

// A:
import OnboardingTour from '../components/OnboardingTour'
```

**Líneas 23-30**:
```javascript
// Descomentar:
useEffect(() => {
  const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
  if (!hasCompletedOnboarding) {
    setTimeout(() => setRunTour(true), 1000)
  }
}, [])
```

**Línea 48**:
```javascript
// Descomentar:
<OnboardingTour run={runTour} onFinish={() => setRunTour(false)} />
```

---

## Estado Actual

✅ **Dashboard funcionará** (sin onboarding tour)  
⏳ **OnboardingTour** (desactivado temporalmente)  
⏳ **WebSocket** (requiere socket.io)

---

**Creado**: 2026-02-03  
**Prioridad**: Alta  
**Tiempo estimado**: 5 minutos
