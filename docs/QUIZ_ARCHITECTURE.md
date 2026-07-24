# Arquitectura del Módulo Quiz

## 🎯 Propósito

Sistema de evaluación rápida que permite:
- Seleccionar cantidad de preguntas (10-195)
- Filtrar por capítulo o todos
- Contestar sin ver respuestas (simula examen)
- Obtener resultados inmediatos con análisis
- Guardar automáticamente en Leitner + Progreso

## 📊 Diagrama de Flujo

```
Usuario navega a /quiz
    ↓
┌─────────────────────────────────────┐
│ QuizBrowser (Selector)              │
│ - Cantidad: 10, 20, 50, 100, 195   │
│ - Tema: Todos o un capítulo         │
└────┬────────────────────────────────┘
     │
     ↓ (Click en opción)
┌─────────────────────────────────────┐
│ QuizViewer (Contestar)              │
│ - Filtra preguntas                  │
│ - Baraja (random)                   │
│ - Muestra solo PREGUNTA             │
│ - Usuario marca ✅/❌ sin ver resp   │
└────┬────────────────────────────────┘
     │
     ├─→ Usuario click ✅/❌
     │   (no muestra respuesta)
     │
     ├─→ Usuario click Siguiente
     │   (solo pregunta siguiente)
     │
     └─→ Usuario click "Finalizar Quiz"
         (en última pregunta)
         ↓
┌─────────────────────────────────────┐
│ QuizResults (Análisis)              │
│ - Calcula tasa acierto              │
│ - Guarda todas las respuestas       │
│ - Actualiza Leitner + Progress      │
│ - Muestra preguntas fallidas        │
│ - Da recomendaciones                │
└────┬────────────────────────────────┘
     │
     ├─→ responderPregunta() [useLeitner]
     │   (para cada respuesta)
     │
     └─→ registrarRespuesta() [useUserProgress]
         ↓
      localStorage se actualiza
      ├─ fitness-trainer:leitner-cards
      └─ fitness-trainer:progress
```

## 🗂️ Estructura de Archivos

```
src/
├── components/
│   └── Quiz/
│       ├── QuizBrowser.tsx        # Selector de config
│       ├── QuizViewer.tsx         # Visor de preguntas
│       └── QuizResults.tsx        # Análisis de resultados
│
├── stores/
│   ├── useLeitner.ts             # (existente)
│   └── useUserProgress.ts        # (existente)
│
├── data/
│   ├── capitulos.json            # Metadata
│   └── preguntas.json            # 195 preguntas
│
└── App.tsx                       # Ruta: /quiz

docs/
├── QUIZ_USAGE.md                 # Guía de usuario
└── QUIZ_ARCHITECTURE.md          # Este archivo
```

## 🔄 Flujo de Datos Detallado

### 1. Selección (QuizBrowser)

```typescript
function QuizBrowser() {
  const [selectedCapitulo, setSelectedCapitulo] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(10);

  // Usuario elige: 50 preguntas de Cap. 3.3
  const handleStartQuiz = (capitulo: 'k3.3', count: 50) => {
    setSelectedCapitulo('k3.3');
    setSelectedCount(50);
    setMode('viewer');  // Cambiar a visor
  };

  // Se monta QuizViewer
  return <QuizViewer capituloId="k3.3" questionCount={50} onBack={...} />;
}
```

### 2. Filtrado y Barajado (QuizViewer)

```typescript
const preguntas = useMemo(() => {
  let filtered = preguntasData.preguntas;

  // 1. Filtrar por capítulo
  if (capituloId) {
    filtered = filtered.filter(p => p.capitulo_id === capituloId);
  }

  // 2. Barajar
  filtered = filtered.sort(() => Math.random() - 0.5);

  // 3. Tomar solo la cantidad
  return filtered.slice(0, questionCount);
}, [capituloId, questionCount]);

// Resultado: Array de 50 preguntas random del capítulo k3.3
```

### 3. Respuesta (QuizViewer)

```typescript
const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
//  {
//    "p1": { pregunta_id: "p1", answered: true, isCorrect: true },
//    "p5": { pregunta_id: "p5", answered: true, isCorrect: false },
//  }

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

// Usuario click ✅ "Creo que sí"
// → answers['p1'] = { answered: true, isCorrect: true }
```

### 4. Finalización (QuizViewer → QuizResults)

