import { Link } from 'react-router-dom';
import { useLeitner } from '../../stores/useLeitner';
import { useUserProgress } from '../../stores/useUserProgress';
import capitulosData from '../../data/capitulos.json';
import preguntasData from '../../data/preguntas.json';
import { BookOpen, TrendingUp } from 'lucide-react';

export default function LeccionesIndex() {
  const { tarjetas } = useLeitner();
  const { progress } = useUserProgress();

  const preguntas = preguntasData.preguntas as Array<{ id: string; capitulo_id: string }>;

  const getCapituloStats = (capituloId: string) => {
    const preguntasDelCapitulo = preguntas.filter((p) => p.capitulo_id === capituloId);
    const respuestasDelCapitulo = preguntasDelCapitulo.filter(
      (p) => progress.respuestas_guardadas[p.id]
    );
    const correctasDelCapitulo = respuestasDelCapitulo.filter(
      (p) => progress.respuestas_guardadas[p.id].correcta
    );
    const dominadasDelCapitulo = preguntasDelCapitulo.filter((p) => {
      const tarjeta = tarjetas.find((t) => t.pregunta_id === p.id);
      return tarjeta && tarjeta.numero_caja === 5;
    });

    return {
      total: preguntasDelCapitulo.length,
      respondidas: respuestasDelCapitulo.length,
      correctas: correctasDelCapitulo.length,
      dominadas: dominadasDelCapitulo.length,
      porcentajeRespuestas:
        preguntasDelCapitulo.length > 0
          ? Math.round((respuestasDelCapitulo.length / preguntasDelCapitulo.length) * 100)
          : 0,
      porcentajeAciertos:
        respuestasDelCapitulo.length > 0
          ? Math.round((correctasDelCapitulo.length / respuestasDelCapitulo.length) * 100)
          : 0,
      porcentajeDominadas:
        preguntasDelCapitulo.length > 0
          ? Math.round((dominadasDelCapitulo.length / preguntasDelCapitulo.length) * 100)
          : 0,
    };
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <BookOpen className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lecciones</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Estudio por capítulos con seguimiento de progreso
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {capitulosData.capitulos.map((capitulo) => {
          const stats = getCapituloStats(capitulo.id);
          const colorPeso =
            capitulo.peso >= 0.12
              ? 'text-red-600 dark:text-red-400'
              : capitulo.peso >= 0.08
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-green-600 dark:text-green-400';

          return (
            <Link
              key={capitulo.id}
              to={`/lecciones/${capitulo.id}`}
              className="card group flex items-center justify-between transition-all hover:shadow-lg hover:dark:shadow-lg/20"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cap. {capitulo.numero}
                    {capitulo.subtitulo && `.${capitulo.subtitulo.split('.')[1]}`}
                  </h2>
                  <span className={`text-xs font-bold ${colorPeso}`}>
                    {(capitulo.peso * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-400">
                  {capitulo.titulo_es}
                </p>

                {/* Progress bars */}
                <div className="mt-3 space-y-2">
                  {/* Respondidas */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Respondidas</span>
                      <span>
                        {stats.respondidas}/{stats.total}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${stats.porcentajeRespuestas}%` }}
                      />
                    </div>
                  </div>

                  {/* Aciertos */}
                  {stats.respondidas > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Tasa de acierto</span>
                        <span>{stats.porcentajeAciertos}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${stats.porcentajeAciertos}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Dominadas */}
                  {stats.dominadas > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Dominadas (Caja 5)</span>
                        <span>{stats.porcentajeDominadas}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 transition-all"
                          style={{ width: `${stats.porcentajeDominadas}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 flex flex-shrink-0 flex-col items-end gap-2">
                <TrendingUp className="h-5 w-5 text-gray-400 transition-all group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.respondidas}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">de {stats.total}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Summary */}
      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white">Resumen General</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {preguntas.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total preguntas</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {Object.keys(progress.respuestas_guardadas).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Respondidas</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {tarjetas.filter((t) => t.numero_caja === 5).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Dominadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
