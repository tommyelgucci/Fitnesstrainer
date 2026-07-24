# Módulo Quiz - Guía de Uso

## Descripción

**Quiz** es un módulo de pruebas rápidas para medir tu conocimiento real sin distracciones. Ideal para:

- Evaluar progreso después de estudiar
- Identificar temas débiles
- Preparación antes de examen simulado
- Práctica de memoria a corto plazo

## Características Principales

### 1. Selección Flexible

**Cantidad de preguntas**:
- 10 preguntas (repaso rápido, ~5-10 min)
- 20 preguntas (estudio moderado, ~10-20 min)
- 50 preguntas (estudio profundo, ~25-50 min)
- 100 preguntas (seminario, ~50-100 min)
- 195 preguntas (maratón, ~160-195 min)

**Tema**:
- Todos los temas (aleatorios)
- Capítulo específico (10 opciones)

### 2. Modo de Quiz

```
1. Se muestra solo la PREGUNTA (sin respuesta)
2. Usuario marca ✅ Creo que sí / ❌ No lo sé
3. Navega Anterior/Siguiente entre preguntas
4. Al terminar, ve resumen de resultados
```

**No hay respuestas visibles** durante el quiz. Esto simula un examen real.

### 3. Resultados Inmediatos

```
┌─────────────────────────────┐
│ Quiz Completado             │
│                             │
│ Tasa Acierto: 75%           │
│ Correctas: 15  Incorrectas: 5
│ Total: 20      No respondidas: 0
│                             │
│ Desempeño: BUENO            │
└─────────────────────────────┘
```

**Incluye**:
- Tasa de acierto (%)
- Cantidad de correctas/incorrectas
- Gráficos de desglose
- Preguntas fallidas con respuestas correctas
- Recomendaciones personalizadas

## Rutas

```
/quiz                       # Selector de cantidad y tema
```

## Componentes

### QuizBrowser.tsx
- Selector de cantidad de preguntas (10, 20, 50, 100, 195)
- Selector de capítulo o todos
- Resumen de parámetros antes de empezar

### QuizViewer.tsx
- Mostrador de pregunta (sin respuesta visible)
- Botones ✅/❌ para responder
- Navegación Anterior/Siguiente
- Contador de respondidas
- Botón "Finalizar Quiz" en la última

### QuizResults.tsx
- Resumen de resultados
- Gráficos de barras (correctas/incorrectas)
- Nivel de desempeño (Excelente/Bueno/Regular/Necesita mejorar)
- Lista de preguntas fallidas (primeras 5)
- Recomendaciones

## Flujo de Uso

### Paso 1: Configuración

1. Navega a **Quiz** en menú
2. Elige cantidad: 10, 20, 50, 100 o 195
3. Elige tema (Todos o un capítulo)
4. Se inicia automáticamente al hacer click

### Paso 2: Contestar Preguntas

5. Se muestra la pregunta (sin respuesta)
6. Piensa bien
7. Marca ✅ o ❌ según lo que crees
8. Navega con Anterior/Siguiente
9. Puedes cambiar respuestas en cualquier momento

### Paso 3: Resultados

10. Finaliza haciendo click en "Finalizar Quiz"
11. Ve resumen de desempeño
12. Revisa respuestas incorrectas
13. Sigue recomendaciones

## Datos Mostrados

### Durante Quiz

```
Pregunta:     pregunta_es (solo el enunciado)
No visible:   respuesta_es, explicacion_es
Interfaz:     Pregunta N de M, barra progreso, contador
Botones:      ✅ Creo que sí / ❌ No lo sé
```

### En Resultados

```
Tasa acierto:  (correctas/respondidas) * 100
Correctas:     cantidad
Incorrectas:   cantidad
Total:         cantidad
Preguntas fallidas: primeras 5 con respuesta correcta
Recomendaciones:   personalizadas según desempeño
```

## Integración con Leitner

Cuando finalizas el quiz:

