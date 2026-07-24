# Sistema Leitner - Guía de Uso

## Descripción

El sistema Leitner implementa un algoritmo de **repetición espaciada** con 5 cajas:

| Caja | Intervalo | Caso de uso |
|------|-----------|------------|
| **1** | 1 día | Preguntas recién fallidas |
| **2** | 3 días | Preguntas aprendidas hace poco |
| **3** | 7 días | Preguntas en consolidación |
| **4** | 14 días | Preguntas bien aprendidas |
| **5** | 30 días | Preguntas dominadas (opcional) |

## Arquitectura

### `src/utils/leitner.ts` - Lógica Pura

Funciones de negocio sin estado:

```typescript
// Crear tarjeta nueva
const tarjeta = crearTarjeta('p1');

// Procesar respuesta (correcta = avanza, incorrecta = retrocede a caja 1)
const tarjetaActualizada = procesarRespuesta(tarjeta, true);

// Obtener tarjetas a repasar hoy
const hoy = obtenerTarjetasParaHoy([tarjeta1, tarjeta2, ...]);

// Estadísticas
const stats = calcularStats(tarjetas);
console.log(stats.por_caja); // [5, 10, 15, 20, 30] = distribución por caja
console.log(stats.proximas_hoy); // ['p1', 'p3', ...] = IDs a repasar hoy
```

### `src/stores/useLeitner.ts` - Hook React con localStorage

Maneja el estado persistente:

```typescript
function MiComponente() {
  const {
    tarjetas,          // Array de LeitnerCard
    stats,             // Stats calculadas
    progreso_dominadas, // % en caja 5

    // Acciones
    inicializarTarjetas,  // Crear tarjetas para un conjunto
    responderPregunta,     // Procesar respuesta + actualizar
    obtenerTarjetasHoy,    // Las de hoy
    obtenerPreguntasHoy,   // Solo IDs
    exportarDatos,         // Para backup
    importarDatos,         // Restaurar backup
  } = useLeitner();

  return (...);
}
```

### `src/stores/useUserProgress.ts` - Rastreo de Respuestas

Historial independiente de Leitner:

```typescript
function QuestionComponent() {
  const { registrarRespuesta, obtenerTasaExito } = useUserProgress();

  const handleRespuesta = (correcta: boolean) => {
    registrarRespuesta('p1', correcta);
  };

  const tasaExito = obtenerTasaExito(); // 75% en general
}
```

## Flujo de Uso

### 1. Inicialización

```typescript
function App() {
  const { inicializarTarjetas } = useLeitner();
  const preguntas = require('./data/preguntas.json');

  useEffect(() => {
    const ids = preguntas.preguntas.map(p => p.id);
    inicializarTarjetas(ids);
  }, []);
}
```

### 2. Responder Pregunta

```typescript
function PreguntaComponent({ pregunta_id, respuesta_correcta }) {
  const { responderPregunta } = useLeitner();
  const { registrarRespuesta } = useUserProgress();

  const handleRespuesta = async (correcta: boolean) => {
    // 1. Actualizar Leitner
    responderPregunta(pregunta_id, correcta);

    // 2. Registrar en historial
    registrarRespuesta(pregunta_id, correcta);

    // 3. Mostrar feedback
    if (correcta) {
      showSuccess('¡Correcto! Se mueve a siguiente caja');
    } else {
      showError('Incorrecto. Vuelve a caja 1');
    }
  };
}
```

### 3. Obtener Preguntas para Hoy

```typescript
function LecciónesHoy() {
  const { obtenerPreguntasHoy, stats } = useLeitner();

  const preguntasHoy = obtenerPreguntasHoy();

  return (
    <div>
      <p>Tienes {stats.proximas_hoy.length} preguntas para repasar hoy</p>
      <p>Esta semana: {stats.proximas_esta_semana.length}</p>

      {preguntasHoy.map(id => (
        <Pregunta key={id} pregunta_id={id} />
      ))}
    </div>
  );
}
```

### 4. Visualizar Progreso

```typescript
import LeitnerVisualizer from './components/Leitner/LeitnerVisualizer';

function Dashboard() {
  const { stats, progreso_dominadas } = useLeitner();

  return (
    <LeitnerVisualizer stats={stats} progreso_dominadas={progreso_dominadas} />
  );
}
```

## Datos Persistidos

### localStorage - Tarjetas Leitner

```json
{
  "fitness-trainer:leitner-cards": [
    {
      "pregunta_id": "p1",
      "numero_caja": 2,
      "fecha_proximo_repaso": 1690000000000,
      "veces_correctas": 3,
      "veces_incorrectas": 1,
      "fecha_creacion": 1689000000000,
      "fecha_ultima_respuesta": 1689500000000
    }
  ]
}
```

### localStorage - Progreso del Usuario

