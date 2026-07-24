import { useState, useMemo, useEffect } from 'react';
import { useLeitner } from '../../stores/useLeitner';
import { useUserProgress } from '../../stores/useUserProgress';
import preguntasData from '../../data/preguntas.json';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import ExamResults from './ExamResults';
import type { Pregunta } from '../../types';

interface ExamViewerProps {
  startTime: number;
  onBack: () => void;
}

interface ExamAnswer {
  pregunta_id: string;
  answered: boolean;
  isCorrect: boolean;
}

const TOTAL_TIME_MS = 180 * 60 * 1000; // 180 minutos

export default function ExamViewer({ startTime, onBack }: ExamViewerProps) {
  const { responderPregunta } = useLeitner();
  const { registrarRespuesta } = useUserProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME_MS);
  const [forceFinish, setForceFinish] = useState(false);

  // Obtener todas las preguntas en orden aleatorio
  const preguntas = useMemo(() => {
    return (preguntasData.preguntas as Pregunta[]).sort(() => Math.random() - 0.5);
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TOTAL_TIME_MS - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setForceFinish(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

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

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index);
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

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const respondidas = Object.values(answers).filter((a) => a.answered).length;
  const isTimeWarning = timeRemaining < 10 * 60 * 1000; // 10 min
  const isTimeCritical = timeRemaining < 5 * 60 * 1000; // 5 min

  if (showResults || forceFinish) {
    return (
      <ExamResults
        preguntas={preguntas}
        answers={answers}
        timeUsed={TOTAL_TIME_MS - timeRemaining}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Timer */}
      <div className="sticky top-0 z-50 space-y-3">
        <div
          className={`card ${
            isTimeCritical
              ? 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20'
              : isTimeWarning
                ? 'border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Examen Simulado: Pregunta {currentIndex + 1}/195
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Respondidas: {respondidas}/195
              </p>
            </div>

            <div
              className={`text-center px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                isTimeCritical
                  ? 'bg-red-500 text-white'
                  : isTimeWarning
                    ? 'bg-yellow-500 text-white'
                    : 'bg-blue-500 text-white'
              }`}
            >
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isTimeCritical
                  ? 'bg-red-500'
                  : isTimeWarning
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              }`}
              style={{ width: `${((currentIndex + 1) / preguntas.length) * 100}%` }}
            />
          </div>

          {isTimeCritical && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                ⚠️ ¡Tiempo límite próximo! Termina pronto.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pregunta */}
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="card border-2 border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <p className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">
            Pregunta #{currentPregunta.numero}
          </p>
          <p className="mt-4 text-center text-xl font-semibold text-gray-900 dark:text-white">
            {currentPregunta.pregunta_es}
          </p>
        </div>

        {/* Respuesta */}
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
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Respuesta marcada
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
              className="btn btn-danger w-full"
            >
              ✅ Terminar Examen ({respondidas}/195 respondidas)
            </button>
          )}

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            ← → para navegar • Responde todas antes de terminar
          </p>
        </div>

        {/* Quick Jump (últimas 10) */}
        <div className="card">
          <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400 mb-2">
            Ir a pregunta
          </p>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: Math.min(10, preguntas.length) }).map((_, i) => {
              const idx = preguntas.length - 10 + i;
              const isAnswered = answers[preguntas[idx]?.id]?.answered;
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={idx}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`h-8 rounded text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-red-500 text-white ring-2 ring-red-300'
                      : isAnswered
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
