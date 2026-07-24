# Módulo Lecciones - Guía de Uso

## Descripción

El módulo de **Lecciones por Capítulo** permite estudiar el material organizado por capítulos del plan de estudios B-Lizenz. Cada capítulo contiene:

- **Preguntas del examen** con sus respuestas y explicaciones
- **Seguimiento de progreso** integrado con el sistema Leitner
- **Estadísticas detalladas** por capítulo

## Estructura

### Rutas

```
/lecciones                      # Índice de todos los capítulos
/lecciones/:capitulo_id         # Detalle de un capítulo específico
```

### Componentes

```
src/components/Lecciones/
├── LeccionesIndex.tsx          # Índice de capítulos con progreso
└── CapituloDetail.tsx          # Detalles y preguntas de un capítulo
```

## Características

### 1. Índice de Capítulos (`/lecciones`)

Muestra todos los 10 capítulos con:

- **Título y descripción** (alemán + español)
- **Peso del capítulo** en el examen (5%-15%)
- **Barras de progreso**:
  - Respondidas: % de preguntas contestadas
  - Tasa de acierto: % de respuestas correctas
  - Dominadas: % en caja 5 del Leitner

- **Card interactivo** para navegar al capítulo

Ejemplo de visualización:
```
Cap. 3.3 - Aparato locomotor pasivo  [15%]
Respondidas: ████████░ 80% (16/20)
Tasa de acierto: ██████░░░ 60% (12/20)
Dominadas (Caja 5): ████░░░░░░ 40% (8/20)
```

### 2. Detalle del Capítulo (`/lecciones/:capitulo_id`)

Para cada capítulo muestra:

- **Título y descripción** del capítulo
- **Organización por subcapítulos** (si existen)
- **Cada pregunta contiene**:
  - Número de pregunta
  - Enunciado en español
  - Respuesta correcta
  - Explicación completa
  - Estado: ✅ Correcto / ❌ Incorrecto / Sin responder
  - Indicador de caja Leitner si aplica

- **Botones de interacción**:
  - "✅ Correcto" - marcar como correcta
  - "❌ Incorrecto" - marcar como incorrecta
  - Estados: sin responder → verde/rojo (respondida), permite cambiar respuesta

## Datos Integrados

### De `capitulos.json`
```typescript
{
  "id": "k3.3",           // ID único
  "numero": 3,            // Número del capítulo
  "subtitulo": "3.3",     // Subtítulo (opcional)
  "titulo_de": "...",     // Título en alemán
  "titulo_es": "...",     // Título en español
  "peso": 0.15,           // Ponderación en examen (5%-15%)
  "subcapitulos": [       // Secciones temáticas
    {
      "id": "k3.3_knochen",
      "titulo_de": "...",
      "titulo_es": "..."
    }
  ]
}
```

### De `preguntas.json`
```typescript
{
  "id": "p47",
  "capitulo_id": "k3.3",
  "numero": 47,
  "pregunta_es": "¿Cuál es...",
  "respuesta_es": "La respuesta es...",
  "explicacion_es": "Porque...",
  "terminos_clave": ["hueso", "cartílago"],
  "dificultad": "medium"
}
```

### Del Leitner (`useLeitner`)
Para cada pregunta:
```typescript
{
  numero_caja: 1-5,           // Caja actual en Leitner
  veces_correctas: number,    // Aciertos totales
  veces_incorrectas: number,  // Fallos totales
  fecha_proximo_repaso: timestamp
}
```

### Del Progreso (`useUserProgress`)
Para cada pregunta:
```typescript
{
  pregunta_id: string,
  correcta: boolean,
  fecha: timestamp
}
```

## Flujo de Uso

### Estudiar un capítulo

1. **Ir a Lecciones** → `/lecciones`
2. **Elegir capítulo** → Click en card (p.ej. "Cap. 3.3")
3. **Ver pregunta** → Enunciado + respuesta + explicación
4. **Marcar respuesta**:
   - Si no respondió: "✅ Correcto" o "❌ Incorrecto"
   - Si ya respondió: Click para cambiar la respuesta
5. **Seguimiento automático**:
   - Se guarda en `useUserProgress`
   - Se actualiza caja Leitner con `useLeitner`
   - El progreso se refleja inmediatamente en barras

### Revisar progreso

