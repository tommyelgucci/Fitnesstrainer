import { useSyncExternalStore } from 'react';
import { crearTarjeta, procesarRespuesta } from '../utils/leitner';
import type { LeitnerCard } from '../utils/leitner';

/**
 * Leitner de términos de las figuras. Va aparte de `useLeitner` (que trabaja con
 * ids de preguntas) para no mezclar ids ni romper Flashcards/Lecciones.
 * Una tarjeta nace al FALLAR un término; después se repasa en cajas (1, 3, 7, 14, 30 días).
 */

const STORAGE_KEY = 'fitness-trainer:leitner-terminos';

/** Clave estable de un término: figura + palabra alemana. */
export const claveTermino = (imagenId: string, de: string) => `${imagenId}|${de}`;

function cargar(): LeitnerCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const datos = JSON.parse(raw);
      if (Array.isArray(datos)) return datos;
    }
  } catch {
    /* sin almacenamiento: memoria */
  }
  return [];
}

let tarjetas: LeitnerCard[] = cargar();
const oyentes = new Set<() => void>();

function guardar(nuevas: LeitnerCard[]) {
  tarjetas = nuevas;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarjetas));
  } catch {
    /* ignorar */
  }
  oyentes.forEach((f) => f());
}

/** Un fallo crea la tarjeta (caja 1); un acierto solo avanza una que ya existe. */
export function responderTermino(imagenId: string, de: string, correcta: boolean) {
  const id = claveTermino(imagenId, de);
  const existente = tarjetas.find((t) => t.pregunta_id === id);
  if (!existente) {
    if (correcta) return;
    guardar([...tarjetas, procesarRespuesta(crearTarjeta(id), false)]);
    return;
  }
  guardar(tarjetas.map((t) => (t.pregunta_id === id ? procesarRespuesta(t, correcta) : t)));
}

export const estaPendiente = (t: LeitnerCard, ahora = Date.now()) => t.fecha_proximo_repaso <= ahora;

export function reiniciarRepasoTerminos() {
  guardar([]);
}

const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
};

export function useRepasoTerminos(): LeitnerCard[] {
  return useSyncExternalStore(suscribir, () => tarjetas);
}
