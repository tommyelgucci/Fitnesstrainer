import type { LeitnerStats } from '../../utils/leitner';

interface LeitnerVisualizerProps {
  stats: LeitnerStats;
  progreso_dominadas: number;
}

export default function LeitnerVisualizer({
  stats,
  progreso_dominadas,
}: LeitnerVisualizerProps) {
  const cajas = [
    { num: 1, color: 'bg-red-500', label: 'Caja 1\n(1 día)', count: stats.por_caja[0] },
    { num: 2, color: 'bg-orange-500', label: 'Caja 2\n(3 días)', count: stats.por_caja[1] },
    { num: 3, color: 'bg-yellow-500', label: 'Caja 3\n(7 días)', count: stats.por_caja[2] },
    { num: 4, color: 'bg-blue-500', label: 'Caja 4\n(14 días)', count: stats.por_caja[3] },
    { num: 5, color: 'bg-green-500', label: 'Caja 5\n(dominado)', count: stats.por_caja[4] },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Progreso general */}
      <div className="card">
        <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
          Progreso de aprendizaje
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Dominadas (Caja 5)
            </span>
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {progreso_dominadas}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progreso_dominadas}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {stats.por_caja[4]} de {stats.total_cards} preguntas dominadas
          </p>
        </div>
      </div>

      {/* Cajas Leitner */}
      <div className="card">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
          Sistema Leitner - Distribución
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {cajas.map((caja) => (
            <div
              key={caja.num}
              className={`${caja.color} rounded-lg p-3 text-center text-white shadow-md transition-transform hover:scale-105`}
            >
              <div className="text-2xl font-bold">{caja.count}</div>
              <div className="text-xs whitespace-pre-line opacity-90">
                {caja.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximas a repasar */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Próximas a repasar
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <span className="text-sm font-bold text-red-600 dark:text-red-300">
                {stats.proximas_hoy.length}
              </span>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Hoy (vencidas)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                {stats.proximas_esta_semana.length}
              </span>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Esta semana
            </span>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="card bg-blue-50 dark:bg-blue-900/20">
        <p className="text-xs text-gray-600 dark:text-gray-300">
          <strong>💡 Cómo funciona:</strong> Cada pregunta correcta la mueve a la
          siguiente caja (repaso más espaciado). Fallos la regresan a Caja 1
          (repaso inmediato). Domina todas para llegar a Caja 5.
        </p>
      </div>
    </div>
  );
}
