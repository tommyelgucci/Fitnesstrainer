# Módulo Examen Simulado - Guía de Uso

## Descripción

**Examen Simulado** es la prueba definitiva de preparación. Replica exactamente las condiciones del examen B-Lizenz real:

- **195 preguntas** (todas)
- **180 minutos** (3 horas) cronometradas
- **Orden aleatorio** (cada intento es diferente)
- **Sin respuestas visibles** (como examen real)
- **Análisis detallado** por capítulo al terminar

## Características

### 1. Experiencia de Examen Real

```
┌────────────────────────────────────────┐
│ Examen Simulado: Pregunta 1/195        │
│ Respondidas: 0/195    Tiempo: 02:59:59 │
├────────────────────────────────────────┤
│ Pregunta #1                            │
│ ¿Cuál es la estructura...?             │
│                                        │
│ ✅ Creo que sí    ❌ No lo sé          │
├────────────────────────────────────────┤
│ ← Anterior        Siguiente →          │
│ Terminar Examen (0/195)                │
└────────────────────────────────────────┘
```

**Características**:
- Cronómetro realista (180 minutos)
- Contador de progreso
- Sin botón "ver respuesta"
- Navegación simple (anterior/siguiente)
- Salto rápido a preguntas finales

### 2. Resultados Completos

```
APROBADO: 85%
✅ Correctas: 167
❌ Incorrectas: 28
⏸️ No respondidas: 0
⏱️ Tiempo: 98 minutos

Desempeño por Capítulo:
Cap. 3.3 (Aparato locomotor): 80% ████████░
Cap. 3.4 (Activo):            90% █████████
Cap. 3.5 (Músculos):          70% ███████░░
```

**Análisis**:
- Tasa global de acierto
- Desglose correctas/incorrectas
- Capítulos ordenados por desempeño
- Recomendaciones personalizadas

## Rutas

```
/exam                       # Inicio y selector
```

## Componentes

### ExamBrowser.tsx
- Información sobre el examen
- Requisitos previos
- Consejos para el examen
- Botón para iniciar

### ExamViewer.tsx
- Mostrador de preguntas (sin respuesta)
- Cronómetro de 180 minutos
- Navegación y respuesta
- Alertas de tiempo crítico

### ExamResults.tsx
- Resumen de desempeño
- Gráficos de resultados
- Análisis por capítulo
- Recomendaciones

## Flujo de Uso

### 1. Preparación
- Asegúrate de tener 3+ horas sin interrupciones
- Ten agua y snacks
- Cierra notificaciones del teléfono

### 2. Iniciar
1. Navega a **Examen**
2. Lee los consejos
3. Click "Iniciar Examen Simulado"

### 3. Examen
4. Se inician 180 minutos
5. Muestra pregunta sin respuesta
6. Responde ✅/❌ rápidamente
7. Navega Anterior/Siguiente
8. Al terminar última pregunta, click "Terminar Examen"

### 4. Resultados
9. Ve tus resultados completos
10. Analiza capítulos débiles
11. Sigue recomendaciones

## Consejos

### Durante el Examen
- **No repenses mucho**: Responde rápido, confía en tu intuición
- **No saltees**: Contesta todas, es mejor un "no lo sé" que dejar en blanco
- **Tiempo promedio**: ~55 segundos por pregunta (deberías acabar en ~95 min)
- **Si te quedan minutos**: Repasa preguntas donde dudaste

### Estrategia
- Primeras 30 min: Preguntas fáciles (responde rápido)
- Siguientes 60 min: Preguntas normales (más tiempo)
- Últimos 60 min: Preguntas difíciles (concentrado)
- Últimos 15 min: Repasa dudosas

### Condiciones Realistas
- Haz el examen en la mañana (como el real)
- Sin internet/redes sociales
- En un lugar tranquilo
- Desayuno completo

## Puntuación y Aprobación

```
Tasa Acierto    Nivel           Estado
85%+            APROBADO ✅     Listo para examen real
70-84%          BIEN            Más estudio necesario
50-69%          REGULAR         Estudio intenso requerido
<50%            REPROBADO ❌    Vuelve a Lecciones
```

## Datos Guardados

**Automáticamente guardado**:
- Todas tus respuestas en localStorage
- Se actualiza tu Leitner con cada respuesta
- Se registra en historial de progreso
- No se borra: puedes revisar después

**Puedes**:
- Repetir el examen cuantas veces quieras
- Cada intento es completamente nuevo (orden diferente)
- Comparar resultados entre intentos (futura feature)
- Ver progreso a lo largo del tiempo

## Análisis Detallado

### Global
- Tasa de acierto (%)
- Correctas, incorrectas, no respondidas
- Tiempo total utilizado

### Por Capítulo
```
Cap. 3.3: 20 preguntas, 16 correctas = 80%
Cap. 3.4: 18 preguntas, 16 correctas = 89%
Cap. 3.5: 15 preguntas, 10 correctas = 67%
...
```

### Recomendaciones
- Si ≥85%: "Listo para examen real"
- Si 70-84%: "Enfócate en capítulos débiles"
- Si <70%: "Vuelve a Lecciones, repite en 1 semana"

## Diferencias con Otros Modos

| Modo | Preguntas | Respuesta Visible | Tiempo Limite | Objetivo |
|------|-----------|-------------------|---------------|----------|
| Lecciones | Capítulos | Sí | No | Aprender |
| Flashcards | Seleccionables | Sí (voltear) | No | Repasar |
| Quiz | 10-195 | No | No | Evaluar |
| **Exam** | **195** | **No** | **180 min** | **Simular** |

## FAQ

**¿Qué pasa si me quedo sin tiempo?**
- Se termina automáticamente
- Tus respuestas hasta ese momento se guardan

**¿Puedo pausar?**
- No hay pausa oficial
- Si necesitas interrumpir, usa botón "Atrás" (pero pierdes tu sesión)

**¿Las preguntas son diferentes cada vez?**
- Sí, orden completamente aleatorio
- Ideal para repetir

**¿Puedo ver mis respuestas después?**
- Sí, en resultados muestra análisis completo
- Revisa preguntas fallidas

**¿Afecta a mi progreso Leitner?**
- Sí, todas tus respuestas se guardan
- Tu Leitner se actualiza automáticamente

**¿Cuándo estoy listo para el examen real?**
- Cuando consigas 85%+ en 2-3 intentos
- Y domines capítulos débiles

## Next Steps

Después del simulado:

1. **Si ≥85%**: Felicidades, repite en 1 semana
2. **Si 70-84%**: Estudia capítulos débiles en Lecciones
3. **Si <70%**: Vuelve a Flashcards, Quiz, Lecciones

Luego, repite el simulado después de 1-2 semanas.

## Estadísticas de Usuarios (Meta)

```
Intento 1:     ~60% (conocimiento inicial)
Intento 2:     ~70% (después estudio)
Intento 3:     ~80% (mejor preparación)
Intento 4:     ~85%+ (listo!)
```

Tiempo total: 2-3 semanas de estudio intenso.
