import { imagenes } from '../data/imagenesInfo';
import extra from '../data/glosario_lectura.json';

export interface EntradaVocab {
  de: string;
  es: string;
  nota?: string;
  /** Figura y término de origen, si viene del glosario de Imágenes (permite guardarlo para repaso). */
  figuraId?: string;
  terminoDe?: string;
}

const LETRA = 'A-Za-zÄÖÜäöüß';

/** Variantes buscables de un término: sin paréntesis y el contenido de los paréntesis. */
function variantes(de: string): string[] {
  const base = de.replace(/\s*\(.*?\)/g, '').trim();
  const dentro = [...de.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());
  return [base, ...dentro].filter((v) => v.length >= 5 && !/[\d/]/.test(v) && v.split(' ').length <= 3);
}

function construir() {
  const mapa = new Map<string, EntradaVocab>();
  const añadir = (clave: string, e: EntradaVocab) => {
    const k = clave.toLowerCase();
    if (!mapa.has(k)) mapa.set(k, e);
  };
  // Primero el glosario propio de la lectura (más general), luego los términos de figuras.
  for (const t of extra as { de: string; es: string; nota?: string }[]) {
    for (const v of variantes(t.de)) añadir(v, { de: t.de, es: t.es, nota: t.nota });
  }
  for (const img of imagenes) {
    for (const t of img.terminos) {
      for (const v of variantes(t.de)) {
        añadir(v, { de: t.de, es: t.es, nota: t.nota, figuraId: img.id, terminoDe: t.de });
      }
    }
  }
  const claves = [...mapa.keys()].sort((a, b) => b.length - a.length);
  const esc = claves.map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(?<![${LETRA}])(${esc.join('|')})(?:e|en|er|es|n|s)?(?![${LETRA}])`, 'gi');
  return { mapa, re };
}

let cache: ReturnType<typeof construir> | null = null;
const vocab = () => (cache ??= construir());

export type Trozo = string | { texto: string; entrada: EntradaVocab };

/** Parte un texto en trozos, marcando la PRIMERA aparición de cada término (por `vistos`). */
export function resaltar(texto: string, vistos: Set<string>): Trozo[] {
  const { mapa, re } = vocab();
  const out: Trozo[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(re)) {
    const entrada = mapa.get(m[1].toLowerCase());
    if (!entrada) continue;
    const id = entrada.de.toLowerCase();
    if (vistos.has(id)) continue;
    vistos.add(id);
    const ini = m.index ?? 0;
    if (ini > ultimo) out.push(texto.slice(ultimo, ini));
    out.push({ texto: m[0], entrada });
    ultimo = ini + m[0].length;
  }
  if (ultimo < texto.length) out.push(texto.slice(ultimo));
  return out;
}
