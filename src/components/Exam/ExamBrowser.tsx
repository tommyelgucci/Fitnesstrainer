import { useMemo, useState } from 'react';
import { Clock, Play, RotateCw } from 'lucide-react';
import SimulacroViewer from './SimulacroViewer';
import { CONFIGS, META_APROBADO, elegirPreguntas, formatearTiempo } from './simulacroUtils';
import type { ConfigSimulacro, Sesion } from './simulacroUtils';
import { borrarSesion, leerHistorial, leerSesion } from '../../stores/simulacros';
import { useUserProgress } from '../../stores/useUserProgress';

export default function ExamBrowser() {
  const { progress } = useUserProgress();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [tick, setTick] = useState(0);
  const pendiente = useMemo(() => leerSesion(), [sesion, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const historial = useMemo(() => leerHistorial(), [sesion, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const erroresIds = Object.values(progress.respuestas_guardadas).filter((r) => !r.correcta).map((r) => r.pregunta_id);

  const empezar = (cfg: ConfigSimulacro) => {
    const preguntas = elegirPreguntas(cfg, erroresIds);
    if (preguntas.length === 0) return;
    setSesion({
      modo: cfg.id,
      ids: preguntas.map((p) => p.id),
      inicio: Date.now(),
      duracionMs: cfg.minutos * 60_000,
      fase: 'examen',
      respuestas: {},
      notas: {},
      indice: 0,
    });
  };

  if (sesion) return <SimulacroViewer inicial={sesion} onSalir={() => { setSesion(null); setTick((t) => t + 1); }} />;

  const restantePend = pendiente ? pendiente.inicio + pendiente.duracionMs - Date.now() : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card bg-red-50 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Simulacro de examen</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Contesta con el reloj en marcha y sin ver las respuestas; después corrígete con la respuesta modelo. Tus fallos pasan al repaso Leitner y ganas XP.
            </p>
          </div>
        </div>
      </div>

      {pendiente && (
        <div className="card flex flex-wrap items-center gap-3 border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
          <RotateCw className="h-6 w-6 text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Tienes un simulacro sin terminar</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {CONFIGS.find((c) => c.id === pendiente.modo)?.titulo} · {pendiente.fase === 'examen' ? (restantePend > 0 ? `quedan ${formatearTiempo(restantePend)}` : 'tiempo agotado: pasa a corrección') : 'en corrección'}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setSesion(pendiente)}>Continuar</button>
          <button className="btn btn-secondary" onClick={() => { borrarSesion(); setTick((t) => t + 1); }}>Descartar</button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {CONFIGS.map((c) => {
          const n = c.id === 'errores' ? Math.min(c.preguntas, erroresIds.length) : c.preguntas;
          const sinErrores = c.id === 'errores' && erroresIds.length === 0;
          return (
            <button
              key={c.id}
              disabled={sinErrores}
              onClick={() => empezar(c)}
              className="card text-left transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <p className="text-3xl">{c.emoji}</p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">{c.titulo}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{c.descripcion}</p>
              <p className="mt-2 flex items-center gap-1 text-sm font-medium text-red-700 dark:text-red-400">
                <Play className="h-4 w-4" /> {sinErrores ? 'Aún no tienes errores guardados' : `${n} preguntas · ${c.minutos} min`}
              </p>
            </button>
          );
        })}
      </div>

      <div className="card space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <h2 className="font-semibold text-gray-900 dark:text-white">Cómo funciona</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Respondes cada pregunta (puedes escribir tu respuesta) y marcas qué tan seguro vas. Puedes marcar preguntas para volver a ellas.</li>
          <li>Entregas, o el reloj lo hace por ti al llegar a 0. Si recargas la página, el simulacro sigue donde lo dejaste.</li>
          <li>En la corrección ves tu respuesta junto a la modelo y te calificas: correcta, a medias (cuenta la mitad) o fallada.</li>
          <li>Resultado por capítulo, calibración de tu seguridad y repaso automático de lo fallado.</li>
        </ol>
        <p className="text-xs text-gray-500">
          Aviso: los tiempos y la meta de {META_APROBADO} % son formatos de estudio de esta app; no sustituyen las condiciones del examen oficial de la clever fit Akademie.
        </p>
      </div>

      {historial.length > 0 && (
        <div className="card space-y-2">
          <h2 className="font-semibold text-gray-900 dark:text-white">Tus simulacros</h2>
          <ul className="divide-y divide-gray-200 text-sm dark:divide-gray-700">
            {[...historial].reverse().slice(0, 8).map((h) => (
              <li key={h.fecha} className="flex items-center justify-between py-1.5 text-gray-800 dark:text-gray-200">
                <span>{new Date(h.fecha).toLocaleDateString('es')} · {CONFIGS.find((c) => c.id === h.modo)?.titulo}</span>
                <span className={`font-semibold ${h.pct >= META_APROBADO ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{h.pct} %</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
