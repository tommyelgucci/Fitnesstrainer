import { useState, useEffect, useCallback } from 'react';
import type {
  LeitnerCard,
  LeitnerStats,
} from '../utils/leitner';
import {
  crearTarjeta,
  procesarRespuesta,
  calcularStats,
  obtenerTarjetasParaHoy,
  obtenerTarjetasCriticas,
  obtenerProgresoDominadas,
  resetearTarjeta,
  obtenerPreguntasParaHoy,
} from '../utils/leitner';

const STORAGE_KEY = 'fitness-trainer:leitner-cards';

interface UseLeitnerReturn {
  tarjetas: LeitnerCard[];
  stats: LeitnerStats;
  progreso_dominadas: number;

  // Acciones
  inicializarTarjetas: (pregunta_ids: string[]) => void;
  responderPregunta: (pregunta_id: string, correcta: boolean) => void;
  resetearTarjeta: (pregunta_id: string) => void;
  cargarTarjeta: (pregunta_id: string) => LeitnerCard | undefined;
  obtenerTarjetasHoy: () => LeitnerCard[];
  obtenerTarjetasCriticas: () => LeitnerCard[];
  obtenerPreguntasHoy: () => string[];
  borrarTodas: () => void;
  exportarDatos: () => string;
  importarDatos: (json: string) => void;
}

export function useLeitner(): UseLeitnerReturn {
  const [tarjetas, setTarjetas] = useState<LeitnerCard[]>([]);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTarjetas(JSON.parse(saved));
      } catch (e) {
        console.warn('Error loading Leitner data:', e);
      }
    }
  }, []);

  // Guardar a localStorage cuando cambian tarjetas
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarjetas));
  }, [tarjetas]);

  // Calcular stats
  const stats = calcularStats(tarjetas);
  const progreso_dominadas = obtenerProgresoDominadas(tarjetas);

  // Inicializar tarjetas para un conjunto de preguntas
  const inicializarTarjetas = useCallback((pregunta_ids: string[]) => {
    const tarjetasExistentes = new Set(tarjetas.map((t) => t.pregunta_id));
    const nuevasTarjetas = pregunta_ids
      .filter((id) => !tarjetasExistentes.has(id))
      .map((id) => crearTarjeta(id));

    setTarjetas((prev) => [...prev, ...nuevasTarjetas]);
  }, [tarjetas]);

  // Responder pregunta
  const responderPregunta = useCallback(
    (pregunta_id: string, correcta: boolean) => {
      setTarjetas((prev) => {
        const tarjeta = prev.find((t) => t.pregunta_id === pregunta_id);
        if (!tarjeta) {
          // Si no existe, crearla
          return [...prev, procesarRespuesta(crearTarjeta(pregunta_id), correcta)];
        }

        return prev.map((t) =>
          t.pregunta_id === pregunta_id ? procesarRespuesta(t, correcta) : t
        );
      });
    },
    []
  );

  // Resetear una tarjeta
  const resetearTarjetaFn = useCallback((pregunta_id: string) => {
    setTarjetas((prev) =>
      prev.map((t) =>
        t.pregunta_id === pregunta_id ? resetearTarjeta(t) : t
      )
    );
  }, []);

  // Cargar tarjeta específica
  const cargarTarjeta = useCallback(
    (pregunta_id: string): LeitnerCard | undefined => {
      return tarjetas.find((t) => t.pregunta_id === pregunta_id);
    },
    [tarjetas]
  );

  // Obtener tarjetas para hoy
  const obtenerTarjetasHoy = useCallback(() => {
    return obtenerTarjetasParaHoy(tarjetas);
  }, [tarjetas]);

  // Obtener tarjetas críticas
  const obtenerTarjetasCriticasFn = useCallback(() => {
    return obtenerTarjetasCriticas(tarjetas);
  }, [tarjetas]);

  // Obtener IDs de preguntas para hoy
  const obtenerPreguntasHoy = useCallback(() => {
    return obtenerPreguntasParaHoy(tarjetas);
  }, [tarjetas]);

  // Borrar todas las tarjetas
  const borrarTodas = useCallback(() => {
    setTarjetas([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Exportar datos
  const exportarDatos = useCallback(() => {
    return JSON.stringify(tarjetas, null, 2);
  }, [tarjetas]);

  // Importar datos
  const importarDatos = useCallback((json: string) => {
    try {
      const datos = JSON.parse(json);
      if (Array.isArray(datos)) {
        setTarjetas(datos);
      } else {
        console.error('Invalid Leitner data format');
      }
    } catch (e) {
      console.error('Error importing Leitner data:', e);
    }
  }, []);

  return {
    tarjetas,
    stats,
    progreso_dominadas,

    inicializarTarjetas,
    responderPregunta,
    resetearTarjeta: resetearTarjetaFn,
    cargarTarjeta,
    obtenerTarjetasHoy,
    obtenerTarjetasCriticas: obtenerTarjetasCriticasFn,
    obtenerPreguntasHoy,
    borrarTodas,
    exportarDatos,
    importarDatos,
  };
}