- **En el índice** → Ver resumen de 10 capítulos
- **En el capítulo** → Cada pregunta muestra su estado
- **Indicadores**:
  - ✅ verde = respondida correctamente
  - ❌ rojo = respondida incorrectamente
  - 🕐 gris = sin responder
  - Caja N = en revisión (Leitner)

## Estadísticas

### Por capítulo

```typescript
const stats = {
  total: 20,              // Total preguntas en el capítulo
  respondidas: 16,        // Preguntas contestadas
  correctas: 12,          // Respuestas correctas
  dominadas: 8,           // En caja 5 (Leitner)
  porcentajeRespuestas: 80,    // Respondidas: 80%
  porcentajeAciertos: 75,      // Correctas: 75% (de respondidas)
  porcentajeDominadas: 50      // Dominadas: 50% (de total)
}
```

### Global

En la tarjeta de resumen:
- **Total preguntas**: 195 en todo el examen
- **Respondidas**: X (del progreso)
- **Dominadas**: Y (caja 5 del Leitner)

## Integración con Leitner

Cuando respondes una pregunta en Lecciones:

```typescript
const handleRespuesta = (preguntaId: string, correcta: boolean) => {
  // 1. Actualiza Leitner (cambia caja)
  responderPregunta(preguntaId, correcta);
  
  // 2. Registra en historial de respuestas
  registrarRespuesta(preguntaId, correcta);
};
```

**Flujo automático**:
- ✅ Respuesta correcta → Avanza a siguiente caja (máx 5)
- ❌ Respuesta incorrecta → Retrocede a caja 1
- Próximo repaso se calcula según la caja

## Casos de Uso

### Caso 1: Estudiar un tema específico

```typescript
// Usuario: "Quiero dominar Cap. 3.3 (Aparato locomotor pasivo)"
// Solución:
navigate('/lecciones/k3.3')
// → Ver todas las preguntas del tema
// → Responder cada una
// → Leitner mantiene registro de cuáles necesitan repaso
```

### Caso 2: Revisar capítulos con bajo progreso

```typescript
// Usuario: "¿Cuál es mi peor capítulo?"
// Solución:
const capitulosOrdenados = capitulos
  .map(c => ({
    ...c,
    porcentajeDominadas: getCapituloStats(c.id).porcentajeDominadas
  }))
  .sort((a, b) => a.porcentajeDominadas - b.porcentajeDominadas);
// → El primero es el que menos ha dominado
```

### Caso 3: Priorizar estudio por peso

```typescript
// Usuario: "¿Cuáles son los capítulos más importantes?"
// Solución: En /lecciones se muestran con badge de peso (5%, 15%, etc.)
// Los de mayor peso aparecen primero por relevancia en examen
```

## Notas de Implementación

### Recursión de subcapítulos

Los subcapítulos se muestran solo si existen en el JSON:

```typescript
{capitulo.subcapitulos && capitulo.subcapitulos.length > 0 ? (
  // Mostrar agrupados
) : (
  // Mostrar todas sin agrupar
)}
```

### Filtrado de preguntas

```typescript
// Preguntas del capítulo
const preguntas = preguntasData.preguntas.filter(
  p => p.capitulo_id === capitulo_id
);

// Preguntas de un subcapítulo (simplificado)
const preguntasSubcap = preguntas.filter(
  p => p.id.startsWith(subcap.id.split('_')[0])
);
```

### Persistencia

No hay cambios en esta capa:
- Los datos vienen de archivos estáticos (JSON)
- El progreso se guarda en `useUserProgress`
- El Leitner se guarda en `useLeitner`
- Ambos usan localStorage automáticamente

## Performance

- **Render del índice**: ~100ms (10 capítulos)
- **Render del detalle**: ~200ms (20-40 preguntas)
- **Búsqueda de pregunta**: O(n) - lineal, ~1ms
- **Actualización progreso**: ~5ms localStorage

## Future Enhancements

- [ ] Búsqueda de preguntas por keyword
- [ ] Filtrado por nivel de dificultad
- [ ] Ordenamiento customizable (por progreso, dificultad, etc.)
- [ ] Notas/bookmarks en preguntas
- [ ] Exportar capítulo como PDF
- [ ] Modo "Estudio a ciegas" (sin ver respuesta primero)
- [ ] Comparación visual de progreso por capítulo
