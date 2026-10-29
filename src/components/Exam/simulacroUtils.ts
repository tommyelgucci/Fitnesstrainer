import capitulosData from '../../data/capitulos.json';
import preguntasData from '../../data/preguntas.json';
import type { Pregunta } from '../../types';

export type ModoSimulacro = 'completo' | 'medio' | 'rapido' | 'errores';

export interface ConfigSimulacro {
  id: ModoSimulacro;
  titulo: string;
  emoji: string;
  preguntas: number;
  minutos: number;
  descripcion: string;
}

/**
 * Formatos propios de la app. El manual no fija el formato del examen oficial en el
 * material que tengo, así que tiempos y notas son de estudio, no los criterios oficiales.
 */
export const CONFIGS: ConfigSimulacro[] = [
  { id: 'completo', titulo: 'Simulacro completo', emoji: '🏆', preguntas: 195, minutos: 180, descripcion: 'Todo el banco de preguntas, repartido en orden aleatorio. Para el ensayo general.' },
  { id: 'medio', titulo: 'Simulacro medio', emoji: '🎯', preguntas: 60, minutos: 60, descripcion: 'Preguntas proporcionales al peso de cada capítulo. Ideal para una tarde.' },
  { id: 'rapido', titulo: 'Simulacro rápido', emoji: '⚡', preguntas: 20, minutos: 20, descripcion: 'Una muestra corta y proporcional para medirte en poco tiempo.' },
  { id: 'errores', titulo: 'Repaso de mis errores', emoji: '🔁', preguntas: 30, minutos: 30, descripcion: 'Solo preguntas que has fallado antes (Quiz, Lecciones, Flashcards o simulacros).' },
];

/** Objetivo propio de la app (el mismo 80 % que se pide para avanzar de lección). */
export const META_APROBADO = 80;

export type Confianza = 'seguro' | 'dudo' | 'nose';
export type Nota = 'ok' | 'parcial' | 'mal';

export interface Respuesta {
  texto: string;
  confianza?: Confianza;
  marcada?: boolean;
}

export interface Sesion {
  modo: ModoSimulacro;
  ids: string[];
  inicio: number;
  duracionMs: number;
  fase: 'examen' | 'correccion';
  respuestas: Record<string, Respuesta>;
  notas: Record<string, Nota>;
  indice: number;
}

const TODAS = preguntasData.preguntas as Pregunta[];
export const preguntaPorId = (id: string) => TODAS.find((p) => p.id === id);

const barajar = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Reparte `n` preguntas entre capítulos según su peso (método del mayor resto). */
export function repartoPorCapitulo(n: number): Record<string, number> {
  const caps = capitulosData.capitulos
    .map((c) => ({ id: c.id, peso: c.peso, max: TODAS.filter((p) => p.capitulo_id === c.id).length }))
    .filter((c) => c.max > 0);
  const total = caps.reduce((a, c) => a + c.peso, 0);
  const cuota = caps.map((c) => ({ ...c, exacto: (c.peso / total) * n }));
  const reparto: Record<string, number> = {};
  for (const c of cuota) reparto[c.id] = Math.min(c.max, Math.max(1, Math.floor(c.exacto)));
  let asignadas = Object.values(reparto).reduce((a, b) => a + b, 0);
  const porResto = [...cuota].sort((a, b) => (b.exacto % 1) - (a.exacto % 1));
  for (let vuelta = 0; asignadas < n && vuelta < 50; vuelta++) {
    for (const c of porResto) {
      if (asignadas >= n) break;
      if (reparto[c.id] < c.max) {
        reparto[c.id]++;
        asignadas++;
      }
    }
  }
  return reparto;
}

export function elegirPreguntas(cfg: ConfigSimulacro, erroresIds: string[]): Pregunta[] {
  if (cfg.id === 'errores') {
    return barajar(TODAS.filter((p) => erroresIds.includes(p.id))).slice(0, cfg.preguntas);
  }
  if (cfg.preguntas >= TODAS.length) return barajar(TODAS);
  const reparto = repartoPorCapitulo(cfg.preguntas);
  return barajar(Object.entries(reparto).flatMap(([cap, n]) => barajar(TODAS.filter((p) => p.capitulo_id === cap)).slice(0, n)));
}

export const valorNota = (n?: Nota) => (n === 'ok' ? 1 : n === 'parcial' ? 0.5 : 0);

export function puntaje(ids: string[], notas: Record<string, Nota>) {
  const suma = ids.reduce((a, id) => a + valorNota(notas[id]), 0);
  return { suma, pct: ids.length ? Math.round((suma / ids.length) * 100) : 0 };
}

export const fueContestada = (r?: Respuesta) => !!r && (r.texto.trim().length > 0 || !!r.confianza);

export function formatearTiempo(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dos = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${dos(m)}:${dos(seg)}` : `${dos(m)}:${dos(seg)}`;
}
