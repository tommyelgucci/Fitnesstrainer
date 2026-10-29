import type { Bloque, Seccion } from '../lectura/parser';
import k1 from './lecciones_es/k1.json';
import k2 from './lecciones_es/k2.json';
import k31 from './lecciones_es/k3.1.json';
import k32 from './lecciones_es/k3.2.json';
import k33 from './lecciones_es/k3.3.json';
import k34 from './lecciones_es/k3.4.json';
import k35 from './lecciones_es/k3.5.json';
import k36 from './lecciones_es/k3.6.json';
import k37 from './lecciones_es/k3.7.json';
import k4a from './lecciones_es/k4a.json';
import k4b from './lecciones_es/k4b.json';
import k5a from './lecciones_es/k5a.json';
import k5b from './lecciones_es/k5b.json';
import k8 from './lecciones_es/k8.json';

/**
 * Traducción al español de las lecciones, por sección ("capitulo:num"), una cadena por
 * fragmento en el orden del parser (cada párrafo, etiqueta, subtítulo y cada punto de lista
 * cuentan como un fragmento). Se ignora si no coincide el número de fragmentos: así un
 * cambio en el parser nunca desalinea el texto.
 */
const TRADUCCIONES: Record<string, string[]> = {
  ...k1, ...k2, ...k31, ...k32, ...k33, ...k34, ...k35, ...k36, ...k37, ...k4a, ...k4b, ...k5a, ...k5b, ...k8,
};

export type TraduccionBloque = string | string[];

export function traduccionPorBloque(clave: string, seccion: Seccion): TraduccionBloque[] | null {
  const t = TRADUCCIONES[clave];
  if (!t) return null;
  const unidades = seccion.bloques.reduce((n: number, b: Bloque) => n + (b.tipo === 'ul' ? b.items.length : 1), 0);
  if (unidades !== t.length) return null;
  let i = 0;
  return seccion.bloques.map((b) => {
    if (b.tipo === 'ul') {
      const items = t.slice(i, i + b.items.length);
      i += b.items.length;
      return items;
    }
    return t[i++];
  });
}
