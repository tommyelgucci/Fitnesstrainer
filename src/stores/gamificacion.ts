import { useSyncExternalStore } from 'react';
import { imagenes } from '../data/imagenesInfo';

/**
 * XP, nivel, racha y logros. Es un store a nivel de módulo (no un hook con
 * estado propio) para que cualquier pantalla pueda sumar XP y todas vean lo
 * mismo, sin depender de qué componente esté montado.
 */

const STORAGE_KEY = 'fitness-trainer:gamificacion';
export const META_DIARIA_XP = 50;

export interface Estado {
  xp: number;
  racha: number;
  mejorRacha: number;
  /** Último día con actividad, YYYY-MM-DD en hora local. */
  ultimoDia: string | null;
  xpPorDia: Record<string, number>;
  correctas: number;
  incorrectas: number;
  figurasVistas: string[];
  rondasPerfectas: number;
  /** Secciones del modo lectura marcadas como leídas: "capitulo:num". */
  seccionesLeidas: string[];
  logros: string[];
}

export interface Nivel {
  numero: number;
  de: string;
  es: string;
  desde: number;
  hasta: number | null;
}

const NIVELES: [string, string, number][] = [
  ['Neuling', 'Novato', 0],
  ['Lehrling', 'Aprendiz', 100],
  ['Praktikant', 'Practicante', 300],
  ['Trainer', 'Entrenador/a', 700],
  ['Profi', 'Profesional', 1500],
  ['Meister', 'Maestro/a', 3000],
];

export function nivelDe(xp: number): Nivel {
  let i = 0;
  while (i + 1 < NIVELES.length && xp >= NIVELES[i + 1][2]) i++;
  return {
    numero: i + 1,
    de: NIVELES[i][0],
    es: NIVELES[i][1],
    desde: NIVELES[i][2],
    hasta: NIVELES[i + 1]?.[2] ?? null,
  };
}

export interface Logro {
  id: string;
  icono: string;
  de: string;
  es: string;
  descripcion: string;
  cumple: (e: Estado) => boolean;
}

export const LOGROS: Logro[] = [
  { id: 'primera', icono: '🌱', de: 'Der erste Schritt', es: 'El primer paso', descripcion: 'Responde tu primera pregunta.', cumple: (e) => e.correctas + e.incorrectas >= 1 },
  { id: 'cincuenta', icono: '🎯', de: '50 richtige Antworten', es: '50 aciertos', descripcion: 'Acumula 50 respuestas correctas.', cumple: (e) => e.correctas >= 50 },
  { id: 'cien', icono: '💯', de: '100 richtige Antworten', es: '100 aciertos', descripcion: 'Acumula 100 respuestas correctas.', cumple: (e) => e.correctas >= 100 },
  { id: 'racha3', icono: '🔥', de: '3 Tage in Folge', es: 'Racha de 3 días', descripcion: 'Estudia 3 días seguidos.', cumple: (e) => e.mejorRacha >= 3 },
  { id: 'racha7', icono: '⚡', de: 'Eine Woche am Stück', es: 'Racha de 7 días', descripcion: 'Estudia 7 días seguidos.', cumple: (e) => e.mejorRacha >= 7 },
  { id: 'racha30', icono: '🏆', de: 'Ein Monat dabei', es: 'Racha de 30 días', descripcion: 'Estudia 30 días seguidos.', cumple: (e) => e.mejorRacha >= 30 },
  { id: 'xp500', icono: '⭐', de: '500 XP', es: '500 XP', descripcion: 'Alcanza 500 XP.', cumple: (e) => e.xp >= 500 },
  { id: 'figuras10', icono: '🖼️', de: 'Bildkenner', es: 'Ojo de águila', descripcion: 'Abre 10 figuras de Imágenes.', cumple: (e) => e.figurasVistas.length >= 10 },
  { id: 'figuras', icono: '🔬', de: 'Alle Bilder gesehen', es: 'Todas las figuras', descripcion: 'Abre todas las figuras de Imágenes.', cumple: (e) => e.figurasVistas.length >= imagenes.length },
  { id: 'lector5', icono: '📖', de: 'Leser', es: 'Lector', descripcion: 'Lee 5 secciones en el modo lectura.', cumple: (e) => e.seccionesLeidas.length >= 5 },
  { id: 'lector25', icono: '📚', de: 'Bücherwurm', es: 'Ratón de biblioteca', descripcion: 'Lee 25 secciones en el modo lectura.', cumple: (e) => e.seccionesLeidas.length >= 25 },
  { id: 'perfecta', icono: '✨', de: 'Perfekte Runde', es: 'Ronda perfecta', descripcion: 'Acierta todo en una ronda de práctica de imágenes.', cumple: (e) => e.rondasPerfectas >= 1 },
];

