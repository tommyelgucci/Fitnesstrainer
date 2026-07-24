# Módulo Flashcards - Guía de Uso

## Descripción

**Flashcards** es un módulo de repaso rápido e interactivo basado en tarjetas de estudio. Ideal para:

- Repaso diario rápido
- Práctica de preguntas individuales
- Estudio de capítulos específicos
- Preparación última antes del examen

## Características Principales

### 1. Modos de Estudio

#### A. Todas las preguntas (195)
- **Orden Original**: Las 195 preguntas en secuencia
- **Aleatorio**: Las 195 preguntas mezcladas (simula examen)

#### B. Por Capítulo
Para cada uno de los 10 capítulos:
- **Orden**: Preguntas del capítulo en secuencia
- **Aleatorio**: Preguntas del capítulo mezcladas

### 2. Interactividad de Tarjeta

```
┌─────────────────────────────────┐
│         PREGUNTA                │
│                                 │
│  ¿Cuál es la estructura...?     │
│                                 │
│     Click para voltear          │
└─────────────────────────────────┘
        ↓ (Click)
┌─────────────────────────────────┐
│         RESPUESTA               │
│                                 │
│  La estructura es...            │
│                                 │
│  Explicación: Porque...         │
└─────────────────────────────────┘
```

**Acciones**:
- Click en la tarjeta → Voltea entre pregunta/respuesta
- ✅ Correcto → Marca como correcta, actualiza Leitner
- ❌ No lo sabía → Marca como incorrecta, retrocede en Leitner
- ← Anterior / Siguiente → → Navega entre tarjetas
- Botón "Pregunta/Respuesta" → Toggle rápido

### 3. Seguimiento de Progreso

**En tiempo real**:
- Barra de progreso (% completado)
- Contador de tarjeta actual
- Total de preguntas
- Cantidad respondidas

**Integración**:
- Respuestas guardadas en `useUserProgress`
- Cajas Leitner actualizadas automáticamente
- Próximo repaso calculado según caja actual

## Rutas

```
/flashcards                 # Selector de modo/capítulo
```

## Componentes

### FlashcardBrowser.tsx
- Interfaz de selección de modo
- Lista de todos los capítulos
- Botones "Orden" y "Aleatorio"
- Tips de uso

### FlashcardViewer.tsx
- Visualizador de tarjetas interactivo
- Animación de volteo (3D perspective)
- Botones de navegación
- Estadísticas en tiempo real

## Flujo de Uso

### Inicio
1. Navega a **Flashcards** en menú
2. Elige un modo:
   - "Todas - Orden" o "Todas - Aleatorio"
   - O un capítulo específico

### Estudio
3. Se abre la primer tarjeta
4. Lee la pregunta
5. Piensa la respuesta
6. Click para ver la respuesta correcta
7. Evalúa tu conocimiento:
   - ✅ Correcto → Avanza caja Leitner
   - ❌ No lo sabía → Retrocede a caja 1

### Navegación
8. Botones Anterior/Siguiente para moverte
9. O click en "Pregunta/Respuesta" para voltear sin evaluar
10. Continúa hasta terminar todas las tarjetas

## Datos Mostrados

### Pregunta
```
Título: "Pregunta"
Contenido: pregunta_es (en español)
```

### Respuesta
```
Título: "Respuesta"
Contenido: respuesta_es
Opcional: explicacion_es (si existe)
```

### Metadatos
```
- Número de tarjeta: "Flashcard N de M"
- Capítulo (si aplica)
- Barra de progreso (%)
- Contador de respondidas
```

## Estadísticas

En la tarjeta de stats al final:

```
Actual: 47 (pregunta en pantalla)
Total: 195 (todas las preguntas)
Respondidas: 89 (contestadas en esta sesión)
```

## Integración con Leitner

Cuando respondes en Flashcards:

```typescript
const handleRespuesta = (correcta: boolean) => {
  // 1. Actualiza Leitner
  responderPregunta(pregunta_id, correcta);
  // → correcta: caja++, incorrecta: caja=1
  // → Calcula fecha_proximo_repaso
  
  // 2. Registra en historial
  registrarRespuesta(pregunta_id, correcta);
  // → Añade a respuestas_guardadas
};
```