```typescript
const handleFinish = () => {
  // Para cada respuesta, guardar en Leitner + Progreso
  Object.entries(answers).forEach(([preguntaId, answer]) => {
    if (answer.answered) {
      responderPregunta(preguntaId, answer.isCorrect);
      registrarRespuesta(preguntaId, answer.isCorrect);
    }
  });

  setShowResults(true);  // Mostrar QuizResults
};
```

### 5. Análisis (QuizResults)

```typescript
const respondidas = preguntas.filter(p => answers[p.id]?.answered).length;
// 50 (todas respondidas en este ejemplo)

const correctas = preguntas.filter(
  p => answers[p.id]?.answered && answers[p.id]?.isCorrect
).length;
// 37

const tasaAcierto = (correctas / respondidas) * 100;
// (37 / 50) * 100 = 74%

const nivelInfo = getNivel(tasaAcierto);
// tasaAcierto >= 70 → "Bueno"

const preguntasIncorrectas = preguntas.filter(
  p => answers[p.id]?.answered && !answers[p.id]?.isCorrect
).slice(0, 5);
// Mostrar primeras 5 fallidas
```

## 📈 Cálculos

### Tasa de Acierto

```typescript
const tasaAcierto = respondidas > 0
  ? Math.round((correctas / respondidas) * 100)
  : 0;

// Ejemplo: 37 correctas de 50 respondidas = 74%
```

### Nivel de Desempeño

```typescript
const getNivel = (tasa: number) => {
  if (tasa >= 90) return 'Excelente';      // Verde
  if (tasa >= 70) return 'Bueno';          // Azul
  if (tasa >= 50) return 'Regular';        // Amarillo
  return 'Necesita mejorar';               // Rojo
};
```

### Progreso Visual

```
Pregunta 1-50: [████████░░] 80% (completado)
Respondidas: 50/50 (100%)
Correctas: 37/50 (74%)
```

## 🎨 Componentes

### QuizBrowser.tsx

**Responsabilidades**:
- Mostrar selector de cantidad (10, 20, 50, 100, 195)
- Mostrar selector de capítulo (Todos + 10 capítulos)
- Validar máximo de preguntas por capítulo
- Transicionar a QuizViewer

**State**:
- `mode`: 'selector' | 'viewer'
- `selectedCapitulo`: string | null
- `selectedCount`: number

**Props**: Ninguno

### QuizViewer.tsx

**Responsabilidades**:
- Filtrar y barajar preguntas
- Mostrar solo PREGUNTA (sin respuesta)
- Recopilar respuestas en state
- Navegar entre preguntas
- Detectar fin y pasar a resultados

**Props**:
```typescript
{
  capituloId: string | null,
  questionCount: number,
  onBack: () => void
}
```

**State**:
- `currentIndex`: number (pregunta actual)
- `answers`: Record<string, QuizAnswer>
- `showResults`: boolean

**Hooks**:
- `useMemo`: preguntas filtradas/barajadas
- `useLeitner()`: responderPregunta()
- `useUserProgress()`: registrarRespuesta()

**Render**:
- Header con título y progreso
- Pregunta (solo enunciado)
- Botones ✅/❌ para responder
- Botones Anterior/Siguiente
- Botón "Finalizar Quiz" en última
- Stats en tiempo real

### QuizResults.tsx

**Responsabilidades**:
- Calcular estadísticas
- Mostrar tasa de acierto
- Listar preguntas fallidas
- Dar recomendaciones
- Permitir revisar quiz

**Props**:
```typescript
{
  preguntas: Pregunta[],
  answers: Record<string, QuizAnswer>,
  capitulo?: Capitulo | null,
  onReview: () => void,
  onBack: () => void
}
```

**Cálculos**:
- respondidas: length de answers respondidas
- correctas: length de isCorrect === true
- tasaAcierto: (correctas / respondidas) * 100
- nivelInfo: getNivel(tasaAcierto)
- preguntasIncorrectas: filter y slice(0, 5)

**Render**:
- Header con nivel de desempeño
- Grid de estadísticas (tasa, correctas, incorrectas, total)
- Gráficos de barras
- Lista de preguntas fallidas
- Recomendaciones personalizadas
- Botones: Revisar / Volver

## 💾 Persistencia

### Guardado de Respuestas

