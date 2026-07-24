export interface Capitulo {
  id: string;
  numero: number;
  subtitulo?: string;
  titulo_de: string;
  titulo_es: string;
  peso: number;
  subcapitulos: Subcapitulo[];
}

export interface Subcapitulo {
  id: string;
  titulo_de: string;
  titulo_es: string;
  contenido_es?: string;
  contenido_de?: string;
}

export interface Pregunta {
  id: string;
  capitulo_id: string;
  numero: string;
  pregunta_de: string;
  pregunta_es: string;
  respuesta_de?: string;
  respuesta_es?: string;
  opciones?: OpcionMultiple[];
  explicacion_es: string;
  terminos_clave: string[];
  dificultad: 1 | 2 | 3;
  peso_en_examen?: number;
}

export interface OpcionMultiple {
  id?: string;
  texto: string;
  correcta: boolean;
}

export interface TerminoClave {
  id: string;
  termino_de: string;
  significado_es: string;
  capitulo_id: string;
  ejemplo_de?: string;
  ejemplo_es?: string;
  frecuencia_en_examen?: number;
}

export interface RespuestaUsuario {
  pregunta_id: string;
  respuesta_seleccionada?: string;
  correcta: boolean;
  fecha: number; // timestamp
}

export interface CapituloProgress {
  capitulo_id: string;
  preguntas_vistas: number;
  preguntas_correctas: number;
  porcentaje_dominado: number;
  puede_avanzar: boolean;
}

export interface UserProgress {
  capitulos_progreso: Record<string, CapituloProgress>;
  respuestas_guardadas: Record<string, RespuestaUsuario>;
  ultimas_preguntas_vistas: string[];
  fecha_ultima_actividad: number;
  racha_dias: number;
}

export interface LeitnerCard {
  pregunta_id: string;
  numero_caja: 1 | 2 | 3 | 4 | 5;
  fecha_proximo_repaso: number;
  veces_correctas: number;
  veces_incorrectas: number;
}

export interface LeitnerStats {
  total_cards: number;
  por_caja: [number, number, number, number, number];
  proximas_hoy: LeitnerCard[];
}

export interface ExamConfig {
  cantidad_preguntas: number;
  tiempo_total_minutos: number;
  capitulos_filtro?: string[]; // Si está vacío, todos
  permite_pausar: boolean;
}

export interface ExamResult {
  id: string;
  fecha: number;
  config: ExamConfig;
  puntaje: number;
  total: number;
  porcentaje: number;
  tiempo_usado_segundos: number;
  preguntas_respondidas: Array<{
    pregunta_id: string;
    correcta: boolean;
    respuesta_seleccionada?: string;
  }>;
}

export interface AppSettings {
  dark_mode: boolean;
  idioma: 'es' | 'de';
  mostrar_explicacion_inmediata: boolean;
  fecha_creacion: number;
  fecha_ultima_actualizacion: number;
}
