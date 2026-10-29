# Arquitectura del simulacro de examen

## Propósito

Ensayo cronometrado en dos fases —examen y corrección— con preguntas abiertas (el banco no tiene opciones múltiples):

1. **Examen**: se contesta con el reloj en marcha y **sin ver la respuesta modelo**. Cada pregunta admite texto libre, un nivel de seguridad (seguro / dudo / no sé) y una marca para revisar.
2. **Corrección**: se muestra tu respuesta junto a la modelo y te calificas (correcta = 1, a medias = 0,5, fallada = 0). Lo no contestado cuenta como fallo y no se puede calificar.
3. **Resultados**: nota, tiempo, desglose por capítulo (peor primero), calibración de la seguridad y lista de falladas.

Los formatos (`completo` 195 pr./180 min, `medio` 60/60, `rapido` 20/20, `errores` 30/30) y la meta del 80 % son **de la app**, no los criterios oficiales del examen.

## Archivos

```
src/components/Exam/
  ExamBrowser.tsx          menú, simulacro pendiente e historial
  SimulacroViewer.tsx      fases examen y corrección; persiste la sesión en cada cambio
  SimulacroResultados.tsx  resultados
  simulacroUtils.ts        formatos, reparto de preguntas por peso de capítulo, puntaje
src/stores/simulacros.ts   sesión en curso e historial (localStorage)
```

## Detalles

- **Reparto**: `repartoPorCapitulo` asigna preguntas según `peso` de `capitulos.json` (método del mayor resto, mínimo 1 por capítulo).
- **Persistencia**: la sesión (`fitness-trainer:simulacro-en-curso`) guarda ids, respuestas, notas y hora de inicio; el tiempo se calcula contra la hora absoluta, así que recargar no da tiempo extra. Si caduca, pasa sola a corrección.
- **Al terminar**: cada pregunta alimenta `useLeitner` y `useUserProgress` (solo la nota completa cuenta como acierto), se guarda el resultado en `fitness-trainer:simulacros` y se suma XP con `simulacroCompletado` (+10, o +30 si llega a la meta).
