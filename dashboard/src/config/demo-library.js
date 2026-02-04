// Demo library configuration
// Pre-loaded books for first-time users to explore AMROIS features

export const DEMO_BOOKS = [
  {
    id: 'demo-atomic-habits',
    name: 'Atomic Habits - James Clear',
    category: 'Productividad',
    format: 'pdf',
    size: 2500000, // 2.5 MB
    status: 'processed',
    progress: 100,
    has_summary: true,
    has_key_points: true,
    has_quotes: true,
    demo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-deep-work',
    name: 'Deep Work - Cal Newport',
    category: 'Productividad',
    format: 'pdf',
    size: 3200000, // 3.2 MB
    status: 'processed',
    progress: 100,
    has_summary: true,
    has_key_points: true,
    has_quotes: true,
    demo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-7-habits',
    name: 'The 7 Habits of Highly Effective People - Stephen Covey',
    category: 'Desarrollo Personal',
    format: 'pdf',
    size: 4100000, // 4.1 MB
    status: 'processed',
    progress: 100,
    has_summary: true,
    has_key_points: true,
    has_quotes: true,
    demo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-thinking-fast-slow',
    name: 'Thinking, Fast and Slow - Daniel Kahneman',
    category: 'Psicología',
    format: 'pdf',
    size: 5800000, // 5.8 MB
    status: 'processed',
    progress: 100,
    has_summary: true,
    has_key_points: true,
    has_quotes: true,
    demo: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'demo-gtd',
    name: 'Getting Things Done - David Allen',
    category: 'Productividad',
    format: 'pdf',
    size: 2900000, // 2.9 MB
    status: 'processed',
    progress: 100,
    has_summary: true,
    has_key_points: true,
    has_quotes: true,
    demo: true,
    created_at: new Date().toISOString()
  }
]

