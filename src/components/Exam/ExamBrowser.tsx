import { useState } from 'react';
import { Clock, Play } from 'lucide-react';
import ExamViewer from './ExamViewer';

export default function ExamBrowser() {
  const [mode, setMode] = useState<'selector' | 'exam'>('selector');
  const [startTime, setStartTime] = useState<number | null>(null);

  const handleStartExam = () => {
    setStartTime(Date.now());
    setMode('exam');
  };

  const handleBack = () => {
    setMode('selector');
    setStartTime(null);
  };

  if (mode === 'exam' && startTime) {
    return <ExamViewer startTime={startTime} onBack={handleBack} />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="card bg-red-50 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <Clock className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Examen Simulado
            </h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Simulación completa del examen B-Lizenz. 195 preguntas, 180 minutos.
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <div>
              <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Preguntas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">195</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏱️</span>
            <div>
              <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Tiempo</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">180 min</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">~55 seg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white">¿Cómo funciona?</h2>
        <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-semibold text-red-600 dark:text-red-400">1.</span> Se muestran
            195 preguntas en orden aleatorio
          </li>
          <li>
            <span className="font-semibold text-red-600 dark:text-red-400">2.</span> Tienes 180
            minutos para responder todas
          </li>
          <li>
            <span className="font-semibold text-red-600 dark:text-red-400">3.</span> Responde
            ✅/❌ sin ver la respuesta correcta
          </li>
          <li>
            <span className="font-semibold text-red-600 dark:text-red-400">4.</span> Al
            terminar, ves resultados detallados
          </li>
          <li>
            <span className="font-semibold text-red-600 dark:text-red-400">5.</span> Se guarda
            automáticamente en tu historial
          </li>
        </ol>
      </div>

      {/* Consejos */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 space-y-2">
        <p className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
          💡 Consejos
        </p>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• No uses respuestas anteriores - este es un examen limpio</li>
          <li>• No saltes preguntas - intenta responder todas</li>
          <li>• Si no sabes, marca ❌ para reforzar con Leitner</li>
          <li>• El cronómetro es orientativo (examen real es sin timer)</li>
          <li>• Busca completar en menos de 2 horas para tiempo de sobra</li>
        </ul>
      </div>

      {/* Button */}
      <div className="card space-y-3">
        <button onClick={handleStartExam} className="btn btn-danger w-full text-lg">
          <Play className="h-5 w-5" />
          Iniciar Examen Simulado
        </button>

        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          ⚠️ Requiere concentración. Aviso: no hay pausa - usa el botón atrás si necesitas
          interrumpir.
        </p>
      </div>

      {/* Requisitos */}
      <div className="card border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <p className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
          ⚠️ Requisitos Previos
        </p>
        <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>✓ Estudia con Lecciones primero</li>
          <li>✓ Haz algunos Flashcards para calentar</li>
          <li>✓ Prueba un Quiz corto para evaluar</li>
          <li>✓ Luego intenta este examen simulado</li>
        </ul>
      </div>
    </div>
  );
}
