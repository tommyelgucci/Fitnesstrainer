import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import preguntasData from '../../data/lectura_preguntas.json';
import { registrarRespuestaXP } from '../../stores/gamificacion';

interface PreguntaLectura {
  p: string;
  o: string[];
  c: number;
  e: string;
}

const PREGUNTAS = preguntasData as Record<string, PreguntaLectura[]>;

/** Preguntas de comprensión al final de una sección. Solo la primera respuesta de cada una da XP. */
export default function Comprobacion({ clave }: { clave: string }) {
  const preguntas = PREGUNTAS[clave] ?? [];
  const [elegidas, setElegidas] = useState<Record<number, number>>({});
  if (preguntas.length === 0) return null;

  const responder = (i: number, k: number) => {
    if (elegidas[i] !== undefined) return;
    registrarRespuestaXP(k === preguntas[i].c);
    setElegidas((prev) => ({ ...prev, [i]: k }));
  };

  const hechas = Object.keys(elegidas).length;
  const aciertos = preguntas.filter((q, i) => elegidas[i] === q.c).length;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">Comprueba lo leído</h2>
        {hechas === preguntas.length && (
          <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">{aciertos}/{preguntas.length} aciertos</span>
        )}
      </div>
      {preguntas.map((q, i) => (
        <div key={q.p} className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{i + 1}. {q.p}</p>
          <div className="grid gap-2">
            {q.o.map((op, k) => {
              const elegida = elegidas[i];
              const respondida = elegida !== undefined;
              const estilo = !respondida
                ? 'border-gray-300 hover:border-teal-500 dark:border-gray-600'
                : k === q.c
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : k === elegida
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : 'border-gray-200 opacity-60 dark:border-gray-700';
              return (
                <button key={op} onClick={() => responder(i, k)} className={`rounded-lg border-2 p-2 text-left text-sm text-gray-900 dark:text-gray-100 ${estilo}`}>
                  {op}
                </button>
              );
            })}
          </div>
          {elegidas[i] !== undefined && (
            <p className={`flex items-start gap-2 text-sm ${elegidas[i] === q.c ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {elegidas[i] === q.c ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
              <span>{q.e}</span>
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
