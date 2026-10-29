import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { nivelDe, rachaVigente, useGamificacion } from '../stores/gamificacion';

/** Racha + XP en la barra superior. */
export default function ChipProgreso() {
  const e = useGamificacion();
  const racha = rachaVigente(e);
  return (
    <Link
      to="/"
      className="flex flex-shrink-0 items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      aria-label={`Racha ${racha} días, ${e.xp} XP`}
    >
      <span className="flex items-center gap-0.5">
        <Flame className={`h-4 w-4 ${racha > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
        {racha}
      </span>
      <span>{e.xp} XP</span>
      <span className="hidden sm:inline">· Nv.{nivelDe(e.xp).numero}</span>
    </Link>
  );
}
