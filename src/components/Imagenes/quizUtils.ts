import type { Imagen, Termino } from '../../data/imagenesInfo';

export interface Item {
  img: Imagen;
  indice: number;
  t: Termino;
}

export type Modo = 'puntos' | 'vocab';
/** 'mixto' elige por término: punto sobre la imagen si lo tiene, vocabulario si no. */
export type ModoQuiz = Modo | 'mixto';

export const modoEfectivo = (modo: ModoQuiz, t: Termino): Modo =>
  modo === 'mixto' ? (t.x !== undefined ? 'puntos' : 'vocab') : modo;

export const barajar = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Reúne los términos practicables de las imágenes dadas. */
export function itemsDe(lista: Imagen[], modo: Modo): Item[] {
  return lista.flatMap((img) =>
    img.terminos
      .map((t, indice) => ({ img, indice, t }))
      .filter((it) => (modo === 'puntos' ? it.t.x !== undefined : true)),
  );
}