export const DEMO_CARDS = {
  'demo-atomic-habits': [
    {
      type: 'summary',
      content: `# Atomic Habits - Resumen Ejecutivo

**Autor**: James Clear  
**Categoría**: Productividad y Hábitos

## Idea Central
Los pequeños cambios pueden generar resultados extraordinarios. El libro propone un sistema basado en cuatro leyes para crear buenos hábitos y eliminar los malos.

## Las 4 Leyes del Cambio de Comportamiento

### 1. Hacerlo Obvio
- Diseña tu entorno para que los buenos hábitos sean visibles
- Usa la fórmula de implementación de intenciones: "Cuando [SITUACIÓN], haré [COMPORTAMIENTO]"
- Apila hábitos: vincula un nuevo hábito con uno existente

### 2. Hacerlo Atractivo
- Agrupa tentación: combina algo que necesitas hacer con algo que quieres hacer
- Únete a una cultura donde tu comportamiento deseado sea normal
- Crea rituales de motivación antes de hábitos difíciles

### 3. Hacerlo Fácil
- Reduce la fricción: disminuye los pasos entre tú y tus buenos hábitos
- Regla de los 2 minutos: cuando empiezas un nuevo hábito, debe tomar menos de 2 minutos
- Automatiza tus hábitos: invierte en tecnología y compras únicas

### 4. Hacerlo Satisfactorio
- Usa refuerzo inmediato: date una recompensa después de completar el hábito
- Haz visible el progreso: usa un rastreador de hábitos
- Nunca falles dos veces: si rompes un hábito, retómalo lo antes posible

## Conclusión
El éxito es el producto de hábitos diarios, no transformaciones únicas. Enfócate en mejorar 1% cada día.`
    },
    {
      type: 'key_points',
      content: `- Los hábitos son el interés compuesto de la auto-mejora
- Enfócate en sistemas, no en metas
- La identidad es el nivel más profundo del cambio de comportamiento
- El ambiente es la mano invisible que moldea el comportamiento humano
- La regla de los 2 minutos: escala hacia abajo hasta que el hábito pueda hacerse en 2 minutos
- El seguimiento de hábitos es una forma simple de medir si hiciste un hábito
- Nunca falles dos veces: si pierdes un día, asegúrate de volver al camino rápidamente`
    },
    {
      type: 'quotes',
      content: `"Eres lo que repites. La excelencia no es un acto, sino un hábito."

"Los cambios que parecen pequeños e irrelevantes al principio se componen en resultados notables si estás dispuesto a mantenerte en ellos durante años."

"No te elevas al nivel de tus metas. Caes al nivel de tus sistemas."

"Cada acción que tomas es un voto por el tipo de persona que deseas convertirte."`
    }
  ],
  'demo-deep-work': [
    {
      type: 'summary',
      content: `# Deep Work - Resumen Ejecutivo

**Autor**: Cal Newport  
**Categoría**: Productividad y Enfoque

## Idea Central
El trabajo profundo (Deep Work) es la habilidad de enfocarse sin distracción en una tarea cognitivamente demandante. Es cada vez más raro y valioso en la economía moderna.

## Tipos de Trabajo

### Deep Work (Trabajo Profundo)
Actividades profesionales realizadas en estado de concentración sin distracción que llevan tus capacidades cognitivas al límite. Crean nuevo valor, mejoran habilidades y son difíciles de replicar.

### Shallow Work (Trabajo Superficial)
Tareas logísticas no cognitivamente demandantes, a menudo realizadas mientras estás distraído. No crean mucho valor y son fáciles de replicar.

## Las 4 Reglas del Deep Work

### Regla 1: Trabaja Profundamente
- **Filosofía Monástica**: Elimina o minimiza radicalmente obligaciones superficiales
- **Filosofía Bimodal**: Divide tiempo entre períodos de deep work y todo lo demás
- **Filosofía Rítmica**: Crea un hábito diario de deep work
- **Filosofía Periodística**: Encaja deep work donde puedas

### Regla 2: Abraza el Aburrimiento
- No tomes descansos de la distracción, toma descansos de la concentración
- Trabaja como Roosevelt: establece plazos agresivos para forzar intensidad
- Medita productivamente: usa tiempo físicamente ocupado pero mentalmente libre

### Regla 3: Deja las Redes Sociales
- Aplica la ley de los pocos vitales: identifica las pocas actividades que contribuyen más a tus metas
- Deja de usar herramientas que no aportan beneficios sustanciales
- No uses internet para entretenerte

### Regla 4: Drena lo Superficial
- Programa cada minuto de tu día
- Cuantifica la profundidad de cada actividad
- Pregunta a tu jefe por un presupuesto de trabajo superficial
- Termina tu trabajo a las 5:30 PM

## Conclusión
El deep work es una habilidad que se puede entrenar. Requiere disciplina y práctica, pero los resultados valen la pena.`
    },
    {
      type: 'key_points',
      content: `- El deep work es raro, valioso y significativo
- La capacidad de realizar deep work se está volviendo cada vez más rara mientras que su valor aumenta
- La cultura de conectividad es enemiga del deep work
- El trabajo superficial impide el progreso significativo
- Necesitas rituales y rutinas para maximizar el deep work
- La atención residual reduce tu capacidad cognitiva
- La memoria de trabajo tiene capacidad limitada
- El aburrimiento es necesario para entrenar tu concentración`
    },
    {
      type: 'quotes',
      content: `"La habilidad de realizar deep work se está volviendo cada vez más rara exactamente al mismo tiempo que se está volviendo cada vez más valiosa en nuestra economía."

"Si no produces, no prosperarás, sin importar cuán hábil o talentoso seas."

"La claridad sobre lo que importa proporciona claridad sobre lo que no importa."

"El trabajo profundo no es una habilidad arcaica de una época pasada. Es urgente y necesario."`
    }
  ],
  // Más libros demo con contenido similar...
}

export async function loadDemoLibrary() {
  const hasLoaded = localStorage.getItem('demo_library_loaded')
  
  if (hasLoaded) {
    return { loaded: false, message: 'Demo library already loaded' }
  }

  try {
    // Cargar libros demo en la base de datos
    for (const book of DEMO_BOOKS) {
      // Insertar libro
      await fetch('/api/books/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
      })

      // Insertar cards asociadas
      const cards = DEMO_CARDS[book.id] || []
      for (const card of cards) {
        await fetch(`/api/books/${book.id}/cards`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(card)
        })
      }
    }

    localStorage.setItem('demo_library_loaded', 'true')
    
    return { 
      loaded: true, 
      count: DEMO_BOOKS.length,
      message: `${DEMO_BOOKS.length} demo books loaded successfully` 
    }
  } catch (error) {
    console.error('Error loading demo library:', error)
    return { loaded: false, error: error.message }
  }
}
