import type { ModoSimulacro, Sesion } from '../components/Exam/simulacroUtils';

const CLAVE_SESION = 'fitness-trainer:simulacro-en-curso';
const CLAVE_HISTORIAL = 'fitness-trainer:simulacros';

export interface ResultadoSimulacro {
  fecha: number;
  modo: ModoSimulacro;
  total: number;
  pct: number;
  tiempoMs: number;
}

const leer = <T,>(clave: string, defecto: T): T => {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : defecto;
  } catch {
    return defecto;
  }
};

const escribir = (clave: string, valor: unknown) => {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento */
  }
};

export const leerSesion = (): Sesion | null => leer<Sesion | null>(CLAVE_SESION, null);
export const guardarSesion = (s: Sesion) => escribir(CLAVE_SESION, s);
export const borrarSesion = () => {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch {
    /* ignorar */
  }
};

export const leerHistorial = (): ResultadoSimulacro[] => leer<ResultadoSimulacro[]>(CLAVE_HISTORIAL, []);
export const guardarResultado = (r: ResultadoSimulacro) => escribir(CLAVE_HISTORIAL, [...leerHistorial(), r].slice(-30));
