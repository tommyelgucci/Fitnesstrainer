/**
 * Sistema Leitner: 5 cajas de repetición espaciada
 *
 * Caja 1: Repasa DIARIO (acabas de fallar)
 * Caja 2: Repasa cada 3 días
 * Caja 3: Repasa cada 7 días
 * Caja 4: Repasa cada 14 días
 * Caja 5: DOMINADO (repasa cada 30 días, opcional)
 */

export interface LeitnerCard {
  pregunta_id: string;
  numero_caja: 1 | 2 | 3 | 4 | 5;
  fecha_proximo_repaso: number; // timestamp
  veces_correctas: number;
  veces_incorrectas: number;
  fecha_creacion: number;
  fecha_ultima_respuesta?: number;
}

export interface LeitnerStats {
  total_cards: number;
  por_caja: [number, number, number, number, number];
  proximas_hoy: string[]; // IDs de preguntas
  proximas_esta_semana: string[];
}

// Intervalos en milisegundos
const INTERVALOS_CAJA: Record<number, number> = {
  1: 1 * 24 * 60 * 60 * 1000, // 1 día
  2: 3 * 24 * 60 * 60 * 1000, // 3 días
  3: 7 * 24 * 60 * 60 * 1000, // 7 días
  4: 14 * 24 * 60 * 60 * 1000, // 14 días
  5: 30 * 24 * 60 * 60 * 1000, // 30 días
};

/**
 * Crear una nueva tarjeta Leitner (siempre comienza en caja 1)
 */
export function crearTarjeta(pregunta_id: string): LeitnerCard {
  const ahora = Date.now();
  return {
    pregunta_id,
    numero_caja: 1,
    fecha_proximo_repaso: ahora, // Repasa inmediatamente
    veces_correctas: 0,
    veces_incorrectas: 0,
    fecha_creacion: ahora,
  };
}

/**
 * Procesar respuesta: mover tarjeta a caja siguiente o retroceder a caja 1
 */
export function procesarRespuesta(
  tarjeta: LeitnerCard,
  correcta: boolean
): LeitnerCard {
  const ahora = Date.now();
  const tarjetaActualizada = { ...tarjeta, fecha_ultima_respuesta: ahora };

  if (correcta) {
    // Acierto: avanzar a siguiente caja (máximo caja 5)
    const siguienteCaja = Math.min(tarjeta.numero_caja + 1, 5) as 1 | 2 | 3 | 4 | 5;
    tarjetaActualizada.numero_caja = siguienteCaja;
    tarjetaActualizada.veces_correctas++;
  } else {
    // Fallo: retroceder a caja 1
    tarjetaActualizada.numero_caja = 1;
    tarjetaActualizada.veces_incorrectas++;
  }

  // Calcular próximo repaso según la caja actual
  tarjetaActualizada.fecha_proximo_repaso =
    ahora + INTERVALOS_CAJA[tarjetaActualizada.numero_caja];

  return tarjetaActualizada;
}

/**
 * Obtener tarjetas que deben repasar hoy (fecha_proximo_repaso <= ahora)
 */
export function obtenerTarjetasParaHoy(tarjetas: LeitnerCard[]): LeitnerCard[] {
  const ahora = Date.now();
  return tarjetas.filter((t) => t.fecha_proximo_repaso <= ahora).sort((a, b) => {
    // Ordenar: primero caja 1 (más urgentes), luego por fecha
    if (a.numero_caja !== b.numero_caja) {
      return a.numero_caja - b.numero_caja;
    }
    return a.fecha_proximo_repaso - b.fecha_proximo_repaso;
  });
}

/**
 * Obtener IDs de preguntas para repasar hoy
 */
export function obtenerPreguntasParaHoy(tarjetas: LeitnerCard[]): string[] {
  return obtenerTarjetasParaHoy(tarjetas).map((t) => t.pregunta_id);
}

/**
 * Obtener estadísticas del sistema Leitner
 */
export function calcularStats(tarjetas: LeitnerCard[]): LeitnerStats {
  const ahora = Date.now();
  const unaSemanaDespues = ahora + 7 * 24 * 60 * 60 * 1000;

  const por_caja: [number, number, number, number, number] = [0, 0, 0, 0, 0];

  tarjetas.forEach((t) => {
    por_caja[t.numero_caja - 1]++;
  });

  const proximas_hoy = obtenerPreguntasParaHoy(tarjetas);
  const proximas_esta_semana = tarjetas
    .filter(
      (t) =>
        t.fecha_proximo_repaso > ahora && t.fecha_proximo_repaso <= unaSemanaDespues
    )
    .map((t) => t.pregunta_id);

  return {
    total_cards: tarjetas.length,
    por_caja,
    proximas_hoy,
    proximas_esta_semana,
  };
}

/**
 * Obtener tarjetas en estado crítico (caja 1 y vencidas)
 */
export function obtenerTarjetasCriticas(tarjetas: LeitnerCard[]): LeitnerCard[] {
  const ahora = Date.now();
  return tarjetas
    .filter((t) => t.numero_caja === 1 || t.fecha_proximo_repaso <= ahora)
    .sort((a, b) => a.fecha_proximo_repaso - b.fecha_proximo_repaso);
}

/**
 * Obtener progreso: % de tarjetas dominadas (caja 5)
 */
export function obtenerProgresoDominadas(tarjetas: LeitnerCard[]): number {
  if (tarjetas.length === 0) return 0;
  const dominadas = tarjetas.filter((t) => t.numero_caja === 5).length;
  return Math.round((dominadas / tarjetas.length) * 100);
}

/**
 * Resetear tarjeta (volver a caja 1)
 */
export function resetearTarjeta(tarjeta: LeitnerCard): LeitnerCard {
  return {
    ...tarjeta,
    numero_caja: 1,
    fecha_proximo_repaso: Date.now(),
    veces_correctas: 0,
    veces_incorrectas: 0,
  };
}

/**
 * Obtener tiempo formateado hasta próximo repaso
 */
export function formatearTiempoProxRepaso(fecha_proximo_repaso: number): string {
  const ahora = Date.now();
  const diff = fecha_proximo_repaso - ahora;

  if (diff <= 0) return 'HOY';

  const dias = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (dias === 1) return 'Mañana';
  if (dias < 7) return `${dias} días`;
  if (dias < 30) return `${Math.ceil(dias / 7)} semanas`;
  return `${Math.ceil(dias / 30)} meses`;
}

/**
 * Estadísticas por pregunta
 */
export function obtenerEstadisticasPorPregunta(
  tarjeta: LeitnerCard
): {
  total_intentos: number;
  tasa_exito: number;
  en_caja: number;
} {
  const total = tarjeta.veces_correctas + tarjeta.veces_incorrectas;
  const tasa_exito =
    total === 0 ? 0 : Math.round((tarjeta.veces_correctas / total) * 100);

  return {
    total_intentos: total,
    tasa_exito,
    en_caja: tarjeta.numero_caja,
  };
}
