import { RefreshCw, WifiOff } from 'lucide-react';
import { recargarConNuevaVersion, usePWA } from '../stores/pwa';

/** Franja fina: sin conexión y/o nueva versión disponible. */
export default function EstadoPWA() {
  const pwa = usePWA();
  if (!pwa.sinConexion && !pwa.actualizacion) return null;
  return (
    <div role="status" className="space-y-px text-center text-sm font-medium">
      {pwa.sinConexion && (
        <p className="flex items-center justify-center gap-2 bg-gray-800 px-3 py-1.5 text-white dark:bg-gray-200 dark:text-gray-900">
          <WifiOff className="h-4 w-4" /> Sin conexión: usas la copia guardada y tu progreso se guarda igual.
        </p>
      )}
      {pwa.actualizacion && (
        <button onClick={recargarConNuevaVersion} className="flex w-full items-center justify-center gap-2 bg-teal-600 px-3 py-1.5 text-white">
          <RefreshCw className="h-4 w-4" /> Hay una versión nueva. Toca para actualizar.
        </button>
      )}
    </div>
  );
}
