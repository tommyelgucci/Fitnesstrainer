import { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import preguntasData from '../../data/preguntas.json';
import QuizViewer from './QuizViewer';
import type { Pregunta } from '../../types';

export default function QuizBrowser() {
  const [mode, setMode] = useState<'selector' | 'viewer'>('selector');
  const [selectedCapitulo, setSelectedCapitulo] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const preguntas = preguntasData.preguntas as Pregunta[];

  const getCapituloPreguntas = (capituloId: string) => {
    return preguntas.filter((p) => p.capitulo_id === capituloId);
  };

  const handleStartQuiz = (capitulo: string | null, count: number) => {
    setSelectedCapitulo(capitulo);
    setSelectedCount(Math.min(count, getMaxQuestions(capitulo)));
    setMode('viewer');
  };

  const getMaxQuestions = (capitulo: string | null) => {
    if (!capitulo) return preguntas.length;
    return getCapituloPreguntas(capitulo).length;
  };

  const handleBack = () => {
    setMode('selector');
    setSelectedCapitulo(null);
  };

  if (mode === 'viewer' && selectedCapitulo !== undefined) {
    return (
      <QuizViewer
        capituloId={selectedCapitulo}
        questionCount={selectedCount}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="card bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <Zap className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Rápido</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Pruebas cortas para evaluar tu conocimiento. Responde rápido, obtén resultados inmediatos.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de cantidad */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          1. Elige cuántas preguntas
        </h2>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {[10, 20, 50, 100, 195].map((count) => (
            <button
              key={count}
              onClick={() => setSelectedCount(count)}
              className={`rounded-lg p-3 font-semibold transition-all ${
                selectedCount === count
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-900 hover:bg-amber-100 dark:bg-gray-700 dark:text-white dark:hover:bg-amber-900/30'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de capítulo */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          2. Elige el tema (opcional)
        </h2>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {/* Opción: Todos */}
          <button
            onClick={() => handleStartQuiz(null, selectedCount)}
            className={`flex items-center justify-between rounded-lg p-4 transition-all ${
              selectedCapitulo === null
                ? 'border-2 border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                : 'border-2 border-gray-200 hover:border-amber-300 dark:border-gray-700 dark:hover:border-amber-700'
            }`}
          >
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">
                Todos los temas
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {preguntas.length} preguntas disponibles
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </button>

          {/* Capítulos */}
          {capitulosData.capitulos.map((capitulo) => {
            const cantidad = getCapituloPreguntas(capitulo.id).length;
            const isSelected = selectedCapitulo === capitulo.id;

            return (
              <button
                key={capitulo.id}
                onClick={() => handleStartQuiz(capitulo.id, selectedCount)}
                className={`flex items-center justify-between rounded-lg p-4 transition-all ${
                  isSelected
                    ? 'border-2 border-amber-500 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                    : 'border-2 border-gray-200 hover:border-amber-300 dark:border-gray-700 dark:hover:border-amber-700'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Cap. {capitulo.numero}
                    {capitulo.subtitulo && `.${capitulo.subtitulo.split('.')[1]}`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {capitulo.titulo_es}
                    <span className="ml-2 text-xs">({cantidad})</span>
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-blue-50 dark:bg-blue-900/20">
        <p className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
          ⚡ Modo Quiz
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>• Se muestran solo las preguntas (sin respuesta visible)</li>
          <li>• Responde ✅/❌ según lo que creas</li>
          <li>• Al final: resumen de aciertos y errores</li>
          <li>• Ideal para medir tu conocimiento real</li>
        </ul>
      </div>

      {/* Resumen */}
      <div className="card grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/50 text-center md:grid-cols-3">
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Preguntas</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{selectedCount}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Tema</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {selectedCapitulo
              ? capitulosData.capitulos.find((c) => c.id === selectedCapitulo)?.numero
              : 'Todos'}
          </p>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Tiempo</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            ~{Math.ceil((selectedCount * 1) / 2)} min
          </p>
        </div>
      </div>
    </div>
  );
}
