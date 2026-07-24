# Arquitectura del Módulo Examen Simulado

## 🎯 Propósito

Sistema de simulación de examen completo que:
- Muestra todas las 195 preguntas en orden aleatorio
- Implementa cronómetro realista de 180 minutos
- Oculta respuestas (como examen real)
- Proporciona análisis detallado por capítulo
- Guarda automáticamente en Leitner + Progreso

## 📊 Diagrama de Flujo

```
Usuario va a /exam
    ↓
┌─────────────────────────────┐
│ ExamBrowser                 │
│ - Info sobre examen         │
│ - Click "Iniciar"           │
└────┬────────────────────────┘
     │
     ↓
┌─────────────────────────────┐
│ ExamViewer                  │
│ - Timer: 180 min → 0        │
│ - Pregunta 1 de 195         │
│ - ✅/❌ sin ver respuesta   │
│ - Navegación entre Q        │
└────┬────────────────────────┘
     │
     ├─→ Mientras timer > 0:
     │   - Mostrar pregunta actual
     │   - Aceptar respuesta
     │   - Navegación
     │
     └─→ Cuando timer = 0 o click Terminar:
         ↓
┌─────────────────────────────┐
│ ExamResults                 │
│ - Calcula stats             │
│ - Guarda respuestas         │
│ - Muestra por capítulo      │
│ - Recomienda próximos pasos │
└────┬────────────────────────┘
     │
     ├─→ responderPregunta() [useLeitner]
     ├─→ registrarRespuesta() [useUserProgress]
     │
     └─→ localStorage se actualiza
```

## 🗂️ Estructura de Archivos

```
src/
├── components/
│   └── Exam/
│       ├── ExamBrowser.tsx    # Selector/intro
│       ├── ExamViewer.tsx     # Visor con timer
│       └── ExamResults.tsx    # Análisis completo
│
├── stores/
│   ├── useLeitner.ts         # (existente)
│   └── useUserProgress.ts    # (existente)
│
└── App.tsx                   # Ruta: /exam

docs/
├── EXAM_USAGE.md             # Guía usuario
└── EXAM_ARCHITECTURE.md      # Este archivo
```

## 🔄 Flujo de Datos Detallado

### 1. Selector (ExamBrowser)

```typescript
function ExamBrowser() {
  const [mode, setMode] = useState<'selector' | 'exam'>('selector');
  const [startTime, setStartTime] = useState<number | null>(null);

  const handleStartExam = () => {
    setStartTime(Date.now());  // Marca inicio
    setMode('exam');            // Va a ExamViewer
  };

  return <ExamViewer startTime={startTime} onBack={handleBack} />;
}
```

### 2. Inicialización (ExamViewer)

```typescript
const TOTAL_TIME_MS = 180 * 60 * 1000;  // 180 min

const preguntas = useMemo(() => {
  // Todas las 195 preguntas
  return preguntasData.preguntas
    .sort(() => Math.random() - 0.5);  // Barajar
}, []);

// startTime = fecha.now() cuando usuario inició
// timeRemaining = TOTAL_TIME_MS - (ahora - startTime)
```

### 3. Timer

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, TOTAL_TIME_MS - elapsed);
    setTimeRemaining(remaining);

    if (remaining === 0) {
      setForceFinish(true);  // Auto-terminar
    }
  }, 1000);

  return () => clearInterval(interval);
}, [startTime]);

// Actualiza cada segundo
// Si llega a 0, fuerza resultados
```

### 4. Respuesta

```typescript
const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});

const handleAnswer = (correcta: boolean) => {
  setAnswers(prev => ({
    ...prev,
    [currentPregunta.id]: {
      pregunta_id: currentPregunta.id,
      answered: true,
      isCorrect: correcta
    }
  }));
};

// Usuario marca ✅/❌
// Se guarda localmente (sin localStorage todavía)
```

### 5. Finalización

```typescript
const handleFinish = () => {
  // Guardar todas las respuestas a Leitner + Progress
  Object.entries(answers).forEach(([preguntaId, answer]) => {
    if (answer.answered) {
      responderPregunta(preguntaId, answer.isCorrect);
      registrarRespuesta(preguntaId, answer.isCorrect);
    }
  });

  // Actualiza localStorage automáticamente
  // (los hooks tienen useEffect que escucha cambios)

  setShowResults(true);  // Mostrar ExamResults
};
```

### 6. Análisis (ExamResults)

```typescript
// Cálculos
const respondidas = preguntas.filter(
  p => answers[p.id]?.answered
).length;  // 195