```typescript
Object.entries(answers).forEach(([preguntaId, answer]) => {
  if (answer.answered) {
    // Actualiza Leitner
    responderPregunta(preguntaId, answer.isCorrect);
    
    // Registra en historial
    registrarRespuesta(preguntaId, answer.isCorrect);
  }
});
```

**Resultado**:
- Todas tus respuestas se guardan en localStorage
- Las cajas Leitner se actualizan automáticamente
- Tu próximo repaso se calcula basado en desempeño

## Casos de Uso

### Caso 1: Verificar si aprendiste un tema

```
1. Ir a Quiz
2. Seleccionar: 20 preguntas + Cap. 3.3
3. Completar quiz
4. Si tasa > 80% → Tema dominado
   Si tasa < 50% → Volver a Lecciones
```

### Caso 2: Evaluar progreso general

```
1. Ir a Quiz
2. Seleccionar: 50 preguntas + Todos
3. Completar quiz
4. Comparar con intentos anteriores
→ ¿Mejoraste tu tasa de acierto?
```

### Caso 3: Practica antes del examen

```
1. Ir a Quiz
2. Seleccionar: 195 preguntas + Todos
3. Completar quiz completo
4. Analizar desempeño por capítulo
5. Mejorar capítulos débiles en Lecciones
6. Repetir quiz en 1-2 días
```

### Caso 4: Identificar capítulos débiles

```
1. Hacer 2-3 quiz de 20-50 preguntas
2. Notar cuáles capítulos fallan más
3. Ir a Lecciones → ese capítulo
4. Estudiar hasta dominar
5. Repetir Quiz para verificar mejora
```

## Estadísticas

### Desempeño

```
Excelente:           90%+ aciertos
Bueno:               70-89% aciertos
Regular:             50-69% aciertos
Necesita mejorar:    <50% aciertos
```

### Recomendaciones Automáticas

- **90%+**: "¡Excelente! Considera pasar al siguiente nivel"
- **70-89%**: "Buen progreso. Repasa fallos en Lecciones"
- **<60%**: "Necesitas más estudio. Usa Lecciones primero"

## Atajos y Tips

### Navegación
- ← Anterior / Siguiente → : Moverte entre preguntas
- ✅/❌: Marcar respuesta
- Cambiar respuesta: Click en botón cuando ya respondiste

### Tips de Estudio
- No veas respuestas durante el quiz (mantiene realismo)
- Quiz cortos (10-20) para feedback rápido
- Quiz largos (100+) para evaluación global
- Repite quiz después de 1-2 días para ver mejora
- Fallos en quiz = estudio enfocado en Lecciones

### Performance
- Quiz de 10: ~5 minutos
- Quiz de 20: ~10 minutos
- Quiz de 50: ~25 minutos
- Quiz de 100: ~50 minutos
- Quiz de 195: ~160 minutos

## Privacidad

- Todo en localStorage
- Respuestas se guardan automáticamente
- Historiales persisten entre sesiones
- Puedes ver intentos anteriores en Dashboard (futura feature)

## Diferencias con Otros Modos

| Modo | Pregunta Visible | Respuesta Visible | Evaluación | Integración Leitner |
|------|------------------|-------------------|------------|---------------------|
| Lecciones | ✅ | ✅ | Inmediata | Sí |
| Flashcards | ✅ | Click para voltear | Inmediata | Sí |
| Quiz | ✅ | No | Al final | Sí (al terminar) |
| Examen (futuro) | ✅ | No | Al final | Sí |

## Future Enhancements

- [ ] Historial de intentos por quiz
- [ ] Gráficos de progreso (última semana)
- [ ] Estadísticas por capítulo
- [ ] Cronómetro realista (como examen)
- [ ] Comparativa con media de usuarios
- [ ] Exportar resultados como PDF
- [ ] Modo sin internet (offline)
- [ ] Atajos de teclado (1-4 para opciones múltiples futura)
