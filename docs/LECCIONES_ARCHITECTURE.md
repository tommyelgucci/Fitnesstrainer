# Arquitectura del Módulo Lecciones

## 🎯 Propósito

Módulo de estudio estructurado por capítulos que integra:
- Contenido de preguntas organizadas por tema
- Seguimiento de progreso con el sistema Leitner
- Visualización de estadísticas por capítulo

## 📊 Diagrama de Flujo

```
Usuario navega a /lecciones
    ↓
┌─────────────────────────────────┐
│ LeccionesIndex                  │
│ - Carga capitulos.json          │
│ - Calcula stats para cada cap   │
│ - Muestra índice con progreso   │
└────┬────────────────────────────┘
     │
     ↓ (Click en capítulo)
┌─────────────────────────────────┐
│ CapituloDetail                  │
│ - Filtra preguntas del cap      │
│ - Agrupa por subcapítulo        │
│ - Muestra cada pregunta         │
└────┬────────────────────────────┘
     │
     ├─→ Usuario responde
     │
     ├─────────────────────────────┐
     │                             │
     ↓                             ↓
┌──────────────────┐    ┌──────────────────┐
│ useLeitner()     │    │ useUserProgress()│
│ responderP()     │    │ registrarResp()  │
│ actualiza caja   │    │ guarda historial │
│ próximo repaso   │    │ actualiza racha  │
└──────────────────┘    └──────────────────┘
     │                             │
     └─────────────┬───────────────┘
                   ↓
            localStorage
            ├─ fitness-trainer:leitner-cards
            └─ fitness-trainer:progress
```

## 🗂️ Estructura de Archivos

```
src/
├── components/
│   └── Lecciones/
│       ├── LeccionesIndex.tsx       # Índice de capítulos
│       └── CapituloDetail.tsx       # Detalles de un capítulo
│
├── data/
│   ├── capitulos.json               # Metadata de capítulos
│   └── preguntas.json               # Preguntas del examen
│
├── stores/
│   ├── useLeitner.ts                # Lógica de cajas (existente)
│   └── useUserProgress.ts           # Historial de respuestas (existente)
│
├── types/
│   └── index.ts                     # Interfaces (Pregunta, Capitulo, etc.)
│
└── App.tsx                          # Rutas:
                                     # /lecciones
                                     # /lecciones/:capitulo_id

docs/
├── LECCIONES_USAGE.md               # Guía de uso
└── LECCIONES_ARCHITECTURE.md        # Este archivo
```

## 🔄 Flujo de Datos

### 1. Carga Inicial (LeccionesIndex)

```typescript
// App.tsx monta el componente
<Route path="/lecciones" element={<LeccionesIndex />} />

// Dentro del componente
function LeccionesIndex() {
  const { tarjetas } = useLeitner();           // Lee del localStorage
  const { progress } = useUserProgress();      // Lee del localStorage
  
  // Data estática importada
  const capitulos = capitulosData.capitulos;
  const preguntas = preguntasData.preguntas;
  
  // Para cada capítulo, calcula:
  const getCapituloStats = (capId) => {
    const preguntasDelCap = preguntas.filter(p => p.capitulo_id === capId);
    const respondidas = preguntasDelCap.filter(
      p => progress.respuestas_guardadas[p.id]
    );
    const dominadas = preguntasDelCap.filter(
      p => tarjetas.find(t => t.pregunta_id === p.id)?.numero_caja === 5
    );
    return { total, respondidas, dominadas, porcentajes };
  };
  
  return <div>capitulos.map(cap => renderCard(cap, getCapituloStats(cap.id)))</div>;
}
```

### 2. Navegación a Capítulo (CapituloDetail)

```typescript
// Usuario hace click en card de capítulo
<Link to={`/lecciones/${capitulo.id}`} />
// → React Router navega a /lecciones/k3.3
// → Se monta CapituloDetail

function CapituloDetail() {
  const { capitulo_id } = useParams();
  
  // Busca metadata del capítulo
  const capitulo = capitulosData.capitulos.find(c => c.id === capitulo_id);
  
  // Filtra preguntas del capítulo
  const preguntas = preguntasData.preguntas.filter(
    p => p.capitulo_id === capitulo_id
  );
  
  // Si el capítulo tiene subcapítulos, agrupa
  if (capitulo.subcapitulos?.length > 0) {
    // Muestra organizadas por subcapítulo
  } else {
    // Muestra todas sin agrupar
  }
}
```

