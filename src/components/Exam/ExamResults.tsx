import { BarChart3, Award, TrendingUp } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import type { Pregunta } from '../../types';

interface ExamAnswer {
  pregunta_id: string;
  answered: boolean;
  isCorrect: boolean;
}

interface ExamResultsProps {
  preguntas: Pregunta[];
  answers: Record<string, ExamAnswer>;
  timeUsed: number;
  onBack: () => void;
}

export default function ExamResults({
  preguntas,
  answers,
  timeUsed,
  onBack,
}: ExamResultsProps) {
  const respondidas = preguntas.filter((p) => answers[p.id]?.answered).length;
  const correctas = preguntas.filter(
    (p) => answers[p.id]?.answered && answers[p.id]?.isCorrect
  ).length;
  const incorrectas = respondidas - correctas;
  const noRespondidas = preguntas.length - respondidas;

  const tasaAcierto = respondidas > 0 ? Math.round((correctas / respondidas) * 100) : 0;

  // Determinar nivel
  const getNivel = () => {
    if (tasaAcierto >= 85) return { nivel: 'APROBADO', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
    if (tasaAcierto >= 70) return { nivel: 'BIEN', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    return { nivel: 'REPROBADO', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  };

  const nivelInfo = getNivel();

  // Calcular desempeño por capítulo
  const capituloStats = capitulosData.capitulos.map((cap) => {
    const preguntasCapitulo = preguntas.filter((p) => p.capitulo_id === cap.id);
    const respondidas = preguntasCapitulo.filter((p) => answers[p.id]?.answered).length;
    const correctas = preguntasCapitulo.filter(
      (p) => answers[p.id]?.answered && answers[p.id]?.isCorrect
    ).length;
    const tasa = respondidas > 0 ? Math.round((correctas / respondidas) * 100) : 0;

    return {
      ...cap,
      total: preguntasCapitulo.length,
      respondidas,
      correctas,
      tasa,
    };
  });

  // Ordenar capítulos por desempeño (peor primero)
  const capitulosOrdenados = [...capituloStats].sort((a, b) => a.tasa - b.tasa);

  const formatTime = (ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Resumen Principal */}
      <div className={`card ${nivelInfo.bg}`}>
        <div className="flex items-start gap-4">
          <Award className={`h-8 w-8 flex-shrink-0 ${nivelInfo.color}`} />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {nivelInfo.nivel}
            </h2>
            <p className={`mt-1 text-lg font-semibold ${nivelInfo.color}`}>
              Tasa de acierto: {tasaAcierto}%
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Completaste el examen en {formatTime(timeUsed)}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Correctas</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{correctas}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">de {respondidas}</p>
        </div>

        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Incorrectas</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{incorrectas}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">de {respondidas}</p>
        </div>

        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">No contestadas</p>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{noRespondidas}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">de {preguntas.length}</p>
        </div>

        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Tiempo usado</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round((timeUsed / (180 * 60 * 1000)) * 100)}%
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{formatTime(timeUsed)}</p>
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Desglose de Respuestas</h3>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Correctas</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {correctas} ({tasaAcierto}%)
              </span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(correctas / preguntas.length) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Incorrectas</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{incorrectas}</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(incorrectas / preguntas.length) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">No respondidas</span>
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {noRespondidas}
              </span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 transition-all"
                style={{ width: `${(noRespondidas / preguntas.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desempeño por Capítulo */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Desempeño por Capítulo (ordenados)
          </h3>
        </div>

        <div className="space-y-2 divide-y divide-gray-200 dark:divide-gray-700">
          {capitulosOrdenados.map((cap) => (
            <div key={cap.id} className="pt-2 first:pt-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Cap. {cap.numero} – {cap.titulo_es}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {cap.correctas}/{cap.respondidas} respondidas
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      cap.tasa >= 70
                        ? 'text-green-600 dark:text-green-400'
                        : cap.tasa >= 50
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {cap.tasa}%
                  </p>
                </div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    cap.tasa >= 70
                      ? 'bg-green-500'
                      : cap.tasa >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${cap.tasa}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className={`card border-2 ${
        tasaAcierto >= 85
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
      }`}>
        <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          {tasaAcierto >= 85 ? '✅' : '⚠️'} Próximos Pasos
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {tasaAcierto >= 85 && (
            <>
              <li>• ¡Felicidades! Parece estar listo para el examen real</li>
              <li>• Repite capítulos débiles si los hay (ver arriba)</li>
              <li>• Haz otro simulado en 2-3 días para comparar</li>
            </>
          )}
          {tasaAcierto >= 70 && tasaAcierto < 85 && (
            <>
              <li>• Buen desempeño. Necesita un poco más de estudio</li>
              <li>• Enfócate en los 3 capítulos con peor desempeño</li>
              <li>• Usa Lecciones para estos capítulos específicos</li>
              <li>• Repite este simulado en 2-3 días</li>
            </>
          )}
          {tasaAcierto < 70 && (
            <>
              <li>• Necesita más estudio antes del examen</li>
              <li>• Vuelve a Lecciones para los capítulos débiles</li>
              <li>• Practica con Flashcards y Quiz primero</li>
              <li>• Repite este simulado después de una semana</li>
            </>
          )}
          <li>• Todas tus respuestas se guardaron automáticamente</li>
        </ul>
      </div>

      {/* Botones */}
      <div className="card space-y-3">
        <button onClick={onBack} className="btn btn-primary w-full">
          ← Volver al Inicio
        </button>

        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          Puedes repetir este simulado cuantas veces quieras. Cada intento es completamente nuevo.
        </p>
      </div>
    </div>
  );
}
