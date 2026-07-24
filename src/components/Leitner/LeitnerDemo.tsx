import { useState } from 'react';
import { useLeitner } from '../../stores/useLeitner';
import { formatearTiempoProxRepaso } from '../../utils/leitner';
import LeitnerVisualizer from './LeitnerVisualizer';

/**
 * Componente de demostración interactivo del sistema Leitner
 * Permite testear manualmente la lógica
 */
export default function LeitnerDemo() {
  const { tarjetas, stats, progreso_dominadas, inicializarTarjetas, responderPregunta } =
    useLeitner();

  const [preguntaIdTest, setPreguntaIdTest] = useState('demo-1');

  // Crear tarjetas de demostración
  const crearDemoPregunta = () => {
    const newId = `demo-${Date.now()}`;
    inicializarTarjetas([newId]);
    setPreguntaIdTest(newId);
  };

  // Responder como correcto
  const responderCorrecto = () => {
    if (tarjetas.length === 0) {
      crearDemoPregunta();
      return;
    }
    responderPregunta(preguntaIdTest, true);
  };

  // Responder como incorrecto
  const responderIncorrecto = () => {
    if (tarjetas.length === 0) {
      crearDemoPregunta();
      return;
    }
    responderPregunta(preguntaIdTest, false);
  };

  // Obtener tarjeta actual para mostrar detalles
  const tarjetaActual = tarjetas.find((t) => t.pregunta_id === preguntaIdTest);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card bg-blue-50 dark:bg-blue-900/20">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          🧪 Demostración del Sistema Leitner
        </h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          Haz clic para simular respuestas y ver cómo se mueven las tarjetas entre cajas
        </p>
      </div>

      {/* Visualizador */}
      <LeitnerVisualizer stats={stats} progreso_dominadas={progreso_dominadas} />

      {/* Controles de demostración */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Controles de Prueba
        </h3>

        {tarjetaActual && (
          <div className="space-y-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">ID Pregunta</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {tarjetaActual.pregunta_id}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Caja Actual</p>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  {tarjetaActual.numero_caja}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Aciertos</p>
                <p className="font-bold text-green-600 dark:text-green-400">
                  {tarjetaActual.veces_correctas}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Fallos</p>
                <p className="font-bold text-red-600 dark:text-red-400">
                  {tarjetaActual.veces_incorrectas}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600 dark:text-gray-400">Próximo Repaso</p>
                <p className="font-mono text-gray-900 dark:text-white">
                  {formatearTiempoProxRepaso(tarjetaActual.fecha_proximo_repaso)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Simula una respuesta:
          </p>
          <div className="flex gap-2">
            <button
              onClick={responderCorrecto}
              className="btn btn-success flex-1"
            >
              ✅ Respuesta Correcta
            </button>
            <button
              onClick={responderIncorrecto}
              className="btn btn-error flex-1"
            >
              ❌ Respuesta Incorrecta
            </button>
          </div>
        </div>

        <button
          onClick={crearDemoPregunta}
          className="btn btn-secondary w-full"
        >
          ➕ Crear Nueva Pregunta de Demo
        </button>
      </div>

      {/* Información detallada */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Información Detallada
        </h3>

        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/30">
            <p className="text-gray-600 dark:text-gray-400">Total Tarjetas</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stats.total_cards}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/30">
            <p className="text-gray-600 dark:text-gray-400">Para Hoy</p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {stats.proximas_hoy.length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/30">
            <p className="text-gray-600 dark:text-gray-400">Esta Semana</p>
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {stats.proximas_esta_semana.length}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-700/30">
            <p className="text-gray-600 dark:text-gray-400">Dominadas</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {progreso_dominadas}%
            </p>
          </div>
        </div>

        {/* Tabla de tarjetas */}
        {tarjetas.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
              Últimas 5 Tarjetas
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-2 py-1 text-left">ID</th>
                    <th className="px-2 py-1 text-left">Caja</th>
                    <th className="px-2 py-1 text-center">✓/✗</th>
                    <th className="px-2 py-1 text-left">Próximo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tarjetas.slice(-5).map((t) => (
                    <tr key={t.pregunta_id}>
                      <td className="px-2 py-1 font-mono text-gray-600 dark:text-gray-400">
                        {t.pregunta_id.slice(-3)}
                      </td>
                      <td className="px-2 py-1">
                        <span
                          className={`inline-block h-5 w-5 rounded text-center text-xs font-bold text-white ${
                            t.numero_caja === 1
                              ? 'bg-red-500'
                              : t.numero_caja === 2
                                ? 'bg-orange-500'
                                : t.numero_caja === 3
                                  ? 'bg-yellow-500'
                                  : t.numero_caja === 4
                                    ? 'bg-blue-500'
                                    : 'bg-green-500'
                          }`}
                        >
                          {t.numero_caja}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-center">
                        {t.veces_correctas}/{t.veces_incorrectas}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                        {formatearTiempoProxRepaso(t.fecha_proximo_repaso)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