### 3. Respuesta de Pregunta (CapituloDetail)

```typescript
const handleRespuesta = (preguntaId: string, correcta: boolean) => {
  // 1. Actualiza Leitner
  responderPregunta(preguntaId, correcta);
  // → Si correcta: caja++, si incorrecta: caja=1
  // → Calcula fecha_proximo_repaso
  // → Se guarda a localStorage automáticamente
  
  // 2. Registra en historial
  registrarRespuesta(preguntaId, correcta);
  // → Agrega a respuestas_guardadas
  // → Actualiza ultimas_preguntas_vistas
  // → Se guarda a localStorage automáticamente
  
  // 3. Re-render (automático)
  // → UI refleja nuevo estado inmediatamente
};

// Botones del componente
<button onClick={() => handleRespuesta(preguntaId, true)}>
  ✅ Correcto
</button>
<button onClick={() => handleRespuesta(preguntaId, false)}>
  ❌ Incorrecto
</button>
```

## 📈 Cálculo de Estadísticas

### Por Capítulo

```typescript
const getCapituloStats = (capituloId: string) => {
  // 1. Total preguntas en el capítulo
  const preguntasDelCapitulo = preguntas.filter(
    p => p.capitulo_id === capituloId
  );
  
  // 2. Preguntas respondidas
  const respondidas = preguntasDelCapitulo.filter(
    p => progress.respuestas_guardadas[p.id]
  );
  
  // 3. Respuestas correctas (solo de respondidas)
  const correctas = respondidas.filter(
    p => progress.respuestas_guardadas[p.id].correcta
  );
  
  // 4. Preguntas dominadas (Caja 5)
  const dominadas = preguntasDelCapitulo.filter(p => {
    const tarjeta = tarjetas.find(t => t.pregunta_id === p.id);
    return tarjeta && tarjeta.numero_caja === 5;
  });
  
  // 5. Calcular porcentajes
  return {
    total: preguntasDelCapitulo.length,
    respondidas: respondidas.length,
    correctas: correctas.length,
    dominadas: dominadas.length,
    porcentajeRespuestas: (respondidas.length / total) * 100,
    porcentajeAciertos: (correctas.length / respondidas.length) * 100,
    porcentajeDominadas: (dominadas.length / total) * 100,
  };
};
```

## 🎨 Componentes

### LeccionesIndex.tsx

**Props**: Ninguno (datos de localStorage)

**State**: 
- Local del componente no hay (solo lectura)
- Global: `useLeitner()`, `useUserProgress()`

**Render**:
- Card por cada capítulo
- Barras de progreso (respondidas, aciertos, dominadas)
- Peso del capítulo como badge
- Link a `/lecciones/:capitulo_id`

**Responsabilidades**:
- Mostrar todos los capítulos
- Calcular stats de cada capítulo
- Proporcionar navegación

### CapituloDetail.tsx

**Props**: Ninguno

**Hooks**:
- `useParams()` → obtiene capitulo_id de URL
- `useNavigate()` → vuelve a /lecciones
- `useLeitner()` → responderPregunta()
- `useUserProgress()` → registrarRespuesta()

**State**:
- Local: Ninguno (todo en localStorage)
- Global: tarjetas, progress

**Render**:
- Header con datos del capítulo
- Preguntas agrupadas por subcapítulo (si aplica)
- Cada pregunta con:
  - Número
  - Enunciado
  - Respuesta
  - Explicación
  - Botones de respuesta
  - Indicador de estado

**Responsabilidades**:
- Mostrar preguntas de un capítulo
- Integrar respuestas con Leitner
- Mantener UI sincronizada

## 💾 Flujo de Persistencia

### Datos Estáticos (no cambian)

```javascript
// src/data/capitulos.json
import capitulosData from '../../data/capitulos.json';
// → Importado y usado directamente, no hay persistencia

// src/data/preguntas.json
import preguntasData from '../../data/preguntas.json';
// → Importado y usado directamente, no hay persistencia
```

### Datos Dinámicos (localStorage)

```javascript
// En useLeitner()
localStorage.setItem('fitness-trainer:leitner-cards', JSON.stringify(tarjetas));
// Se actualiza cuando: responderPregunta()

// En useUserProgress()
localStorage.setItem('fitness-trainer:progress', JSON.stringify(progress));
// Se actualiza cuando: registrarRespuesta()

// Lectura automática al montar componentes
useEffect(() => {
  const saved = localStorage.getItem('fitness-trainer:leitner-cards');
  setTarjetas(saved ? JSON.parse(saved) : []);
}, []);
```