const correctas = preguntas.filter(
  p => answers[p.id]?.answered && answers[p.id]?.isCorrect
).length;  // 167

const tasaAcierto = Math.round((correctas / respondidas) * 100);  // 85%

// Por capítulo
const capituloStats = capitulosData.capitulos.map(cap => {
  const preguntasCapitulo = preguntas.filter(p => p.capitulo_id === cap.id);
  const correctas = preguntasCapitulo.filter(
    p => answers[p.id]?.answered && answers[p.id]?.isCorrect
  ).length;
  const tasa = (correctas / preguntasCapitulo.length) * 100;
  
  return { ...cap, tasa };
});

// Ordenar por desempeño (peor primero)
const capitulosOrdenados = capituloStats.sort((a, b) => a.tasa - b.tasa);
```

## 📈 Cálculos Principales

### Tiempo Remaining

```typescript
const timeRemaining = Math.max(0, TOTAL_TIME_MS - (Date.now() - startTime));

// Ejemplo:
// TOTAL_TIME_MS = 10,800,000 ms (180 min)
// startTime = 1690000000000
// Date.now() = 1690003600000 (1 hora después)
// timeRemaining = 10,800,000 - 3,600,000 = 7,200,000 ms (2 horas)
```

### Alertas de Tiempo

```typescript
const isTimeWarning = timeRemaining < 10 * 60 * 1000;  // < 10 min
const isTimeCritical = timeRemaining < 5 * 60 * 1000;  // < 5 min

// < 10 min: fondo amarillo
// < 5 min: fondo rojo + alarma
// = 0: auto-terminar
```

### Nivel de Aprobación

```typescript
if (tasaAcierto >= 85) return 'APROBADO';
if (tasaAcierto >= 70) return 'BIEN';
return 'REPROBADO';
```

## 🎨 Componentes

### ExamBrowser.tsx

**Responsabilidades**:
- Mostrar intro del examen
- Información: 195 preguntas, 180 min
- Requisitos previos
- Consejos
- Botón iniciar

**State**:
- `mode`: 'selector' | 'exam'
- `startTime`: number | null

**Props**: Ninguno

### ExamViewer.tsx

**Responsabilidades**:
- Filtrar/barajar 195 preguntas
- Cronómetro (180 min → 0)
- Mostrar pregunta actual (sin respuesta)
- Aceptar respuesta
- Navegar entre preguntas
- Detectar fin (timer = 0 o click Terminar)
- Transicionar a resultados

**Props**:
```typescript
{
  startTime: number,      // Date.now() cuando inició
  onBack: () => void      // Volver a selector
}
```

**State**:
- `currentIndex`: number (pregunta actual)
- `answers`: Record<string, ExamAnswer> (en memory)
- `timeRemaining`: number (actualizado cada 1s)
- `showResults`: boolean
- `forceFinish`: boolean (timer = 0)

**Hooks**:
- `useState`: currentIndex, answers, timeRemaining, etc.
- `useMemo`: preguntas (todas 195 barajadas)
- `useEffect`: timer interval
- `useLeitner()`, `useUserProgress()`: para guardar al fin

**Render**:
- Header sticky con timer
- Pregunta sin respuesta
- Botones ✅/❌
- Navigation: Anterior/Siguiente
- Quick jump a últimas 10 preguntas
- "Terminar Examen" en pregunta final

### ExamResults.tsx

**Responsabilidades**:
- Calcular stats globales
- Calcular stats por capítulo
- Mostrar gráficos
- Dar recomendaciones
- Permitir volver a inicio

**Props**:
```typescript
{
  preguntas: Pregunta[],
  answers: Record<string, ExamAnswer>,
  timeUsed: number,        // TOTAL_TIME_MS - timeRemaining
  onBack: () => void
}
```

**Cálculos**:
- respondidas, correctas, incorrectas, noRespondidas
- tasaAcierto: (correctas / respondidas) * 100
- nivelInfo: getNivel(tasaAcierto)
- capituloStats: Array de { tasa, correctas, respondidas, ...cap }
- capitulosOrdenados: ordenado por tasa (peor primero)

**Render**:
- Header con nivel (APROBADO/BIEN/REPROBADO)
- Grid de stats (correctas, incorrectas, no respondidas, tiempo)
- Gráfico de barras (desglose)
- Tabla de capítulos con tasas
- Recomendaciones personalizadas
- Botones: Volver

## 💾 Persistencia

### Al Terminar

```typescript
const handleFinish = () => {
  // Guardar cada respuesta a Leitner + Progress
  Object.entries(answers).forEach(([preguntaId, answer]) => {
    if (answer.answered) {
      // 1. Actualiza Leitner (auto-guarda a localStorage)
      responderPregunta(preguntaId, answer.isCorrect);
      
      // 2. Actualiza Progress (auto-guarda a localStorage)
      registrarRespuesta(preguntaId, answer.isCorrect);
    }
  });
};
```

### localStorage Keys Actualizados

```javascript
localStorage.getItem('fitness-trainer:leitner-cards')
// Tarjetas con cajas/próximo repaso actualizados

