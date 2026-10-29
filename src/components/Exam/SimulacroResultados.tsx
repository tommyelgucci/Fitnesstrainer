import { Link } from 'react-router-dom';
import { Award, Brain, RotateCcw } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import { CONFIGS, META_APROBADO, fueContestada, formatearTiempo, puntaje, valorNota } from './simulacroUtils';
import type { Sesion } from './simulacroUtils';
import type { Pregunta } from '../../types';

export default function SimulacroResultados({ sesion, preguntas, onSalir }: { sesion: Sesion; preguntas: Pregunta[]; onSalir: () => void }) {
  const cfg = CONFIGS.find((c) => c.id === sesion.modo);
  const { suma, pct } = puntaje(sesion.ids, sesion.notas);
  const superado = pct >= META_APROBADO;
  const contestadas = preguntas.filter((p) => fueContestada(sesion.respuestas[p.id])).length;
  const tiempo = Math.min(sesion.duracionMs, Date.now() - sesion.inicio);

  const porCapitulo = capitulosData.capitulos
    .map((c) => {
      const ps = preguntas.filter((p) => p.capitulo_id === c.id);
      const s = ps.reduce((a, p) => a + valorNota(sesion.notas[p.id]), 0);
      return { c, total: ps.length, pct: ps.length ? Math.round((s / ps.length) * 100) : 0 };
    })
    .filter((x) => x.total > 0)
    .sort((a, b) => a.pct - b.pct);

  // Calibración: ¿tu seguridad coincide con tu resultado?
  const segurosFallados = preguntas.filter((p) => sesion.respuestas[p.id]?.confianza === 'seguro' && sesion.notas[p.id] !== 'ok');
  const dudososAcertados = preguntas.filter((p) => sesion.respuestas[p.id]?.confianza !== 'seguro' && fueContestada(sesion.respuestas[p.id]) && sesion.notas[p.id] === 'ok');
  const falladas = preguntas.filter((p) => sesion.notas[p.id] !== 'ok');

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className={`card ${superado ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
        <div className="flex items-start gap-4">
          <Award className={`h-10 w-10 flex-shrink-0 ${superado ? 'text-green-600' : 'text-amber-600'}`} />
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{cfg?.titulo}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{pct} %</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              {superado ? `¡Superaste la meta de ${META_APROBADO} %!` : `Meta de la app: ${META_APROBADO} %. Te faltan ${META_APROBADO - pct} puntos.`}
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">La meta es un objetivo de estudio de esta app, no el criterio oficial del examen.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Puntos', `${suma} / ${preguntas.length}`],
          ['Contestadas', `${contestadas} / ${preguntas.length}`],
          ['Tiempo', formatearTiempo(tiempo)],
          ['Por repasar', String(falladas.length)],
        ].map(([t, v]) => (
          <div key={t} className="card text-center">
            <p className="text-xs uppercase text-gray-600 dark:text-gray-400">{t}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{v}</p>
          </div>
        ))}
      </div>

      <div className="card space-y-2">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><Brain className="h-5 w-5 text-purple-600" /> Qué tan bien te conoces</h2>
        <p className="text-sm text-gray-800 dark:text-gray-200">
          {segurosFallados.length} {segurosFallados.length === 1 ? 'pregunta' : 'preguntas'} en las que ibas «seguro» y no acertaste del todo (las más peligrosas: se estudian poco).
        </p>
        <p className="text-sm text-gray-800 dark:text-gray-200">
          {dudososAcertados.length} en las que dudabas o no sabías y acertaste (sabes más de lo que crees).
        </p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">Por capítulo (de peor a mejor)</h2>
        {porCapitulo.map(({ c, total, pct: p }) => (
          <div key={c.id}>
            <div className="flex items-center justify-between text-sm">
              <Link to={`/lecciones/${c.id}/lectura`} className="text-blue-600 hover:underline dark:text-blue-400">
                Cap. {c.numero}{c.subtitulo ? `.${c.subtitulo.split('.')[1]}` : ''} · {c.titulo_es}
              </Link>
              <span className="text-gray-700 dark:text-gray-300">{p} % ({total})</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
              <div className={`h-full ${p >= META_APROBADO ? 'bg-green-500' : p >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500">Toca un capítulo para leerlo en el modo lectura.</p>
      </div>

      {falladas.length > 0 && (
        <div className="card space-y-2">
          <h2 className="font-semibold text-gray-900 dark:text-white">Para repasar ({falladas.length})</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Ya se añadieron a tu repaso Leitner. Aquí van las primeras:</p>
          <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
            {falladas.slice(0, 8).map((p) => (
              <li key={p.id}>• {p.pregunta_es}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <button className="btn btn-primary flex-1" onClick={onSalir}><RotateCcw className="mr-2 h-4 w-4" /> Otro simulacro</button>
        <Link to="/flashcards" className="btn btn-secondary flex-1">Repasar con flashcards</Link>
      </div>
    </div>
  );
}
