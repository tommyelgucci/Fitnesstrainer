import { BarChart3, Award, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Pregunta, Capitulo } from '../../types';

interface QuizAnswer {
  pregunta_id: string;
  answered: boolean;
  isCorrect: boolean;
}

interface QuizResultsProps {
  preguntas: Pregunta[];
  answers: Record<string, QuizAnswer>;
  capitulo?: Capitulo | null;
  onReview: () => void;
  onBack: () => void;
}

export default function QuizResults({
  preguntas,
  answers,
  capitulo,
  onReview,
  onBack,
}: QuizResultsProps) {
  const respondidas = preguntas.filter((p) => answers[p.id]?.answered).length;
  const correctas = preguntas.filter(
    (p) => answers[p.id]?.answered && answers[p.id]?.isCorrect
  ).length;
  const incorrectas = respondidas - correctas;
  const noRespondidas = preguntas.length - respondidas;

  const tasaAcierto = respondidas > 0 ? Math.round((correctas / respondidas) * 100) : 0;

  // Determinar nivel de desempeño
  const getNivel = () => {
    if (tasaAcierto >= 90) return { nivel: 'Excelente', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
    if (tasaAcierto >= 70) return { nivel: 'Bueno', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (tasaAcierto >= 50) return { nivel: 'Regular', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { nivel: 'Necesita mejorar', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
  };

  const nivelInfo = getNivel();

  const preguntasIncorrectas = preguntas.filter(
    (p) => answers[p.id]?.answered && !answers[p.id]?.isCorrect
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a inicio
        </button>
      </div>

      {/* Resumen de Resultados */}
      <div className={`card ${nivelInfo.bg}`}>
        <div className="flex items-start gap-4">
          <Award className={`h-8 w-8 flex-shrink-0 ${nivelInfo.color}`} />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quiz Completado
            </h2>
            <p className={`mt-1 text-lg font-semibold ${nivelInfo.color}`}>
              {nivelInfo.nivel}
            </p>
            {capitulo && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Cap. {capitulo.numero} – {capitulo.titulo_es}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Tasa Acierto</p>
          <p className={`text-3xl font-bold ${tasaAcierto >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {tasaAcierto}%
          </p>
        </div>

        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Correctas</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {correctas}
          </p>
        </div>

        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Incorrectas</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {incorrectas}
          </p>
        </div>

        <div className="card text-center">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {preguntas.length}
          </p>
        </div>
      </div>

      {/* Gráfico de barras simple */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Desglose</h3>
        </div>

        <div className="space-y-2">
          {/* Correctas */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Correctas</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {correctas}
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${(correctas / preguntas.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Incorrectas */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 dark:text-gray-300">Incorrectas</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {incorrectas}
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(incorrectas / preguntas.length) * 100}%` }}
              />
            </div>
          </div>

          {/* No respondidas */}
          {noRespondidas > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">No respondidas</span>
                <span className="font-semibold text-gray-600 dark:text-gray-400">
                  {noRespondidas}
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 transition-all"
                  style={{ width: `${(noRespondidas / preguntas.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preguntas Fallidas */}
      {preguntasIncorrectas.length > 0 && (
        <div className="card space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {preguntasIncorrectas.length} Preguntas Fallidas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aquí están las que marcaste como incorrectas. Estudia estas para mejorar.
              </p>
            </div>
          </div>

          <div className="space-y-2 divide-y divide-gray-200 dark:divide-gray-700">
            {preguntasIncorrectas.slice(0, 5).map((pregunta) => (
              <div key={pregunta.id} className="pt-3 first:pt-0">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400 flex-shrink-0">
                    #{pregunta.numero}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {pregunta.pregunta_es}
                    </p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Respuesta: {pregunta.respuesta_es}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {preguntasIncorrectas.length > 5 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 pt-3">
                ... y {preguntasIncorrectas.length - 5} más
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      <div className="card bg-blue-50 dark:bg-blue-900/20">
        <p className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
          💡 Recomendaciones
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {tasaAcierto >= 80 && (
            <li>• ¡Excelente desempeño! Considera pasar al siguiente nivel de dificultad.</li>
          )}
          {tasaAcierto >= 60 && tasaAcierto < 80 && (
            <li>• Buen progreso. Repasa las preguntas fallidas con el módulo Lecciones.</li>
          )}
          {tasaAcierto < 60 && (
            <li>
              • Necesitas más estudio. Usa Lecciones para aprender y luego repite este quiz.
            </li>
          )}
          <li>• Las respuestas se han guardado automáticamente en tu progreso Leitner.</li>
        </ul>
      </div>

      {/* Botones de Acción */}
      <div className="card space-y-3">
        <button onClick={onReview} className="btn btn-secondary w-full">
          🔄 Revisar Respuestas
        </button>

        <button onClick={onBack} className="btn btn-primary w-full">
          ← Volver a Quiz
        </button>
      </div>
    </div>
  );
}
