import type { Imagen } from '../../data/imagenesInfo';

interface Props {
  img: Imagen;
  /** Índice (dentro de img.terminos) del término activo. */
  activo: number | null;
  onSelect?: (i: number) => void;
  mostrarPuntos?: boolean;
  /** Si se indica, solo se dibuja ese punto (modo práctica). */
  soloIndice?: number;
}

/** La imagen del manual con puntos tocables sobre cada estructura. */
export default function ImagenInteractiva({ img, activo, onSelect, mostrarPuntos = true, soloIndice }: Props) {
  return (
    <div className="relative mx-auto w-full max-w-2xl select-none">
      <img src={img.archivo} alt={img.titulo_es} className="w-full rounded-lg bg-white" />
      {mostrarPuntos &&
        img.terminos.map((t, i) => {
          if (t.x === undefined || t.y === undefined) return null;
          if (soloIndice !== undefined && soloIndice !== i) return null;
          const esActivo = activo === i || soloIndice === i;
          return (
            <button
              key={`${t.de}-${i}`}
              type="button"
              onClick={() => onSelect?.(i)}
              disabled={!onSelect}
              aria-label={`${t.de} – ${t.es}`}
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all ${
                esActivo
                  ? 'z-10 scale-125 animate-pulse border-white bg-teal-600 text-white shadow-lg ring-2 ring-teal-400'
                  : 'border-teal-600 bg-teal-500/10 text-transparent hover:bg-teal-500/40 hover:text-white'
              } ${soloIndice !== undefined ? 'cursor-default' : ''}`}
            >
              {soloIndice !== undefined ? '?' : esActivo ? img.terminos.slice(0, i + 1).filter((x) => x.x !== undefined).length : ''}
            </button>
          );
        })}
    </div>
  );
}
