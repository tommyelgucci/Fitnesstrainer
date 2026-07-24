import { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import imagenesData from '../../data/imagenes.json';

interface Imagen {
  id: string;
  capitulo_id: string;
  archivo: string;
  titulo_de: string;
  titulo_es: string;
}

const imagenes = imagenesData as Imagen[];

export default function Imagenes() {
  const [seleccionada, setSeleccionada] = useState<Imagen | null>(null);

  const getImagenesCapitulo = (capituloId: string) =>
    imagenes.filter((img) => img.capitulo_id === capituloId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="card bg-teal-50 dark:bg-teal-900/20">
        <div className="flex items-start gap-3">
          <ImageIcon className="h-6 w-6 flex-shrink-0 text-teal-600 dark:text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Imágenes</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Diagramas y gráficas del manual, con el título en alemán y su traducción.
              Toca una imagen para verla en grande.
            </p>
          </div>
        </div>
      </div>

      {capitulosData.capitulos.map((capitulo) => {
        const imgs = getImagenesCapitulo(capitulo.id);
        if (imgs.length === 0) return null;

        return (
          <div key={capitulo.id} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cap. {capitulo.numero}
              {capitulo.subtitulo && `.${capitulo.subtitulo.split('.')[1]}`} –{' '}
              {capitulo.titulo_es}
              <span className="ml-2 text-xs font-normal text-gray-500">({imgs.length})</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imgs.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSeleccionada(img)}
                  className="card flex flex-col gap-2 p-2 text-left transition-all hover:shadow-lg"
                >
                  <img
                    src={img.archivo}
                    alt={img.titulo_es}
                    className="aspect-square w-full rounded-lg bg-white object-contain"
                    loading="lazy"
                  />
                  <div>
                    <p className="line-clamp-2 text-xs font-medium text-gray-900 dark:text-white">
                      {img.titulo_de}
                    </p>
                    <p className="line-clamp-2 text-xs italic text-gray-500 dark:text-gray-400">
                      {img.titulo_es}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {seleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSeleccionada(null)}
        >
          <div
            className="max-h-full w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-4 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {seleccionada.titulo_de}
                </p>
                <p className="text-sm italic text-gray-600 dark:text-gray-400">
                  {seleccionada.titulo_es}
                </p>
              </div>
              <button
                onClick={() => setSeleccionada(null)}
                className="flex-shrink-0 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <img
              src={seleccionada.archivo}
              alt={seleccionada.titulo_es}
              className="w-full rounded-lg bg-white object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
