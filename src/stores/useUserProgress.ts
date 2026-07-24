import { useState, useEffect, useCallback } from 'react';
import type { RespuestaUsuario, UserProgress } from '../types';

const STORAGE_KEY = 'fitness-trainer:progress';

interface UseUserProgressReturn {
  progress: UserProgress;
  registrarRespuesta: (
    pregunta_id: string,
    respuesta_correcta: boolean
  ) => void;
  obtenerRespuestasCapitulo: (capitulo_id: string) => RespuestaUsuario[];
  obtenerTasaExito: (capitulo_id?: string) => number;
  actualizarRacha: () => void;
  exportarDatos: () => string;
  importarDatos: (json: string) => void;
  borrarTodo: () => void;
}

function crearProgressVacio(): UserProgress {
  return {
    capitulos_progreso: {},
    respuestas_guardadas: {},
    ultimas_preguntas_vistas: [],
    fecha_ultima_actividad: Date.now(),
    racha_dias: 0,
  };
}

export function useUserProgress(): UseUserProgressReturn {
  const [progress, setProgress] = useState<UserProgress>(crearProgressVacio());

  // Cargar desde localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProgress(data);
      } catch (e) {
        console.warn('Error loading progress data:', e);
      }
    }
  }, []);

  // Guardar a localStorage cuando cambia progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // Registrar respuesta
  const registrarRespuesta = useCallback(
    (pregunta_id: string, respuesta_correcta: boolean) => {
      setProgress((prev) => {
        const nuevasRespuestas = { ...prev.respuestas_guardadas };

        nuevasRespuestas[pregunta_id] = {
          pregunta_id,
          correcta: respuesta_correcta,
          fecha: Date.now(),
        };

        return {
          ...prev,
          respuestas_guardadas: nuevasRespuestas,
          fecha_ultima_actividad: Date.now(),
          ultimas_preguntas_vistas: [
            pregunta_id,
            ...prev.ultimas_preguntas_vistas.slice(0, 9), // Últimas 10
          ],
        };
      });
    },
    []
  );

  // Obtener respuestas de un capítulo
  const obtenerRespuestasCapitulo = useCallback(
    (_capitulo_id: string): RespuestaUsuario[] => {
      // Esta función necesita acceso a la lista de preguntas
      // Por ahora retorna todas (será filtrado en el componente)
      return Object.values(progress.respuestas_guardadas);
    },
    [progress]
  );

  // Calcular tasa de éxito
  const obtenerTasaExito = useCallback(
    (_capitulo_id?: string): number => {
      const respuestas = Object.values(progress.respuestas_guardadas);
      if (respuestas.length === 0) return 0;

      const correctas = respuestas.filter((r) => r.correcta).length;
      return Math.round((correctas / respuestas.length) * 100);
    },
    [progress]
  );

  // Actualizar racha de días
  const actualizarRacha = useCallback(() => {
    setProgress((prev) => {
      const ahora = new Date();
      const ultimaActividad = new Date(prev.fecha_ultima_actividad);

      // Diferencia en días
      const diff_ms = ahora.getTime() - ultimaActividad.getTime();
      const diff_dias = Math.floor(diff_ms / (1000 * 60 * 60 * 24));

      let nueva_racha = prev.racha_dias;

      if (diff_dias === 0) {
        // Mismo día, no cambiar
        nueva_racha = prev.racha_dias;
      } else if (diff_dias === 1) {
        // Día siguiente, incrementar
        nueva_racha = prev.racha_dias + 1;
      } else if (diff_dias > 1) {
        // Salto mayor, resetear racha
        nueva_racha = 1;
      }

      return {
        ...prev,
        racha_dias: Math.max(1, nueva_racha),
        fecha_ultima_actividad: Date.now(),
      };
    });
  }, []);

  // Exportar datos
  const exportarDatos = useCallback(() => {
    return JSON.stringify(progress, null, 2);
  }, [progress]);

  // Importar datos
  const importarDatos = useCallback((json: string) => {
    try {
      const datos = JSON.parse(json);
      setProgress(datos);
    } catch (e) {
      console.error('Error importing progress data:', e);
    }
  }, []);

  // Borrar todo
  const borrarTodo = useCallback(() => {
    setProgress(crearProgressVacio());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    registrarRespuesta,
    obtenerRespuestasCapitulo,
    obtenerTasaExito,
    actualizarRacha,
    exportarDatos,
    importarDatos,
    borrarTodo,
  };
}
