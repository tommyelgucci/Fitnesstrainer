import { Link } from 'react-router-dom';
import { BookOpen, Layers, Flame, Target, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { useUserProgress } from '../../stores/useUserProgress';
import { LOGROS, META_DIARIA_XP, claveDia, nivelDe, rachaVigente, useGamificacion, xpDeHoy } from '../../stores/gamificacion';

export default function Dashboard() {
  const e = useGamificacion();
  const { progress, obtenerTasaExito } = useUserProgress();
  const hoy = claveDia();
  const racha = rachaVigente(e, hoy);
  const nivel = nivelDe(e.xp);
  const pctNivel = nivel.hasta ? Math.round(((e.xp - nivel.desde) / (nivel.hasta - nivel.desde)) * 100) : 100;
  const xpHoy = xpDeHoy(e, hoy);
  const pctMeta = Math.min(100, Math.round((xpHoy / META_DIARIA_XP) * 100));
  const vistas = Object.keys(progress.respuestas_guardadas).length;

  const semana = Array.from({ length: 7 }, (_, k) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - k));
    const clave = claveDia(d);
    return { clave, xp: e.xpPorDia[clave] ?? 0, letra: d.toLocaleDateString('es', { weekday: 'narrow' }).toUpperCase() };
  });
  const maxSemana = Math.max(META_DIARIA_XP, ...semana.map((d) => d.xp));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Bienvenido
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Prepárate para el examen B-Lizenz (clever fit Akademie)
        </p>
      </div>

      {/* Nivel, racha y meta diaria */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400">Nivel {nivel.numero}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {nivel.de} <span className="text-base font-normal italic text-gray-500">· {nivel.es}</span>
          </p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${pctNivel}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {e.xp} XP{nivel.hasta ? ` · faltan ${nivel.hasta - e.xp} para el siguiente nivel` : ' · ¡nivel máximo!'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Racha de días</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{racha} {racha === 1 ? 'día' : 'días'}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Mejor racha: {e.mejorRacha}</p>
            </div>
            <Flame className={`h-10 w-10 ${racha > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-600'}`} />
          </div>
          {racha > 0 && xpHoy === 0 && (
            <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">Estudia hoy para no perder tu racha.</p>
          )}
          {racha === 0 && <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Responde una pregunta para empezar tu racha.</p>}
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Meta de hoy</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{Math.min(xpHoy, META_DIARIA_XP)} / {META_DIARIA_XP} XP</p>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className={`h-full rounded-full transition-all ${pctMeta === 100 ? 'bg-green-500' : 'bg-teal-500'}`} style={{ width: `${pctMeta}%` }} />
          </div>
          <div className="mt-3 flex h-12 items-end gap-1" aria-label="XP de los últimos 7 días">
            {semana.map((d) => (
              <div key={d.clave} className="flex flex-1 flex-col items-center gap-0.5">
                <div className={`w-full rounded-sm ${d.xp >= META_DIARIA_XP ? 'bg-green-500' : d.xp > 0 ? 'bg-teal-400' : 'bg-gray-200 dark:bg-gray-700'}`} style={{ height: `${Math.max(4, (d.xp / maxSemana) * 36)}px` }} title={`${d.xp} XP`} />
                <span className="text-[10px] text-gray-500">{d.letra}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Preguntas respondidas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vistas}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">% de acierto</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{obtenerTasaExito()}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Logros</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{e.logros.length}/{LOGROS.length}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Main CTA Buttons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <Link
          to="/lecciones"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lecciones
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aprende capítulo por capítulo
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/flashcards"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
              <Layers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Flashcards
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Memoriza términos alemanes
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/imagenes"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-teal-100 p-3 dark:bg-teal-900">
              <ImageIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Imágenes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Diagramas y gráficas del manual
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Logros */}
      <div className="card mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Logros</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {LOGROS.map((l) => {
            const ok = e.logros.includes(l.id);
            return (
              <div key={l.id} className={`rounded-lg border p-3 text-center ${ok ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20' : 'border-gray-200 opacity-60 dark:border-gray-700'}`}>
                <div className={`text-3xl ${ok ? '' : 'grayscale'}`}>{l.icono}</div>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{l.de}</p>
                <p className="text-xs italic text-gray-600 dark:text-gray-400">{l.es}</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{l.descripcion}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500">Ganas +10 XP por acierto, +2 por intentarlo, +3 por abrir una figura nueva y hasta +20 por una ronda perfecta. Meta diaria: {META_DIARIA_XP} XP.</p>
      </div>

      {/* Info Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cómo usar esta app
        </h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            ✅ <strong>Lecciones:</strong> Lee el contenido de cada capítulo y responde el quiz
            (necesitas 80% para avanzar).
          </p>
          <p>
            📚 <strong>Flashcards:</strong> Practica términos alemanes con el sistema Leitner
            (5 cajas de repetición espaciada).
          </p>
          <p>
            🎯 <strong>Mis errores:</strong> Revisa las preguntas que has fallado más
            frecuentemente.
          </p>
          <p>
            🏆 <strong>Exámenes:</strong> Simula el examen final con tiempo limite y
            preguntas proporcionales a cada capítulo.
          </p>
        </div>
      </div>
    </div>
  );
}
