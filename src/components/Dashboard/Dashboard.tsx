import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, Zap, Target, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  useEffect(() => {
    const saved = localStorage.getItem('fitness-trainer:progress');
    if (saved) {
      JSON.parse(saved);
    }
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Bienvenido
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Prepárate para el examen B-Lizenz (clever fit Akademie)
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Capítulos dominados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0/10</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Racha de días</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">0 días</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Preguntas vistas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">% Aprobación</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Main CTA Buttons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <Link
          to="/lessons"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lecciones
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aprende capítulo por capítulo
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/flashcards"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
              <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Flashcards
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Memoriza términos alemanes
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cómo usar esta app
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            ✅ <strong>Lecciones:</strong> Lee el contenido de cada capítulo y responde el quiz
            (necesitas 80% para avanzar).
          </p>
          <p>
            📚 <strong>Flashcards:</strong> Practica términos alemanes con el sistema Leitner
            (5 cajas de repetición espaciada).
          </p>
          <p>
            🎯 <strong>Mis errores:</strong> Revisa las preguntas que has fallado más
            frecuentemente.
          </p>
          <p>
            🏆 <strong>Exámenes:</strong> Simula el examen final con tiempo limite y
            preguntas proporcionales a cada capítulo.
          </p>
        </div>
      </div>
    </div>
  );
}
