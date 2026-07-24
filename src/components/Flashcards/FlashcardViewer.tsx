import { useState, useMemo } from 'react';
import { useLeitner } from '../../stores/useLeitner';
import { useUserProgress } from '../../stores/useUserProgress';
import preguntasData from '../../data/preguntas.json';
import capitulosData from '../../data/capitulos.json';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pregunta } from '../../types';

interface FlashcardViewerProps {
  capituloId: string | null;
  randomOrder: boolean;
  onBack: () => void;
}

export default function FlashcardViewer({
  capituloId,
  randomOrder,
  onBack,
}: FlashcardViewerProps) {
  const { responderPregunta } = useLeitner();
  const { progress, registrarRespuesta } = useUserProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const preguntas = useMemo(() => {
    let filtered = preguntasData.preguntas as Pregunta[];

    if (capituloId) {
      filtered = filtered.filter((p) => p.capitulo_id === capituloId);
    }

    if (randomOrder) {
      return filtered.sort(() => Math.random() - 0.5);
    }

    return filtered;
  }, [capituloId, randomOrder]);

  const capitulo = capituloId
    ? capitulosData.capitulos.find((c) => c.id === capituloId)
    : null;

  const currentPregunta = preguntas[currentIndex];
  const respuesta = progress.respuestas_guardadas[currentPregunta?.id];
  const wasAnswered = !!respuesta;

  const handleNext = () => {
    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleRespuesta = (correcta: boolean) => {
    if (currentPregunta) {
      responderPregunta(currentPregunta.id, correcta);
      registrarRespuesta(currentPregunta.id, correcta);
      setIsFlipped(true);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a flashcards
        </button>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Flashcard {currentIndex + 1} de {preguntas.length}
              </h1>
              {capitulo && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Cap. {capitulo.numero} – {capitulo.titulo_es}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="h-8 w-8 rounded-full bg-purple-500 text-center text-xs font-bold text-white">
                {Math.round(((currentIndex + 1) / preguntas.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${((currentIndex + 1) / preguntas.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer perspective"
      >
        <div
          className={`relative min-h-96 rounded-xl transition-transform duration-300 ${
            isFlipped ? 'scale-105' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Pregunta side */}
          <div
            className={`absolute inset-0 flex flex-col justify-between rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 p-6 dark:border-purple-700 dark:from-purple-900/20 dark:to-blue-900/20 ${
              isFlipped ? 'pointer-events-none opacity-0' : ''
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase text-purple-600 dark:text-purple-400">
                Pregunta
              </p>
              <p className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
                {currentPregunta.pregunta_es}
              </p>
            </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Click para ver respuesta
            </p>
          </div>

          {/* Respuesta side */}
          <div
            className={`absolute inset-0 flex flex-col justify-between rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:border-green-700 dark:from-green-900/20 dark:to-emerald-900/20 ${
              !isFlipped ? 'pointer-events-none opacity-0' : ''
            }`}
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase text-green-600 dark:text-green-400">
                Respuesta
              </p>
              <p className="mt-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
                {currentPregunta.respuesta_es}
              </p>
              {currentPregunta.explicacion_es && (
                <div className="mt-4 border-t border-green-200 pt-3 dark:border-green-800">
                  <p className="text-xs font-semibold uppercase text-green-600 dark:text-green-400">
                    Explicación
                  </p>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {currentPregunta.explicacion_es}
                  </p>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Click para ver pregunta
            </p>
          </div>
        </div>
      </div>

      {/* Response buttons - only show if flipped and not answered yet */}
      {isFlipped && !wasAnswered && (
        <div className="flex gap-3">
          <button
            onClick={() => handleRespuesta(false)}
            className="btn btn-error flex-1"
          >
            ❌ No lo sabía
          </button>
          <button
            onClick={() => handleRespuesta(true)}
            className="btn btn-success flex-1"
          >
            ✅ Correcto
          </button>
        </div>
      )}

      {/* Status if already answered */}
      {wasAnswered && (
        <div
          className={`card flex items-center gap-3 ${
            respuesta.correcta
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          }`}
        >
          <span className="text-2xl">{respuesta.correcta ? '✅' : '❌'}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {respuesta.correcta ? 'Respondiste correctamente' : 'Respondiste incorrectamente'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Puedes cambiar tu respuesta a continuación
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleRespuesta(false)}
              className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                !respuesta.correcta
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              ✗
            </button>
            <button
              onClick={() => handleRespuesta(true)}
              className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                respuesta.correcta
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              ✓
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            Anterior
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="btn btn-secondary flex-1"
          >
            {isFlipped ? '❌ Pregunta' : '✅ Respuesta'}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === preguntas.length - 1}
            className="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Keyboard shortcuts info */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          ← → para navegar • Click tarjeta para voltear
        </p>
      </div>

      {/* Stats */}
      <div className="card grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Actual</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentIndex + 1}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {preguntas.length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Respondidas</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {preguntas.filter((p) => progress.respuestas_guardadas[p.id]).length}
          </p>
        </div>
      </div>
    </div>
  );
}
