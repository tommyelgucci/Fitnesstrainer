import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Volume2, RotateCcw } from 'lucide-react';
import { imagenes } from '../../data/imagenesInfo';
import { barajar, itemsDe, modoEfectivo } from './quizUtils';
import type { Item, Modo, ModoQuiz } from './quizUtils';
import ImagenInteractiva from './ImagenInteractiva';
import { hablarAleman } from './hablar';
import { registrarRespuestaXP, rondaCompletada } from '../../stores/gamificacion';
import { responderTermino } from '../../stores/repasoTerminos';

interface Pregunta {
  modo: Modo;
  item: Item;
  opciones: Item[];
}

function crearPreguntas(items: Item[], modo: ModoQuiz, n: number): Pregunta[] {
  const todos = itemsDe(imagenes, 'vocab');
  return barajar(items)
    .slice(0, n)
    .map((item) => {
      const m = modoEfectivo(modo, item.t);
      const mismos = items.filter((o) => o.img.id === item.img.id && o.t.de !== item.t.de);
      const otros = todos.filter((o) => o.t.de !== item.t.de && !mismos.includes(o));
      const pool = [...barajar(mismos), ...barajar(otros)];
      const vistos = new Set([item.t.de]);
      const distractores: Item[] = [];
      for (const o of pool) {
        const clave = m === 'puntos' ? o.t.de : o.t.es;
        if (vistos.has(o.t.de) || vistos.has(clave)) continue;
        vistos.add(o.t.de);
        vistos.add(clave);
        distractores.push(o);
        if (distractores.length === 3) break;
      }
      return { modo: m, item, opciones: barajar([item, ...distractores]) };
    });
}

export default function ImagenQuiz({
  items,
  modo,
  cantidad = 10,
  onSalir,
}: {
  items: Item[];
  modo: ModoQuiz;
  cantidad?: number;
  onSalir: () => void;
}) {
  const [ronda, setRonda] = useState(0);
  const preguntas = useMemo(
    () => crearPreguntas(items, modo, cantidad),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, modo, cantidad, ronda],
  );
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fallos, setFallos] = useState<Item[]>([]);

  const terminada = preguntas.length > 0 && i >= preguntas.length;
  useEffect(() => {
    if (terminada) rondaCompletada(aciertos, preguntas.length);
    // solo al terminar la ronda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminada]);

  const reiniciar = () => {
    setRonda((r) => r + 1);
    setI(0);
    setElegida(null);
    setAciertos(0);
    setFallos([]);
  };

  if (preguntas.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-gray-700 dark:text-gray-300">No hay términos para practicar aquí todavía.</p>
        <button className="btn btn-secondary mt-3" onClick={onSalir}>Volver</button>
      </div>
    );
  }

  if (i >= preguntas.length) {
    const pct = Math.round((aciertos / preguntas.length) * 100);
    return (
      <div className="card space-y-4 text-center">
        <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{aciertos} / {preguntas.length}</p>
        <p className="text-gray-700 dark:text-gray-300">
          {pct === 100 ? '¡Perfecto! Dominas estos términos.' : pct >= 70 ? '¡Muy bien! Repasa los que fallaste.' : 'Sigue practicando: cada ronda lo fija mejor.'}
        </p>
        {fallos.length > 0 && (
          <div className="rounded-lg bg-red-50 p-3 text-left text-sm dark:bg-red-900/20">
            <p className="mb-2 font-semibold text-red-800 dark:text-red-300">Para repasar:</p>
            <ul className="space-y-1">
              {fallos.map((f, k) => (
                <li key={k} className="text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">{f.t.de}</span> = {f.t.es}{' '}
                  <Link to={`/imagenes/${f.img.id}`} className="text-teal-600 underline dark:text-teal-400">(ver figura)</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-center gap-2">
          <button className="btn btn-primary" onClick={reiniciar}><RotateCcw className="mr-1 h-4 w-4" /> Otra ronda</button>
          <button className="btn btn-secondary" onClick={onSalir}>Salir</button>
        </div>
      </div>
    );
  }

  const p = preguntas[i];
  const respondida = elegida !== null;
  const correcta = p.opciones.findIndex((o) => o === p.item);

  const responder = (k: number) => {
    if (respondida) return;
    setElegida(k);
    registrarRespuestaXP(k === correcta);
    responderTermino(p.item.img.id, p.item.t.de, k === correcta);
    if (k === correcta) setAciertos((a) => a + 1);
    else setFallos((f) => [...f, p.item]);
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Pregunta {i + 1} de {preguntas.length}</span>
        <button className="underline" onClick={onSalir}>Salir</button>
      </div>
      <div className="h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
        <div className="h-full bg-teal-500 transition-all" style={{ width: `${(i / preguntas.length) * 100}%` }} />
      </div>

      {p.modo === 'puntos' ? (
        <>
          <p className="font-semibold text-gray-900 dark:text-white">¿Qué estructura señala el punto?</p>
          <ImagenInteractiva img={p.item.img} activo={null} soloIndice={p.item.indice} />
        </>
      ) : (
        <p className="text-center text-xl font-bold text-gray-900 dark:text-white">
          {p.item.t.de}{' '}
          <button className="align-middle text-teal-600 dark:text-teal-400" onClick={() => hablarAleman(p.item.t.de)} aria-label="Escuchar">
            <Volume2 className="inline h-5 w-5" />
          </button>
          <span className="mt-1 block text-sm font-normal text-gray-500">¿Qué significa en español?</span>
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {p.opciones.map((o, k) => {
          const texto = p.modo === 'puntos' ? o.t.de : o.t.es;
          const sub = respondida ? (p.modo === 'puntos' ? o.t.es : o.t.de) : null;
          const estilo = !respondida
            ? 'border-gray-300 hover:border-teal-500 dark:border-gray-600'
            : k === correcta
              ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
              : k === elegida
                ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                : 'border-gray-200 opacity-60 dark:border-gray-700';
          return (
            <button key={k} onClick={() => responder(k)} className={`rounded-lg border-2 p-3 text-left text-sm text-gray-900 transition-colors dark:text-gray-100 ${estilo}`}>
              <span className="font-medium">{texto}</span>
              {sub && <span className="block text-xs italic text-gray-600 dark:text-gray-400">{sub}</span>}
            </button>
          );
        })}
      </div>

      {respondida && (
        <div className="space-y-2">
          <p className={`flex items-center gap-2 font-semibold ${elegida === correcta ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {elegida === correcta ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {elegida === correcta ? '¡Correcto!' : `Era: ${p.item.t.de} (${p.item.t.es})`}
          </p>
          {p.item.t.nota && <p className="text-sm text-gray-700 dark:text-gray-300">{p.item.t.nota}</p>}
          <button className="btn btn-primary" onClick={() => { setI(i + 1); setElegida(null); }}>
            {i + 1 === preguntas.length ? 'Ver resultado' : 'Siguiente'}
          </button>
        </div>
      )}
    </div>
  );
}
