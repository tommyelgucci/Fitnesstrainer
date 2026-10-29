import { useSyncExternalStore } from 'react';

/**
 * Estado de la app instalable / sin conexión: conexión, si el service worker ya
 * guardó todo, si hay una versión nueva y el aviso de instalación del navegador.
 */

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface EstadoPWA {
  sinConexion: boolean;
  listoOffline: boolean;
  actualizacion: boolean;
  puedeInstalar: boolean;
  instalada: boolean;
}

let estado: EstadoPWA = {
  sinConexion: typeof navigator !== 'undefined' && !navigator.onLine,
  listoOffline: false,
  actualizacion: false,
  puedeInstalar: false,
  instalada: typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches,
};
const oyentes = new Set<() => void>();
let aviso: EventoInstalacion | null = null;

const cambiar = (parcial: Partial<EstadoPWA>) => {
  estado = { ...estado, ...parcial };
  oyentes.forEach((f) => f());
};

export async function instalarApp() {
  if (!aviso) return;
  await aviso.prompt();
  const { outcome } = await aviso.userChoice;
  aviso = null;
  cambiar({ puedeInstalar: false, instalada: outcome === 'accepted' });
}

export const recargarConNuevaVersion = () => window.location.reload();

/** Registra el service worker (solo en producción) y engancha los eventos. Llamar una vez al arrancar. */
export function iniciarPWA() {
  window.addEventListener('online', () => cambiar({ sinConexion: false }));
  window.addEventListener('offline', () => cambiar({ sinConexion: true }));
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    aviso = e as EventoInstalacion;
    cambiar({ puedeInstalar: true });
  });
  window.addEventListener('appinstalled', () => cambiar({ instalada: true, puedeInstalar: false }));

  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;

  const hayControlador = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // un cambio de controlador sin haber tenido uno antes es la primera instalación
    if (hayControlador) cambiar({ actualizacion: true });
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then(() => navigator.serviceWorker.ready)
      .then(async () => {
        const claves = await caches.keys();
        cambiar({ listoOffline: claves.some((k) => k.startsWith('fitnessb-')) });
      })
      .catch(() => {
        /* sin service worker la app funciona igual, solo con conexión */
      });
  });
}

const suscribir = (f: () => void) => {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
};

export const usePWA = () => useSyncExternalStore(suscribir, () => estado);
