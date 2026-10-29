import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Volume2, Eye, EyeOff, Dumbbell, Lightbulb, AlertTriangle, Target, Brain } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import { imagenes, imagenPorId, tieneHotspots } from '../../data/imagenesInfo';
import ImagenInteractiva from './ImagenInteractiva';
import ImagenQuiz from './ImagenQuiz';
import { itemsDe } from './quizUtils';
import type { Modo } from './quizUtils';
import { Diagrama } from './Diagramas';
import { hablarAleman } from './hablar';
import { registrarFigura } from '../../stores/gamificacion';

const ROL: Record<string, string> = {
  principal: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  ayuda: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  estabilizador: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
};
const ROL_ES: Record<string, string> = { principal: 'Principal', ayuda: 'Ayuda', estabilizador: 'Estabiliza' };

export default function ImagenDetalle() {
  const { id } = useParams();
  const img = id ? imagenPorId(id) : undefined;
  const [activo, setActivo] = useState<number | null>(null);
  const [puntos, setPuntos] = useState(true);
  const [original, setOriginal] = useState(false);
  const [practica, setPractica] = useState<Modo | null>(null);

  useEffect(() => {
    if (id) registrarFigura(id);
  }, [id]);

  if (!img) {
    return (
      <div className="mx-auto max-w-2xl card text-center">
        <p className="text-gray-700 dark:text-gray-300">No encontré esa figura.</p>
        <Link to="/imagenes" className="btn btn-primary mt-3">Volver a Imágenes</Link>
      </div>
    );
  }

  const idx = imagenes.findIndex((i) => i.id === img.id);
  const anterior = imagenes[idx - 1];
  const siguiente = imagenes[idx + 1];
  const capitulo = capitulosData.capitulos.find((c) => c.id === img.capitulo_id);
  const interactiva = tieneHotspots(img);
  const propio = !!img.diagrama;
  const numeros = new Map<number, number>();
  img.terminos.forEach((t, i) => {
    if (t.x !== undefined) numeros.set(i, numeros.size + 1);
  });


  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between text-sm">
        <Link to="/imagenes" className="inline-flex items-center gap-1 text-teal-600 hover:underline dark:text-teal-400">
          <ArrowLeft className="h-4 w-4" /> Imágenes
        </Link>
        <div className="flex gap-3">
          {anterior && <Link to={`/imagenes/${anterior.id}`} onClick={() => setActivo(null)} className="text-teal-600 dark:text-teal-400" aria-label="Figura anterior"><ArrowLeft className="h-5 w-5" /></Link>}
          {siguiente && <Link to={`/imagenes/${siguiente.id}`} onClick={() => setActivo(null)} className="text-teal-600 dark:text-teal-400" aria-label="Figura siguiente"><ArrowRight className="h-5 w-5" /></Link>}
        </div>
      </div>

      <div>
        {capitulo && (
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Cap. {capitulo.numero}{capitulo.subtitulo ? `.${capitulo.subtitulo.split('.')[1]}` : ''} · {capitulo.titulo_es}
          </p>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{img.titulo_de}</h1>
        <p className="italic text-gray-600 dark:text-gray-400">{img.titulo_es}</p>
      </div>

      {practica ? (
        <ImagenQuiz key={practica} items={itemsDe([img], practica)} modo={practica} onSalir={() => setPractica(null)} />
      ) : (
        <>
          <div className="card space-y-3">
            {propio && !original ? (
              <Diagrama id={img.diagrama!} />
            ) : (
              <ImagenInteractiva img={img} activo={activo} onSelect={setActivo} mostrarPuntos={puntos} />
            )}
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {interactiva && !(propio && !original) && (
                <button className="btn btn-secondary" onClick={() => setPuntos((p) => !p)}>
                  {puntos ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
                  {puntos ? 'Ocultar puntos' : 'Mostrar puntos'}
                </button>
              )}
              {propio && (
                <button className="btn btn-secondary" onClick={() => setOriginal((o) => !o)}>
                  {original ? 'Ver versión en alemán + español' : 'Ver figura original del manual'}
                </button>
              )}
              {interactiva && !original && !propio && (
                <span className="text-gray-500 dark:text-gray-400">Toca un punto para ver su nombre.</span>
              )}
            </div>
            {activo !== null && img.terminos[activo] && (
              <div className="rounded-lg bg-teal-50 p-3 dark:bg-teal-900/30">
                <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  {img.terminos[activo].de}
                  <button onClick={() => hablarAleman(img.terminos[activo].de)} aria-label="Escuchar en alemán" className="text-teal-600 dark:text-teal-400"><Volume2 className="h-4 w-4" /></button>
                </p>
                <p className="italic text-gray-700 dark:text-gray-300">{img.terminos[activo].es}</p>
                {img.terminos[activo].nota && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{img.terminos[activo].nota}</p>}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><Lightbulb className="h-5 w-5 text-amber-500" /> ¿Qué estás viendo?</h2>
            <p className="text-gray-800 dark:text-gray-200">{img.resumen_es}</p>
            {img.claves_es && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-800 dark:text-gray-200">
                {img.claves_es.map((c) => <li key={c}>{c}</li>)}
              </ul>
            )}
          </div>

          {img.ejecucion_es && (
            <div className="card">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><Dumbbell className="h-5 w-5 text-teal-600" /> Cómo se hace</h2>
              <ol className="list-decimal space-y-1 pl-5 text-gray-800 dark:text-gray-200">
                {img.ejecucion_es.map((e) => <li key={e}>{e}</li>)}
              </ol>
            </div>
          )}

          {img.musculos && (
            <div className="card">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><Target className="h-5 w-5 text-red-500" /> Músculos que trabajan</h2>
              <ul className="space-y-2">
                {img.musculos.map((m) => (
                  <li key={m.de} className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROL[m.rol] ?? ROL.ayuda}`}>{ROL_ES[m.rol] ?? m.rol}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{m.de}</span>
                    <button onClick={() => hablarAleman(m.de)} aria-label="Escuchar" className="text-teal-600 dark:text-teal-400"><Volume2 className="h-4 w-4" /></button>
                    <span className="italic text-gray-600 dark:text-gray-400">{m.es}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {img.errores_es && (
            <div className="card border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><AlertTriangle className="h-5 w-5 text-amber-600" /> Errores frecuentes</h2>
              <ul className="list-disc space-y-1 pl-5 text-gray-800 dark:text-gray-200">
                {img.errores_es.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className="card">
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Vocabulario de la figura</h2>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Alemán · español. Toca el altavoz para escuchar la pronunciación.</p>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {img.terminos.map((t, i) => (
                <li
                  key={`${t.de}-${i}`}
                  className={`flex items-start gap-3 py-2 ${activo === i ? 'bg-teal-50 dark:bg-teal-900/20' : ''}`}
                >
                  <button
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    onClick={() => { setActivo(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    disabled={t.x === undefined}
                  >
                    {numeros.has(i) && (
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-bold text-white">{numeros.get(i)}</span>
                    )}
                    <span className="min-w-0">
                      <span className="block font-semibold text-gray-900 dark:text-white">{t.de}</span>
                      <span className="block text-sm italic text-gray-600 dark:text-gray-400">{t.es}</span>
                      {t.nota && <span className="block text-sm text-gray-700 dark:text-gray-300">{t.nota}</span>}
                    </span>
                  </button>
                  <button onClick={() => hablarAleman(t.de)} aria-label={`Escuchar ${t.de}`} className="mt-0.5 flex-shrink-0 text-teal-600 dark:text-teal-400">
                    <Volume2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card bg-teal-50 dark:bg-teal-900/20">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white"><Brain className="h-5 w-5 text-teal-600" /> Ponte a prueba</h2>
            <div className="flex flex-wrap gap-2">
              {interactiva && <button className="btn btn-primary" onClick={() => setPractica('puntos')}>Identificar en la imagen</button>}
              <button className="btn btn-primary" onClick={() => setPractica('vocab')}>Vocabulario alemán → español</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