## 🔐 Consideraciones de Seguridad

### Validación de Entrada

```typescript
// URL parameter validation
const { capitulo_id } = useParams();
const capitulo = capitulosData.capitulos.find(c => c.id === capitulo_id);
if (!capitulo) {
  return <div>Capítulo no encontrado</div>;
}
```

### Tipos TypeScript

```typescript
interface Pregunta {
  id: string;
  capitulo_id: string;
  numero: number;
  pregunta_es: string;
  respuesta_es: string;
  explicacion_es?: string;
  // ... otros campos
}

interface Capitulo {
  id: string;
  numero: number;
  titulo_es: string;
  peso: number;
  subcapitulos?: Subcapitulo[];
}
```

## 🚀 Performance

- **Índice (10 capítulos)**: ~100ms render
- **Detalle (20-40 preguntas)**: ~200ms render
- **Búsqueda de pregunta**: O(n), ~1ms
- **Filtrado de capítulo**: O(n), ~2ms
- **Cálculo de stats**: O(n*m), ~5ms (n=capítulos, m=preguntas)

### Optimizaciones Futuras

```typescript
// Usar useMemo para cálculos costosos
const stats = useMemo(
  () => getCapituloStats(capitulo_id),
  [capitulo_id, tarjetas, progress]
);

// Usar useCallback para event handlers
const handleRespuesta = useCallback(
  (id, correcta) => { ... },
  [responderPregunta, registrarRespuesta]
);
```

## 🧪 Testing

### Unit Tests

```typescript
test('getCapituloStats calcula correctamente', () => {
  const stats = getCapituloStats('k3.3');
  expect(stats.total).toBe(20);
  expect(stats.respondidas).toBeGreaterThanOrEqual(0);
  expect(stats.porcentajeRespuestas).toBeLessThanOrEqual(100);
});

test('handleRespuesta actualiza Leitner y Progreso', async () => {
  const { result } = renderHook(() => useLeitner());
  act(() => {
    result.current.responderPregunta('p1', true);
  });
  expect(result.current.tarjetas[0].numero_caja).toBe(2);
});
```

### Integration Tests

```typescript
test('Flujo completo: navegar → responder → verificar progreso', async () => {
  render(<App />);
  
  // 1. Navegar
  userEvent.click(screen.getByText('Lecciones'));
  expect(screen.getByText('Cap. 3.3')).toBeInTheDocument();
  
  // 2. Click en capítulo
  userEvent.click(screen.getByText('Cap. 3.3'));
  expect(screen.getByText(/Aparato locomotor pasivo/)).toBeInTheDocument();
  
  // 3. Responder
  const btnCorrecto = screen.getAllByText('✅ Correcto')[0];
  userEvent.click(btnCorrecto);
  expect(btnCorrecto).toHaveClass('bg-green-500');
  
  // 4. Volver y verificar progreso
  userEvent.click(screen.getByText('Volver a lecciones'));
  expect(screen.getByText('1/20')).toBeInTheDocument();
});
```

## 🐛 Debugging

### Ver estado de un capítulo

```javascript
// En consola del navegador
const capId = 'k3.3';
const preguntas = JSON.parse(localStorage.getItem('fitness-trainer:preguntas'));
const progress = JSON.parse(localStorage.getItem('fitness-trainer:progress'));

const preguntasDelCap = preguntas.filter(p => p.capitulo_id === capId);
const respondidas = preguntasDelCap.filter(
  p => progress.respuestas_guardadas[p.id]
);

console.log(`${capId}: ${respondidas.length}/${preguntasDelCap.length} respondidas`);
```

### Resetear progreso de un capítulo

```javascript
const progress = JSON.parse(localStorage.getItem('fitness-trainer:progress'));
const capId = 'k3.3';

// Filtra y elimina respuestas de ese capítulo
const preguntas = JSON.parse(localStorage.getItem('fitness-trainer:preguntas'));
preguntas
  .filter(p => p.capitulo_id === capId)
  .forEach(p => {
    delete progress.respuestas_guardadas[p.id];
  });

localStorage.setItem('fitness-trainer:progress', JSON.stringify(progress));
location.reload();
```

## 📚 Referencias

- [React Router - useParams](https://reactrouter.com/en/main/hooks/use-params)
- [React Router - useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