**Flujo automático**:
- ✅ Correcto → Pasa a siguiente caja (máx 5)
- ❌ Incorrecto → Retrocede a caja 1
- Próximo repaso se calcula según nueva caja

## Casos de Uso

### Caso 1: Repaso rápido matutino
```
1. Ir a Flashcards
2. Elegir "Todas - Orden" (o Aleatorio)
3. Estudiar 10-20 tarjetas en 5-10 minutos
4. Finalizar cuando lo desees
→ Progreso se guarda automáticamente
```

### Caso 2: Practicar un tema específico
```
1. Ir a Flashcards
2. Elegir un capítulo (p.ej. "Cap 3.3 - Aparato locomotor pasivo")
3. Elegir "Orden" o "Aleatorio"
4. Estudiar todas las preguntas del tema
→ Sabrás exactamente qué dominas del capítulo
```

### Caso 3: Simular examen (modo examen)
```
1. Ir a Flashcards
2. Elegir "Todas - Aleatorio"
3. Completar todas las 195 preguntas
4. Cada respuesta se guarda en Leitner y historial
→ Prepárate como si fuera el examen real
```

### Caso 4: Repasar lo que falta dominar
```
1. Ir a Flashcards
2. Elegir capítulos con bajo progreso (ver en Dashboard)
3. Estudiar en modo "Aleatorio"
4. Enfocarte en lo que necesitas mejorar
→ Optimiza tu tiempo de estudio
```

## Estadísticas Derivadas

### Por sesión de Flashcards
```
- Número de preguntas respondidas
- Número de respuestas correctas
- Tasa de acierto en la sesión
- Preguntas que pasaron de caja
```

### Acumulativo (en Dashboard)
```
- Total de preguntas respondidas (todas las sesiones)
- % de aciertos general
- % de preguntas dominadas (caja 5)
- Próximas a repasar hoy
```

## Atajos y Tips

### Navegación por Teclado
```
← / → : Anterior / Siguiente (cuando esté disponible)
```

### Tips de Estudio
- El modo "Aleatorio" simula mejor el examen real
- Usa "Orden" para aprender secuencialmente
- Alterna entre capítulos para no aburrirte
- Si no sabes, marca ❌ para que Leitner te lo repase pronto
- Vuelve a una tarjeta para cambiar tu respuesta

### Performance
- Las tarjetas son "stateless" (sin estado local)
- Todo se guarda en localStorage automáticamente
- No hay límite de tiempo (salvo examen simulado)
- Puedes salir y volver donde estabas

## Styling

### Tarjeta de Pregunta
- Fondo: Gradiente púrpura → azul
- Borde: Púrpura
- Indicador: "PREGUNTA"

### Tarjeta de Respuesta
- Fondo: Gradiente verde → esmeralda
- Borde: Verde
- Indicador: "RESPUESTA"

### Estados de Respuesta
- No respondida: Botones grises
- Correcta: Botón ✅ verde, ❌ gris
- Incorrecta: Botón ✅ gris, ❌ rojo

## Consideraciones

### Privacidad
- Todo se guarda en localStorage local
- Datos no se envían a servidor
- No hay sincronización entre dispositivos

### Performance
- ~488KB gzipped (app total)
- ~200ms para renderizar tarjeta
- Animaciones suaves (CSS 3D transforms)

### Accessibility
- Botones claros y etiquetados
- Contraste suficiente (WCAG AA)
- Click/teclado como opciones de navegación

## Future Enhancements

- [ ] Atajos de teclado (números para evaluar)
- [ ] Estadísticas de sesión al finalizar
- [ ] Reportar tarjetas problemáticas
- [ ] Marcar favoritas/difíciles
- [ ] Modo "Sin distracciones" (fullscreen)
- [ ] Cronómetro opcional
- [ ] Preguntas por nivel de dificultad
- [ ] Filtro por términos clave