const vacio = (): Estado => ({
  xp: 0,
  racha: 0,
  mejorRacha: 0,
  ultimoDia: null,
  xpPorDia: {},
  correctas: 0,
  incorrectas: 0,
  figurasVistas: [],
  rondasPerfectas: 0,
  seccionesLeidas: [],
  logros: [],
});

function cargar(): Estado {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...vacio(), ...JSON.parse(raw) };
  } catch {
    /* sin almacenamiento: se trabaja en memoria */
  }
  return vacio();
}

let estado: Estado = cargar();
const oyentes = new Set<() => void>();

export interface Aviso {
  id: number;
  texto: string;
}
let avisoId = 0;
const oyentesAviso = new Set<(a: Aviso) => void>();
const avisar = (texto: string) => oyentesAviso.forEach((f) => f({ id: ++avisoId, texto }));
export const alAvisar = (f: (a: Aviso) => void) => {
  oyentesAviso.add(f);
  return () => {
    oyentesAviso.delete(f);
  };
};

export const claveDia = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const diasEntre = (a: string, b: string) => {
  const t = (s: string) => new Date(`${s}T12:00:00`).getTime();
  return Math.round((t(b) - t(a)) / 86_400_000);
};

/** Racha vigente: si pasó más de un día sin estudiar, ya está rota. */
export function rachaVigente(e: Estado, hoy = claveDia()): number {
  if (!e.ultimoDia) return 0;
  return diasEntre(e.ultimoDia, hoy) <= 1 ? e.racha : 0;
}

export const xpDeHoy = (e: Estado, hoy = claveDia()) => e.xpPorDia[hoy] ?? 0;

function guardar(nuevo: Estado) {
  // Logros nuevos
  const ganados = LOGROS.filter((l) => !nuevo.logros.includes(l.id) && l.cumple(nuevo));
  if (ganados.length) {
    nuevo = { ...nuevo, logros: [...nuevo.logros, ...ganados.map((l) => l.id)] };
    ganados.forEach((l) => avisar(`${l.icono} Logro: ${l.es}`));
  }
  const nivelAntes = nivelDe(estado.xp).numero;
  const nivelDespues = nivelDe(nuevo.xp).numero;
  if (nivelDespues > nivelAntes) avisar(`🎉 ¡Nivel ${nivelDespues}: ${nivelDe(nuevo.xp).es}!`);

  estado = nuevo;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    /* ignorar */
  }
  oyentes.forEach((f) => f());
}

/** Suma XP y mantiene la racha. */
export function ganarXP(cantidad: number, cambios: Partial<Estado> = {}) {
  const hoy = claveDia();
  let { racha, mejorRacha } = estado;
  if (estado.ultimoDia !== hoy) {
    racha = estado.ultimoDia && diasEntre(estado.ultimoDia, hoy) === 1 ? racha + 1 : 1;
    mejorRacha = Math.max(mejorRacha, racha);
    if (racha > 1) avisar(`🔥 ¡${racha} días seguidos!`);
  }
  const antes = xpDeHoy(estado, hoy);
  if (antes < META_DIARIA_XP && antes + cantidad >= META_DIARIA_XP) avisar('🎯 ¡Meta diaria cumplida!');
  guardar({
    ...estado,
    ...cambios,
    xp: estado.xp + cantidad,
    racha,
    mejorRacha,
    ultimoDia: hoy,
    xpPorDia: { ...estado.xpPorDia, [hoy]: antes + cantidad },
  });
}

/** +10 XP por acierto, +2 por intentarlo. */
export function registrarRespuestaXP(correcta: boolean) {
  ganarXP(correcta ? 10 : 2, correcta ? { correctas: estado.correctas + 1 } : { incorrectas: estado.incorrectas + 1 });
}

/** +3 XP la primera vez que abres una figura. */
export function registrarFigura(id: string) {
  if (estado.figurasVistas.includes(id)) return;
  ganarXP(3, { figurasVistas: [...estado.figurasVistas, id] });
}

/** Bonus al terminar una ronda de práctica de imágenes. */
export function rondaCompletada(aciertos: number, total: number) {
  const perfecta = total > 0 && aciertos === total;
  ganarXP(perfecta ? 20 : 5, perfecta ? { rondasPerfectas: estado.rondasPerfectas + 1 } : {});
}

/** +5 XP la primera vez que marcas una sección del modo lectura como leída. */
export function marcarSeccionLeida(clave: string) {
  if (estado.seccionesLeidas.includes(clave)) return;
  ganarXP(5, { seccionesLeidas: [...estado.seccionesLeidas, clave] });
}

export function reiniciarGamificacion() {
  guardar(vacio());
}

const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
};

export function useGamificacion(): Estado {
  return useSyncExternalStore(suscribir, () => estado);
}
