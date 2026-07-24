import { useParams, useNavigate } from 'react-router-dom';
import { useLeitner } from '../../stores/useLeitner';
import { useUserProgress } from '../../stores/useUserProgress';
import capitulosData from '../../data/capitulos.json';
import preguntasData from '../../data/preguntas.json';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Pregunta } from '../../types';

export default function CapituloDetail() {
  const { capitulo_id } = useParams<{ capitulo_id: string }>();
  const navigate = useNavigate();
  const { tarjetas, responderPregunta } = useLeitner();
  const { progress, registrarRespuesta } = useUserProgress();

  if (!capitulo_id) {
    return <div className="text-center text-gray-500">Capítulo no encontrado</div>;
  }

  const capitulo = capitulosData.capitulos.find((c) => c.id === capitulo_id);
  if (!capitulo) {
    return (
      <div className="mx-auto max-w-4xl">
        <button onClick={() => navigate('/lecciones')} className="btn btn-secondary mb-4">
          ← Volver
        </button>
        <div className="card text-center">
          <p className="text-gray-600 dark:text-gray-400">Capítulo no encontrado</p>
        </div>
      </div>
    );
  }

  const preguntas = (preguntasData.preguntas as Pregunta[]).filter(
    (p) => p.capitulo_id === capitulo_id
  );

  const handleRespuesta = (preguntaId: string, correcta: boolean) => {
    responderPregunta(preguntaId, correcta);
    registrarRespuesta(preguntaId, correcta);
  };

  const getTarjetaInfo = (preguntaId: string) => {
    const tarjeta = tarjetas.find((t) => t.pregunta_id === preguntaId);
    const respuesta = progress.respuestas_guardadas[preguntaId];
    return { tarjeta, respuesta };
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/lecciones')}
          className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a lecciones
        </button>

        <div className="card bg-blue-50 dark:bg-blue-900/20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cap. {capitulo.numero}
            {capitulo.subtitulo && `.${capitulo.subtitulo.split('.')[1]}`}
          </h1>
          <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">{capitulo.titulo_es}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{capitulo.titulo_de}</p>
        </div>
      </div>

      {/* Subcapítulos y preguntas */}
      {capitulo.subcapitulos && capitulo.subcapitulos.length > 0 ? (
        <div className="space-y-6">
          {capitulo.subcapitulos.map((subcap) => {
            const preguntasSubcap = preguntas.filter(
              (p) => p.id.startsWith(subcap.id.split('_')[0])
            );

            return (
              <div key={subcap.id} className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subcap.titulo_es}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{subcap.titulo_de}</p>
                </div>

                {/* Preguntas del subcapítulo */}
                <div className="space-y-2">
                  {preguntasSubcap.length > 0 ? (
                    preguntasSubcap.map((pregunta) => {
                      const { tarjeta, respuesta } = getTarjetaInfo(pregunta.id);
                      const estaRespondida = !!respuesta;
                      const esCorrecta = respuesta?.correcta;

                      return (
                        <div
                          key={pregunta.id}
                          className="card border border-gray-200 dark:border-gray-700"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                  {pregunta.numero}
                                </span>
                                {estaRespondida && (
                                  <div className="flex items-center gap-1">
                                    {esCorrecta ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                )}
                                {tarjeta && tarjeta.numero_caja < 5 && (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    Caja {tarjeta.numero_caja}
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-gray-900 dark:text-white">
                                {pregunta.pregunta_es}
                              </p>
                            </div>
                          </div>

                          {/* Respuesta */}
                          <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Respuesta
                            </p>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                              {pregunta.respuesta_es}
                            </p>
                            {pregunta.explicacion_es && (
                              <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600">
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  Explicación
                                </p>
                                <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                                  {pregunta.explicacion_es}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Botones de respuesta */}
                          {!estaRespondida ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespuesta(pregunta.id, true)}
                                className="btn btn-success flex-1 text-sm"
                              >
                                ✅ Correcto
                              </button>
                              <button
                                onClick={() => handleRespuesta(pregunta.id, false)}
                                className="btn btn-error flex-1 text-sm"
                              >
                                ❌ Incorrecto
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRespuesta(pregunta.id, true)}
                                className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition-all ${
                                  esCorrecta
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                ✅ Correcto
                              </button>
                              <button
                                onClick={() => handleRespuesta(pregunta.id, false)}
                                className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition-all ${
                                  !esCorrecta
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                ❌ Incorrecto
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No hay preguntas en esta sección
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Mostrar todas las preguntas del capítulo sin agrupar
        <div className="space-y-2">
          {preguntas.map((pregunta) => {
            const { tarjeta, respuesta } = getTarjetaInfo(pregunta.id);
            const estaRespondida = !!respuesta;
            const esCorrecta = respuesta?.correcta;

            return (
              <div key={pregunta.id} className="card border border-gray-200 dark:border-gray-700">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {pregunta.numero}
                      </span>
                      {estaRespondida && (
                        <div className="flex items-center gap-1">
                          {esCorrecta ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                      {tarjeta && tarjeta.numero_caja < 5 && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          Caja {tarjeta.numero_caja}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-900 dark:text-white">
                      {pregunta.pregunta_es}
                    </p>
                  </div>
                </div>

                <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Respuesta
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {pregunta.respuesta_es}
                  </p>
                  {pregunta.explicacion_es && (
                    <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Explicación
                      </p>
                      <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                        {pregunta.explicacion_es}
                      </p>
                    </div>
                  )}
                </div>

                {!estaRespondida ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespuesta(pregunta.id, true)}
                      className="btn btn-success flex-1 text-sm"
                    >
                      ✅ Correcto
                    </button>
                    <button
                      onClick={() => handleRespuesta(pregunta.id, false)}
                      className="btn btn-error flex-1 text-sm"
                    >
                      ❌ Incorrecto
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespuesta(pregunta.id, true)}
                      className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition-all ${
                        esCorrecta
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      ✅ Correcto
                    </button>
                    <button
                      onClick={() => handleRespuesta(pregunta.id, false)}
                      className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition-all ${
                        !esCorrecta
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      ❌ Incorrecto
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
