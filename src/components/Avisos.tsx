import { useEffect, useState } from 'react';
import { alAvisar } from '../stores/gamificacion';
import type { Aviso } from '../stores/gamificacion';

/** Notificaciones breves (nivel, racha, logros) que aparecen abajo y se van solas. */
export default function Avisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(
    () =>
      alAvisar((a) => {
        setAvisos((prev) => [...prev, a]);
        setTimeout(() => setAvisos((prev) => prev.filter((x) => x.id !== a.id)), 3500);
      }),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {avisos.map((a) => (
        <div key={a.id} className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-gray-900">
          {a.texto}
        </div>
      ))}
    </div>
  );
}
