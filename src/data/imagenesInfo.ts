import imagenesData from './imagenes.json';
import anatomiaBasica from './imagenes_info/anatomia_basica.json';
import musculoYSistemas from './imagenes_info/musculo_y_sistemas.json';
import entrenamiento from './imagenes_info/entrenamiento.json';
import ejercicios from './imagenes_info/ejercicios.json';

export interface Termino {
  de: string;
  es: string;
  nota?: string;
  /** Posición del punto sobre la imagen, en % del ancho/alto. */
  x?: number;
  y?: number;
}

export interface Musculo {
  de: string;
  es: string;
  rol: string;
}

export interface ImagenInfo {
  tipo: 'anatomia' | 'ejercicio' | 'grafico' | 'tabla';
  /** Si existe, se dibuja un SVG bilingüe propio en lugar de la imagen del manual. */
  diagrama?: string;
  resumen_es: string;
  claves_es?: string[];
  terminos: Termino[];
  ejecucion_es?: string[];
  musculos?: Musculo[];
  errores_es?: string[];
}

export interface Imagen extends ImagenInfo {
  id: string;
  capitulo_id: string;
  archivo: string;
  titulo_de: string;
  titulo_es: string;
}

const info = {
  ...anatomiaBasica,
  ...musculoYSistemas,
  ...entrenamiento,
  ...ejercicios,
} as unknown as Record<string, ImagenInfo>;

export const imagenes: Imagen[] = (imagenesData as Omit<Imagen, keyof ImagenInfo>[]).map(
  (img) => ({ ...img, archivo: `${import.meta.env.BASE_URL}${img.archivo}`, ...info[img.id] }),
);

export const imagenPorId = (id: string) => imagenes.find((i) => i.id === id);

export const tieneHotspots = (img: Imagen) => img.terminos.some((t) => t.x !== undefined);
