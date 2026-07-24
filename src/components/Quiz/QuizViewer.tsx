import { useState, useMemo } from 'react';
import { useLeitner } from '../../stores/useLeitner';
import { useUserProgress } from '../../stores/useUserProgress';
import preguntasData from '../../data/preguntas.json';
import capitulosData from '../../data/capitulos.json';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import QuizResults from './QuizResults';
import type { Pregunta } from '../../types';

interface QuizViewerProps {
  capituloId: string | null;
  questionCount: number;
  onBack: () => void;
}

interface QuizAnswer {
  pregunta_id: string;
  answered: boolean;
  isCorrect: boolean;
}

export default function QuizViewer({ capituloId, questionCount, onBack }: QuizViewerProps) {
  const { responderPregunta } = useLeitner();
  const { registrarRespuesta } = useUserProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [showResults, setShowResults] = useState(false);

  // Obtener y filtrar preguntas
  const preguntas = useMemo(() => {
    let filtered = preguntasData.preguntas as Pregunta[];

    if (capituloId) {
      filtered = filtered.filter((p) => p.capitulo_id === capituloId);
    }

    // Tomar solo la cantidad seleccionada (aleatorias)
    return filtered.sort(() => Math.random() - 0.5).slice(0, questionCount);
  }, [capituloId, questionCount]);

  const capitulo = capituloId
    ? capitulosData.capitulos.find((c) => c.id === capituloId)
    : null;

  const currentPregunta = preguntas[currentIndex];
  const currentAnswer = answers[currentPregunta?.id];

  const handleAnswer = (correcta: boolean) => {
    if (!currentPregunta) return;

    setAnswers((prev) => ({
      ...prev,
      [currentPregunta.id]: {
        pregunta_id: currentPregunta.id,
        answered: true,
        isCorrect: correcta,
      },
    }));
  };

  const handleNext = () => {
    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    // Guardar todas las respuestas
    Object.entries(answers).forEach(([preguntaId, answer]) => {
      if (answer.answered) {
        responderPregunta(preguntaId, answer.isCorrect);
        registrarRespuesta(preguntaId, answer.isCorrect);
      }
    });

    setShowResults(true);
  };

  const handleReview = () => {
    setShowResults(false);
    setCurrentIndex(0);
  };

  const handleBackToSelector = () => {
    onBack();
  };

  // Mostrar resultados si está terminado
  if (showResults) {
    return (
      <QuizResults
        preguntas={preguntas}
        answers={answers}
        capitulo={capitulo}
        onReview={handleReview}
        onBack={handleBackToSelector}
      />
    );
  }

  const respondidas = Object.values(answers).filter((a) => a.answered).length;
  const progreso = (respondidas / preguntas.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a quiz
        </button>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Pregunta {currentIndex + 1} de {preguntas.length}
              </h1>
              {capitulo && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Cap. {capitulo.numero} – {capitulo.titulo_es}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="h-8 w-8 rounded-full bg-amber-500 text-center text-xs font-bold text-white">
                {Math.round(((currentIndex + 1) / preguntas.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${((currentIndex + 1) / preguntas.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pregunta (sin respuesta visible) */}
      <div className="card border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
        <p className="text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">
          Pregunta #{currentPregunta.numero}
        </p>
        <p className="mt-4 text-center text-xl font-semibold text-gray-900 dark:text-white">
          {currentPregunta.pregunta_es}
        </p>
        <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Crees que sabes la respuesta?
        </p>
      </div>

      {/* Botones de respuesta */}
      <div className="space-y-3">
        {!currentAnswer?.answered ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAnswer(false)}
              className="btn btn-error"
            >
              ❌ No lo sé
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="btn btn-success"
            >
              ✅ Creo que sí
            </button>
          </div>
        ) : (
          <div
            className={`card flex items-center gap-3 ${
              currentAnswer.isCorrect
                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
            }`}
          >
            <span className="text-2xl">{currentAnswer.isCorrect ? '✅' : '❌'}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {currentAnswer.isCorrect
                  ? 'Marcaste como correcta'
                  : 'Marcaste como incorrecta'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Puedes cambiar tu respuesta
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAnswer(false)}
                className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                  !currentAnswer.isCorrect
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                ✗
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                  currentAnswer.isCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                ✓
              </button>
            </div>
          </div>
        )}
      </div>

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
            onClick={handleNext}
            disabled={currentIndex === preguntas.length - 1}
            className="btn btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {currentIndex === preguntas.length - 1 && (
          <button
            onClick={handleFinish}
            className="btn btn-success w-full"
          >
            ✅ Finalizar Quiz ({respondidas}/{preguntas.length} respondidas)
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="card grid grid-cols-3 gap-3 text-center bg-gray-50 dark:bg-gray-800/50">
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Respondidas</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {respondidas}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {preguntas.length}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Progreso</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(progreso)}%
          </p>
        </div>
      </div>
    </div>
  );
}
