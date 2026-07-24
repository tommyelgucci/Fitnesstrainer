import { useState } from 'react';
import { Layers, Shuffle, BookOpen } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import preguntasData from '../../data/preguntas.json';
import FlashcardViewer from './FlashcardViewer';
import type { Pregunta } from '../../types';

export default function FlashcardBrowser() {
  const [mode, setMode] = useState<'selector' | 'viewer'>('selector');
  const [selectedCapitulo, setSelectedCapitulo] = useState<string | null>(null);
  const [randomOrder, setRandomOrder] = useState(false);

  const preguntas = preguntasData.preguntas as Pregunta[];

  const getCapituloPreguntas = (capituloId: string) => {
    return preguntas.filter((p) => p.capitulo_id === capituloId);
  };

  const handleStartMode = (capitulo: string | null, random: boolean) => {
    setSelectedCapitulo(capitulo);
    setRandomOrder(random);
    setMode('viewer');
  };

  const handleBack = () => {
    setMode('selector');
    setSelectedCapitulo(null);
  };

  if (mode === 'viewer' && selectedCapitulo) {
    return (
      <FlashcardViewer
        capituloId={selectedCapitulo}
        randomOrder={randomOrder}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="card bg-purple-50 dark:bg-purple-900/20">
        <div className="flex items-start gap-3">
          <Layers className="h-6 w-6 flex-shrink-0 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flashcards</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Repaso rápido de preguntas. Estudia término por término.
            </p>
          </div>
        </div>
      </div>

      {/* Modo: Todas las preguntas */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Todos los temas ({preguntas.length} preguntas)
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            onClick={() => handleStartMode(null, false)}
            className="card flex flex-col gap-3 border-2 border-purple-200 p-4 transition-all hover:border-purple-500 hover:shadow-lg dark:border-purple-800 dark:hover:border-purple-500"
          >
            <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">
                Orden Original
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Todas las {preguntas.length} preguntas en orden
              </p>
            </div>
          </button>

          <button
            onClick={() => handleStartMode(null, true)}
            className="card flex flex-col gap-3 border-2 border-purple-200 p-4 transition-all hover:border-purple-500 hover:shadow-lg dark:border-purple-800 dark:hover:border-purple-500"
          >
            <Shuffle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div className="text-left">
              <p className="font-semibold text-gray-900 dark:text-white">Aleatorio</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Todas las {preguntas.length} preguntas mezcladas
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Modo: Por capítulo */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Por Capítulo
        </h2>

        <div className="space-y-2">
          {capitulosData.capitulos.map((capitulo) => {
            const cantidad = getCapituloPreguntas(capitulo.id).length;

            return (
              <div key={capitulo.id} className="space-y-2">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Cap. {capitulo.numero}
                  {capitulo.subtitulo && `.${capitulo.subtitulo.split('.')[1]}`} –{' '}
                  {capitulo.titulo_es}
                  <span className="ml-2 text-xs text-gray-500">({cantidad})</span>
                </p>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <button
                    onClick={() => handleStartMode(capitulo.id, false)}
                    className="flex items-center gap-3 rounded-lg bg-gray-100 p-3 text-left transition-all hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/30"
                  >
                    <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Orden
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {cantidad} preguntas
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      →
                    </span>
                  </button>

                  <button
                    onClick={() => handleStartMode(capitulo.id, true)}
                    className="flex items-center gap-3 rounded-lg bg-gray-100 p-3 text-left transition-all hover:bg-purple-100 dark:bg-gray-700 dark:hover:bg-purple-900/30"
                  >
                    <Shuffle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Aleatorio
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {cantidad} preguntas
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      →
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-blue-50 dark:bg-blue-900/20">
        <p className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
          💡 Tips
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>• Click en la pregunta para ver la respuesta</li>
          <li>• Usa los botones ✅/❌ para evaluar tu conocimiento</li>
          <li>• Las respuestas se integran con tu progreso Leitner</li>
          <li>• Modo "Aleatorio" es ideal para simular examen</li>
        </ul>
      </div>
    </div>
  );
}
