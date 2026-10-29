import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Flag, Send } from 'lucide-react';
import { useLeitner } from '../../stores/useLeitner';
import { useUserProgress } from '../../stores/useUserProgress';
import { guardarResultado, guardarSesion, borrarSesion } from '../../stores/simulacros';
import { simulacroCompletado } from '../../stores/gamificacion';
import { META_APROBADO, fueContestada, formatearTiempo, preguntaPorId, puntaje } from './simulacroUtils';
import type { Confianza, Nota, Respuesta, Sesion } from './simulacroUtils';
import SimulacroResultados from './SimulacroResultados';
import type { Pregunta } from '../../types';

const CONFIANZA: { id: Confianza; texto: string; estilo: string }[] = [
  { id: 'seguro', texto: '✅ Seguro', estilo: 'bg-green-600 text-white' },
  { id: 'dudo', texto: '🤔 Dudo', estilo: 'bg-amber-500 text-white' },
  { id: 'nose', texto: '❌ No sé', estilo: 'bg-red-600 text-white' },
];

export default function SimulacroViewer({ inicial, onSalir }: { inicial: Sesion; onSalir: () => void }) {
  const { responderPregunta } = useLeitner();
  const { registrarRespuesta } = useUserProgress();
  const [sesion, setSesion] = useState<Sesion>(inicial);
  const [ahora, setAhora] = useState(Date.now());
  const [confirmarEntrega, setConfirmarEntrega] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const guardado = useRef(false);

  const preguntas = useMemo(() => sesion.ids.map((id) => preguntaPorId(id)).filter((p): p is Pregunta => !!p), [sesion.ids]);
  const finTiempo = sesion.inicio + sesion.duracionMs;
  const restante = Math.max(0, finTiempo - ahora);
  const p = preguntas[sesion.indice];
  const resp: Respuesta = sesion.respuestas[p?.id] ?? { texto: '' };

  // Persistir cada cambio: un examen largo debe sobrevivir a una recarga.
  useEffect(() => {
    if (!terminado) guardarSesion(sesion);
  }, [sesion, terminado]);

  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Se acabó el tiempo: pasa a corrección automáticamente.
  useEffect(() => {
    if (sesion.fase === 'examen' && restante === 0) pasarACorreccion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante, sesion.fase]);

  const cambiar = (parcial: Partial<Sesion>) => setSesion((s) => ({ ...s, ...parcial }));
  const actualizarResp = (id: string, parcial: Partial<Respuesta>) =>
    setSesion((s) => ({ ...s, respuestas: { ...s.respuestas, [id]: { ...s.respuestas[id], texto: s.respuestas[id]?.texto ?? '', ...parcial } } }));

  const pasarACorreccion = () => {
    setConfirmarEntrega(false);
    // lo no contestado se califica como fallo; las contestadas esperan tu autocorrección
    const notas = { ...sesion.notas };
    for (const id of sesion.ids) if (!fueContestada(sesion.respuestas[id])) notas[id] = 'mal';
    setSesion((s) => ({ ...s, fase: 'correccion', notas, indice: Math.max(0, preguntas.findIndex((q) => fueContestada(s.respuestas[q.id]))) }));
    window.scrollTo({ top: 0 });
  };

  const terminarCorreccion = () => {
    if (guardado.current) return;
    guardado.current = true;
    const { pct } = puntaje(sesion.ids, sesion.notas);
    // Leitner y progreso: solo cuenta como acierto la nota completa
    for (const id of sesion.ids) {
      const ok = sesion.notas[id] === 'ok';
      responderPregunta(id, ok);
      registrarRespuesta(id, ok);
    }
    guardarResultado({ fecha: Date.now(), modo: sesion.modo, total: sesion.ids.length, pct, tiempoMs: Math.min(sesion.duracionMs, Date.now() - sesion.inicio) });
    simulacroCompletado(pct, META_APROBADO);
    borrarSesion();
    setTerminado(true);
    window.scrollTo({ top: 0 });
  };

  if (terminado) return <SimulacroResultados sesion={sesion} preguntas={preguntas} onSalir={onSalir} />;
  if (!p) {
    return (
      <div className="card text-center">
        <p className="text-gray-700 dark:text-gray-300">No hay preguntas en este simulacro.</p>
        <button className="btn btn-secondary mt-3" onClick={() => { borrarSesion(); onSalir(); }}>Volver</button>
      </div>
    );
  }

  const sinContestar = preguntas.filter((q) => !fueContestada(sesion.respuestas[q.id])).length;
  const marcadas = preguntas.filter((q) => sesion.respuestas[q.id]?.marcada).length;
  const critico = restante < 5 * 60_000;
  const aviso = restante < 10 * 60_000;

  /* ------------------------------ FASE: EXAMEN ------------------------------ */
  if (sesion.fase === 'examen') {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className={`card sticky top-0 z-30 flex items-center justify-between border-2 ${critico ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : aviso ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-blue-200 dark:border-blue-800'}`}>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Pregunta {sesion.indice + 1}/{preguntas.length}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{preguntas.length - sinContestar} contestadas · {marcadas} marcadas</p>
          </div>
          <div className={`rounded-lg px-3 py-1.5 font-mono text-lg font-bold text-white ${critico ? 'bg-red-600' : aviso ? 'bg-amber-500' : 'bg-blue-600'}`}>{formatearTiempo(restante)}</div>
        </div>

        <div className="card space-y-2 border-2 border-red-200 dark:border-red-800">
          <p className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">Pregunta {p.numero}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{p.pregunta_de}</p>
          <p className="text-sm italic text-gray-600 dark:text-gray-400">{p.pregunta_es}</p>
        </div>

        <div className="card space-y-3">
          <label htmlFor="resp" className="text-sm font-medium text-gray-900 dark:text-white">Tu respuesta (opcional: escríbela para compararla luego)</label>
          <textarea
            id="resp"
            value={resp.texto}
            onChange={(e) => actualizarResp(p.id, { texto: e.target.value })}
            rows={4}
            placeholder="Escribe tu respuesta en alemán o español…"
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <div className="grid grid-cols-3 gap-2">
            {CONFIANZA.map((c) => (
              <button
                key={c.id}
                onClick={() => actualizarResp(p.id, { confianza: resp.confianza === c.id ? undefined : c.id })}
                className={`rounded-lg px-2 py-2 text-sm font-medium ${resp.confianza === c.id ? c.estilo : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
              >
                {c.texto}
              </button>
            ))}
          </div>
          <button
            onClick={() => actualizarResp(p.id, { marcada: !resp.marcada })}
            className={`inline-flex items-center gap-2 text-sm ${resp.marcada ? 'font-semibold text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Flag className="h-4 w-4" /> {resp.marcada ? 'Marcada para revisar' : 'Marcar para revisar'}
          </button>
        </div>

        <div className="flex gap-2">
          <button className="btn btn-secondary flex-1" disabled={sesion.indice === 0} onClick={() => cambiar({ indice: sesion.indice - 1 })}>
            <ChevronLeft className="h-5 w-5" /> Anterior
          </button>
          <button className="btn btn-secondary flex-1" disabled={sesion.indice === preguntas.length - 1} onClick={() => cambiar({ indice: sesion.indice + 1 })}>
            Siguiente <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="card">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Ir a la pregunta</p>
          <div className="flex flex-wrap gap-1">
            {preguntas.map((q, i) => {
              const r = sesion.respuestas[q.id];
              const color = i === sesion.indice ? 'bg-blue-600 text-white ring-2 ring-blue-300' : r?.marcada ? 'bg-amber-400 text-gray-900' : fueContestada(r) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
              return (
                <button key={q.id} onClick={() => cambiar({ indice: i })} className={`h-8 w-8 rounded text-xs font-semibold ${color}`} aria-label={`Pregunta ${i + 1}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-gray-500">Verde: contestada · amarillo: marcada · gris: sin contestar</p>
        </div>

        {confirmarEntrega ? (
          <div className="card space-y-3 border-2 border-red-300 dark:border-red-700">
            <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><AlertTriangle className="h-5 w-5 text-red-600" /> ¿Entregar el examen?</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Te quedan {sinContestar} sin contestar y {marcadas} marcadas. Después pasarás a la corrección, donde verás las respuestas modelo.
            </p>
            <div className="flex gap-2">
              <button className="btn btn-danger flex-1" onClick={pasarACorreccion}>Sí, entregar</button>
              <button className="btn btn-secondary flex-1" onClick={() => setConfirmarEntrega(false)}>Seguir</button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button className="btn btn-danger flex-1" onClick={() => setConfirmarEntrega(true)}><Send className="mr-2 h-4 w-4" /> Entregar</button>
            <button className="btn btn-secondary" onClick={() => { guardarSesion(sesion); onSalir(); }}>Salir (se guarda)</button>
          </div>
        )}
      </div>
    );
  }

  /* ---------------------------- FASE: CORRECCIÓN ---------------------------- */
  const nota = sesion.notas[p.id];
  const contestada = fueContestada(sesion.respuestas[p.id]);
  const calificadas = preguntas.filter((q) => sesion.notas[q.id]).length;
  const faltan = preguntas.filter((q) => fueContestada(sesion.respuestas[q.id]) && !sesion.notas[q.id]).length;
  const esUltima = sesion.indice === preguntas.length - 1;
  const poner = (n: Nota) => setSesion((s) => ({ ...s, notas: { ...s.notas, [p.id]: n } }));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="card border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
        <p className="font-bold text-gray-900 dark:text-white">Corrección · {sesion.indice + 1}/{preguntas.length}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">Compara con la respuesta modelo y califícate con honestidad: eso es lo que alimenta tu repaso. Faltan por calificar: {faltan}.</p>
        <div className="mt-2 h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-green-500" style={{ width: `${(calificadas / preguntas.length) * 100}%` }} />
        </div>
      </div>

      <div className="card space-y-2">
        <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Pregunta {p.numero}</p>
        <p className="font-semibold text-gray-900 dark:text-white">{p.pregunta_de}</p>
        <p className="text-sm italic text-gray-600 dark:text-gray-400">{p.pregunta_es}</p>
      </div>

      <div className="card space-y-1">
        <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Tu respuesta {resp.confianza ? `· ${CONFIANZA.find((c) => c.id === resp.confianza)?.texto}` : ''}</p>
        <p className="whitespace-pre-line text-sm text-gray-900 dark:text-gray-100">{resp.texto.trim() || (contestada ? '(sin texto: solo marcaste tu confianza)' : '(sin contestar)')}</p>
      </div>

      <div className="card space-y-2 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">Respuesta modelo</p>
        <p className="whitespace-pre-line text-sm font-medium text-gray-900 dark:text-white">{p.respuesta_de}</p>
        {p.respuesta_es && <p className="whitespace-pre-line text-sm italic text-gray-600 dark:text-gray-400">{p.respuesta_es}</p>}
        {p.explicacion_es && <p className="border-t border-gray-200 pt-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">{p.explicacion_es}</p>}
      </div>

      <div className="card space-y-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{contestada ? '¿Cómo lo hiciste?' : 'Sin contestar: cuenta como fallo (no se puede calificar una pregunta que no respondiste).'}</p>
        <div className="grid grid-cols-3 gap-2">
          {([['ok', '✅ Correcta', 'bg-green-600 text-white'], ['parcial', '🟡 A medias', 'bg-amber-500 text-white'], ['mal', '❌ Fallé', 'bg-red-600 text-white']] as const).map(([id, texto, estilo]) => (
            <button key={id} disabled={!contestada && id !== 'mal'} onClick={() => poner(id)} className={`rounded-lg px-2 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${nota === id ? estilo : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{texto}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn btn-secondary flex-1" disabled={sesion.indice === 0} onClick={() => cambiar({ indice: sesion.indice - 1 })}><ChevronLeft className="h-5 w-5" /> Anterior</button>
        {esUltima ? (
          <button className="btn btn-success flex-1" disabled={faltan > 0} onClick={terminarCorreccion}>{faltan > 0 ? `Faltan ${faltan}` : 'Ver resultados'}</button>
        ) : (
          <button className="btn btn-secondary flex-1" onClick={() => cambiar({ indice: sesion.indice + 1 })}>Siguiente <ChevronRight className="h-5 w-5" /></button>
        )}
      </div>
      {faltan > 0 && esUltima && <p className="text-center text-xs text-amber-700 dark:text-amber-400">Hay preguntas contestadas sin calificar: revisa las anteriores.</p>}
    </div>
  );
}