```json
{
  "fitness-trainer:progress": {
    "capitulos_progreso": {},
    "respuestas_guardadas": {
      "p1": { "pregunta_id": "p1", "correcta": true, "fecha": 1689500000000 }
    },
    "ultimas_preguntas_vistas": ["p1", "p2", "p3"],
    "fecha_ultima_actividad": 1689500000000,
    "racha_dias": 5
  }
}
```

## API Completa

### Funciones de `leitner.ts`

- `crearTarjeta(id)` - Nueva tarjeta en caja 1
- `procesarRespuesta(tarjeta, correcta)` - Actualizar según respuesta
- `obtenerTarjetasParaHoy(tarjetas)` - Filtrar vencidas
- `obtenerPreguntasParaHoy(tarjetas)` - Solo IDs
- `calcularStats(tarjetas)` - Estadísticas completas
- `obtenerTarjetasCriticas(tarjetas)` - Las urgentes
- `obtenerProgresoDominadas(tarjetas)` - % en caja 5
- `resetearTarjeta(tarjeta)` - Volver a caja 1
- `formatearTiempoProxRepaso(fecha)` - "Mañana", "3 días", etc.
- `obtenerEstadisticasPorPregunta(tarjeta)` - Stats individuales

### Hooks

- `useLeitner()` - Tarjetas + actions
- `useUserProgress()` - Respuestas + racha

## Ejemplos de Casos de Uso

### Caso 1: "Repasar mis fallos"

```typescript
function RevisarFallos() {
  const { tarjetas } = useLeitner();
  const { respuestas_guardadas } = useUserProgress().progress;

  // Preguntas fallidas
  const fallidas = tarjetas.filter(t => {
    const respuesta = respuestas_guardadas[t.pregunta_id];
    return respuesta && !respuesta.correcta;
  });

  // Ordenar por frecuencia de fallo
  fallidas.sort((a, b) => b.veces_incorrectas - a.veces_incorrectas);

  return fallidas.map(t => <Pregunta key={t.pregunta_id} tarjeta={t} />);
}
```

### Caso 2: "Términos más difíciles"

```typescript
function TerminosDificiles() {
  const { tarjetas } = useLeitner();

  // Ordenar por tasa de fallo
  const porTasaFallo = tarjetas
    .map(t => ({
      ...t,
      tasa_fallo: t.veces_incorrectas / (t.veces_correctas + t.veces_incorrectas),
    }))
    .sort((a, b) => b.tasa_fallo - a.tasa_fallo)
    .slice(0, 10);

  return porTasaFallo.map(t => (
    <div key={t.pregunta_id}>
      Fallo {t.veces_incorrectas}x ({t.tasa_fallo * 100}%)
    </div>
  ));
}
```

### Caso 3: "Examen simulado con tarjetas de hoy"

```typescript
function ExamenSimulado() {
  const { obtenerPreguntasHoy, responderPregunta } = useLeitner();
  const preguntasHoy = obtenerPreguntasHoy();

  // Barajar
  const preguntasBarajadas = preguntasHoy.sort(() => Math.random() - 0.5);

  return preguntasBarajadas.map(id => (
    <PreguntaExamen
      key={id}
      pregunta_id={id}
      onRespuesta={(correcta) => responderPregunta(id, correcta)}
    />
  ));
}
```

## Notas de Implementación

1. **Intervalos personalizables**: Edita `INTERVALOS_CAJA` en `leitner.ts` si quieres cambiar ritmos
2. **Caja 5 opcional**: Las preguntas en caja 5 se repiten cada 30 días. Para no repasar, filtra antes de renderizar
3. **Reintentos el mismo día**: Una pregunta puede repasar varias veces el mismo día si está en caja 1
4. **Sincronización**: Leitner + UserProgress funcionan independientes pero se leen juntos en componentes
5. **Export/Import**: Usa `exportarDatos()` para backup automático en settings

## Performance

- **Creación inicial**: 195 tarjetas ~1ms
- **Procesar respuesta**: ~0.5ms por tarjeta
- **Calcular stats**: ~2ms (se memorizan en render)
- **localStorage**: ~250KB (195 tarjetas)

## Testing

```typescript
// Ejemplo de test
import { crearTarjeta, procesarRespuesta, calcularStats } from './leitner';

test('respuesta correcta avanza a caja 2', () => {
  const t1 = crearTarjeta('p1');
  const t2 = procesarRespuesta(t1, true);
  expect(t2.numero_caja).toBe(2);
});

test('respuesta incorrecta retrocede a caja 1', () => {
  const t1 = crearTarjeta('p1');
  const t2 = procesarRespuesta(t1, true);
  const t3 = procesarRespuesta(t2, false);
  expect(t3.numero_caja).toBe(1);
});
```