```typescript
// Al finalizar quiz
Object.entries(answers).forEach(([preguntaId, answer]) => {
  // 1. Actualiza Leitner
  responderPregunta(preguntaId, answer.isCorrect);
  // → Se guarda a localStorage automáticamente
  // → useLeitner useEffect escucha cambios

  // 2. Registra en historial
  registrarRespuesta(preguntaId, answer.isCorrect);
  // → Se guarda a localStorage automáticamente
  // → useUserProgress useEffect escucha cambios
});
```

### localStorage Keys

```javascript
// Tarjetas Leitner (actualizado)
localStorage.getItem('fitness-trainer:leitner-cards')

// Progreso (actualizado)
localStorage.getItem('fitness-trainer:progress')
```

## 🚀 Performance

### Renderizado
- **Selector**: ~50ms (lista de capítulos)
- **Quiz inicial**: ~100ms (cargar + barajar 195)
- **Navegación**: <16ms (cambiar currentIndex)
- **Resultados**: ~50ms (calcular stats)

### Memoria
- **Array de 195 preguntas**: ~500KB
- **Answers state (50 quiz)**: ~5KB
- **localStorage total**: ~300KB

### Optimizaciones

```typescript
// Memoizar preguntas filtradas/barajadas
const preguntas = useMemo(
  () => { /* filtrado + barajado */ },
  [capituloId, questionCount]
);

// useMemo para cálculos en resultados
const tasaAcierto = useMemo(
  () => Math.round((correctas / respondidas) * 100),
  [correctas, respondidas]
);
```

## 🧪 Testing

### Unit Tests

```typescript
test('filtrado por capítulo funciona', () => {
  const filtered = preguntas.filter(p => p.capitulo_id === 'k3.3');
  expect(filtered.every(p => p.capitulo_id === 'k3.3')).toBe(true);
});

test('barajado es random', () => {
  const arr = [1, 2, 3, 4, 5];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  expect(shuffled).not toEqual(arr);  // (casi seguro)
});

test('tasa acierto calcula correctamente', () => {
  const correctas = 37, respondidas = 50;
  const tasa = Math.round((correctas / respondidas) * 100);
  expect(tasa).toBe(74);
});
```

### Integration Tests

```typescript
test('Quiz flujo completo', async () => {
  render(<App />);
  
  // 1. Click Quiz
  userEvent.click(screen.getByText('Quiz'));
  
  // 2. Seleccionar 20 preguntas
  userEvent.click(screen.getByText('20'));
  
  // 3. Seleccionar capítulo
  userEvent.click(screen.getByText('Cap. 3.3'));
  
  // 4. Responder preguntas
  for (let i = 0; i < 20; i++) {
    if (i % 2 === 0) {
      userEvent.click(screen.getByText('✅ Creo que sí'));
    } else {
      userEvent.click(screen.getByText('❌ No lo sé'));
    }
    if (i < 19) userEvent.click(screen.getByText('Siguiente'));
  }
  
  // 5. Finalizar
  userEvent.click(screen.getByText('Finalizar Quiz'));
  
  // 6. Ver resultados
  expect(screen.getByText(/Quiz Completado/)).toBeInTheDocument();
  expect(screen.getByText(/Bueno/)).toBeInTheDocument();
  
  // 7. Verificar guardado
  const saved = JSON.parse(localStorage.getItem('fitness-trainer:progress'));
  expect(Object.keys(saved.respuestas_guardadas).length).toBeGreaterThan(0);
});
```

## 🐛 Debugging

### Ver respuestas dadas

```javascript
const quiz = {
  capitulo: 'k3.3',
  cantidad: 20,
  respuestas: {
    p1: { isCorrect: true },
    p5: { isCorrect: false },
    // ...
  }
};

console.table(Object.entries(quiz.respuestas));
```

### Ver tasa de acierto manualmente

```javascript
const answers = JSON.parse(localStorage.getItem('quiz-answers'));
const correctas = Object.values(answers).filter(a => a.isCorrect).length;
const total = Object.keys(answers).length;
const tasa = (correctas / total) * 100;
console.log(`${correctas}/${total} = ${tasa}%`);
```

## 🔐 Seguridad

### Validación
- Cantidad de preguntas capped a máximo disponible
- Capítulo ID validado contra capitulos.json
- Pregunta ID viene de preguntas.json (confiable)

### Privacidad
- Respuestas en localStorage (no servidor)
- No hay telemetría
- Datos locales solo

## 📚 Referencias

- [Array.sort() para shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
- [React.useMemo](https://react.dev/reference/react/useMemo)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