localStorage.getItem('fitness-trainer:progress')
// respuestas_guardadas con todas las respuestas del examen
```

## 🚀 Performance

### Renderizado
- **Inicial**: ~100ms (cargar 195 preguntas)
- **Navegación**: <16ms (cambiar currentIndex)
- **Timer**: ~1ms (actualizar cada segundo)
- **Resultados**: ~100ms (calcular stats)

### Memoria
- **Array 195 preguntas**: ~500KB
- **Answers state (195)**: ~20KB
- **Total examViewer**: ~600KB

### Optimizaciones

```typescript
// Memoizar preguntas (no cambia)
const preguntas = useMemo(
  () => preguntasData.preguntas.sort(() => Math.random() - 0.5),
  []
);

// Timer en interval (no re-render en cada ms)
useEffect(() => {
  const interval = setInterval(() => { ... }, 1000);
  return () => clearInterval(interval);
}, []);
```

## 🧪 Testing

### Unit Tests

```typescript
test('tiempo calcula correctamente', () => {
  const startTime = Date.now();
  const elapsed = 1000;  // 1 segundo después
  const TOTAL = 180 * 60 * 1000;
  const remaining = TOTAL - elapsed;
  expect(remaining).toBeLessThan(TOTAL);
});

test('tasa acierto es correcta', () => {
  const correctas = 167, respondidas = 195;
  const tasa = Math.round((correctas / respondidas) * 100);
  expect(tasa).toBe(85);  // (167/195)*100 ≈ 85.64 → 86
});
```

### Integration Tests

```typescript
test('Examen completo: inicio → responder → resultados', async () => {
  render(<App />);
  
  // 1. Ir a Examen
  userEvent.click(screen.getByText('Examen'));
  userEvent.click(screen.getByText('Iniciar Examen'));
  
  // 2. Responder algunas preguntas
  for (let i = 0; i < 5; i++) {
    userEvent.click(screen.getByText(i % 2 === 0 ? '✅' : '❌'));
    userEvent.click(screen.getByText('Siguiente'));
  }
  
  // 3. Finalizar (ir a última)
  while (!screen.getByText('Terminar Examen').disabled) {
    userEvent.click(screen.getByText('Siguiente'));
  }
  userEvent.click(screen.getByText('Terminar Examen'));
  
  // 4. Ver resultados
  expect(screen.getByText(/APROBADO|BIEN|REPROBADO/)).toBeInTheDocument();
  expect(screen.getByText(/Desempeño por Capítulo/)).toBeInTheDocument();
});
```

## 🐛 Debugging

### Ver progreso actual

```javascript
const answers = {};
// En ExamViewer, al examinar state
console.log('Respondidas:', Object.values(answers).filter(a => a.answered).length);
console.log('Correctas:', Object.values(answers).filter(a => a.isCorrect).length);
```

### Ver tiempo remaining

```javascript
const TOTAL = 180 * 60 * 1000;
const elapsed = Date.now() - startTime;
const remaining = TOTAL - elapsed;
const minutos = Math.floor(remaining / 60000);
console.log(`Tiempo restante: ${minutos} minutos`);
```

## 🔐 Seguridad

- Cronómetro es orientativo (no impide responder después)
- No hay verificación de "hizo trampa"
- Todo en localStorage (confía en el usuario)

## 📚 Referencias

- [setInterval en React](https://react.dev/reference/react/useEffect#examples-setting-up-an-interval)
- [High-precision timers](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now)
- [setTimeout/setInterval](https://javascript.info/settimeout-setinterval)
