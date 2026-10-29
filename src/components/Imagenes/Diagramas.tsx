import type { ReactNode } from 'react';

/**
 * Diagramas propios (SVG/HTML) que reemplazan figuras del manual que solo
 * traían texto en alemán. Cada etiqueta va en alemán (negrita) y español (cursiva).
 */

const T = 'fill-gray-900 dark:fill-gray-100';
const T2 = 'fill-gray-600 dark:fill-gray-400';

function Etiqueta({
  x,
  y,
  de,
  es,
  anchor = 'middle',
  size = 13,
}: {
  x: number;
  y: number;
  de: string;
  es?: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor}>
      <tspan className={`${T} font-semibold`} fontSize={size}>
        {de}
      </tspan>
      {es && (
        <tspan className={`${T2} italic`} fontSize={size - 2} x={x} dy={size + 1}>
          {es}
        </tspan>
      )}
    </text>
  );
}

function Marco({ children, vb, label }: { children: ReactNode; vb: string; label: string }) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900">
      <svg viewBox={vb} role="img" aria-label={label} className="w-full min-w-[560px]">
        {children}
      </svg>
    </div>
  );
}

/* ---------- Supercompensación (k4-01) ---------- */
function Supercompensacion() {
  return (
    <Marco vb="0 0 640 360" label="Curva de supercompensación">
      <defs>
        <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="fill-gray-500" />
        </marker>
      </defs>
      {/* sombras: déficit y ganancia */}
      <path d="M70 150 C120 195 160 235 200 240 C250 230 290 175 335 150 Z" className="fill-gray-300 dark:fill-gray-600" opacity="0.7" />
      <path d="M335 150 C370 112 400 100 430 108 C470 120 500 145 530 150 Z" className="fill-pink-400" opacity="0.8" />
      {/* ejes */}
      <line x1="70" y1="20" x2="70" y2="300" className="stroke-gray-500" strokeWidth="2" markerStart="url(#flecha)" />
      <line x1="70" y1="300" x2="620" y2="300" className="stroke-gray-500" strokeWidth="2" markerEnd="url(#flecha)" />
      <line x1="70" y1="150" x2="600" y2="150" className="stroke-gray-400" strokeDasharray="5 4" />
      {/* fases */}
      <line x1="200" y1="40" x2="200" y2="300" className="stroke-gray-400" strokeDasharray="4 4" />
      <line x1="335" y1="40" x2="335" y2="300" className="stroke-gray-400" strokeDasharray="4 4" />
      {/* curva */}
      <path
        d="M70 150 C120 195 160 235 200 240 C250 230 290 175 335 150 C370 112 400 100 430 108 C470 120 500 145 560 152"
        fill="none"
        className="stroke-gray-900 dark:stroke-gray-100"
        strokeWidth="3"
      />
      <Etiqueta x={135} y={40} de="Phase 1" es="Fase 1 · Carga" />
      <Etiqueta x={268} y={40} de="Phase 2" es="Fase 2 · Recuperación y supercomp." />
      <Etiqueta x={470} y={40} de="Phase 3" es="Fase 3 · Vuelta al nivel inicial" />
      <Etiqueta x={450} y={78} de="vergrößertes Reservoir" es="reserva ampliada" size={12} />
      <Etiqueta x={78} y={140} de="Leistungsniveau" es="nivel de rendimiento" anchor="start" size={12} />
      <Etiqueta x={140} y={268} de="Ermüdung" es="fatiga" size={12} />
      <Etiqueta x={268} y={268} de="Erholung" es="recuperación" size={12} />
      <Etiqueta x={500} y={188} de="Abnahme (nach 2–3 Tagen)" es="descenso si no hay nuevo estímulo" size={12} />
      <Etiqueta x={345} y={322} de="Trainingszeit (Tage, Wochen, Monate)" es="tiempo de entrenamiento" size={12} />
    </Marco>
  );
}

/* ---------- Pirámide de la fuerza (k4-02) ---------- */
function Caja({ x, y, w = 150, de, es, fuerte }: { x: number; y: number; w?: number; de: string; es: string; fuerte?: boolean }) {
  return (
    <g>
      <rect
        x={x - w / 2}
        y={y}
        width={w}
        height={50}
        rx={8}
        className={fuerte ? 'fill-teal-100 stroke-teal-600 dark:fill-teal-900 dark:stroke-teal-400' : 'fill-gray-50 stroke-gray-400 dark:fill-gray-800 dark:stroke-gray-500'}
        strokeWidth={fuerte ? 2.5 : 1.5}
      />
      <Etiqueta x={x} y={y + 21} de={de} es={es} size={12} />
    </g>
  );
}

function Kraftpyramide() {
  const l = 'stroke-gray-500';
  return (
    <Marco vb="0 0 640 320" label="Formas de fuerza">
      <line x1="320" y1="70" x2="320" y2="90" className={l} strokeWidth="2" />
      <line x1="160" y1="90" x2="480" y2="90" className={l} strokeWidth="2" />
      <line x1="160" y1="90" x2="160" y2="110" className={l} strokeWidth="2" />
      <line x1="480" y1="90" x2="480" y2="110" className={l} strokeWidth="2" />
      <line x1="160" y1="160" x2="160" y2="215" className={l} strokeWidth="2" />
      <line x1="480" y1="160" x2="480" y2="215" className={l} strokeWidth="2" />
      <line x1="95" y1="240" x2="545" y2="240" className={l} strokeWidth="2" strokeDasharray="4 3" />
      <Caja x={320} y={20} de="Kraftausdauer" es="Resistencia a la fuerza" fuerte />
      <Caja x={160} y={110} w={200} de="Maximalkraftausdauer" es="Resistencia a la fuerza máxima" />
      <Caja x={480} y={110} w={200} de="Schnellkraftausdauer" es="Resistencia a la fuerza rápida" />
      <Caja x={95} y={215} w={150} de="Maximalkraft" es="Fuerza máxima" fuerte />
      <Caja x={255} y={215} w={150} de="Explosivkraft" es="Fuerza explosiva" />
      <Caja x={415} y={215} w={150} de="Startkraft" es="Fuerza de arranque" />
      <Caja x={560} y={215} w={130} de="Schnellkraft" es="Fuerza rápida" fuerte />
    </Marco>
  );
}

/* ---------- Pirámide de repeticiones (k5-7-01) ---------- */
const FILAS_WDH = [
  { w: 1, p: 100, es: '1 repetición' },
  { w: 3, p: 90, es: '3 repeticiones' },
  { w: 6, p: 80, es: '6 repeticiones' },
  { w: 9, p: 70, es: '9 repeticiones' },
  { w: 12, p: 60, es: '12 repeticiones' },
  { w: 15, p: 50, es: '15 repeticiones' },
  { w: 20, p: 40, es: '20 repeticiones' },
  { w: 25, p: 30, es: '25 repeticiones' },
];

function Banda({ i, n, h0, top, base, cx, color }: { i: number; n: number; h0: number; top: number; base: number; cx: number; color: string }) {
  const y1 = top + i * h0;
  const y2 = y1 + h0;
  const half = (y: number) => ((y - top) / (n * h0)) * (base / 2);
  return (
    <polygon
      points={`${cx - half(y1)},${y1} ${cx + half(y1)},${y1} ${cx + half(y2)},${y2} ${cx - half(y2)},${y2}`}
      fill={color}
      stroke="white"
      strokeWidth="2"
    />
  );
}

function PiramideWdh() {
  const n = FILAS_WDH.length;
  const h0 = 38;
  return (
    <Marco vb="0 0 640 340" label="Pirámide de fuerza máxima por repeticiones">
      {FILAS_WDH.map((f, i) => (
        <g key={f.w}>
          <Banda i={i} n={n} h0={h0} top={15} base={250} cx={140} color={`hsl(${8 + i * 24} 70% 55%)`} />
          <line x1={250} y1={15 + i * h0 + h0 / 2} x2={290} y2={15 + i * h0 + h0 / 2} className="stroke-gray-400" strokeDasharray="3 3" />
          <Etiqueta x={300} y={15 + i * h0 + 15} de={`${f.w} Wdh. = ${f.p} %`} es={f.es} anchor="start" size={13} />
        </g>
      ))}
    </Marco>
  );
}

/* ---------- Pirámide de duración (k5-7-02) ---------- */
const FILAS_DAUER = [
  { t: '1–5 s', p: '100 %', de: 'Maximalkrafttraining', es: 'Fuerza máxima' },
  { t: '5–15 s', p: '90–95 %', de: 'Intramuskuläres Koordinationstraining', es: 'Coordinación intramuscular' },
  { t: '15–40 s', p: '70–90 %', de: 'Hypertrophietraining', es: 'Hipertrofia (crecimiento muscular)' },
  { t: '40–60 s', p: '50–70 %', de: 'Kraftausdauertraining', es: 'Resistencia a la fuerza' },
];

function PiramideDauer() {
  const n = FILAS_DAUER.length;
  const h0 = 72;
  return (
    <Marco vb="0 0 640 320" label="Pirámide de fuerza máxima por duración">
      {FILAS_DAUER.map((f, i) => (
        <g key={f.t}>
          <Banda i={i} n={n} h0={h0} top={15} base={250} cx={140} color={`hsl(${8 + i * 40} 70% 55%)`} />
          <line x1={250} y1={15 + i * h0 + h0 / 2} x2={290} y2={15 + i * h0 + h0 / 2} className="stroke-gray-400" strokeDasharray="3 3" />
          <text x={300} y={15 + i * h0 + 22}>
            <tspan className={`${T} font-semibold`} fontSize="13">{f.t} · {f.p}</tspan>
            <tspan className={`${T} font-semibold`} fontSize="12" x={300} dy={16}>{f.de}</tspan>
            <tspan className={`${T2} italic`} fontSize="11" x={300} dy={15}>{f.es}</tspan>
          </text>
        </g>
      ))}
    </Marco>
  );
}

/* ---------- Umbrales de lactato (k5-7-05) ---------- */
function Laktat() {
  return (
    <Marco vb="0 0 640 340" label="Curva de lactato con umbrales">
      <rect x="70" y="200" width="540" height="100" className="fill-green-200 dark:fill-green-900" opacity="0.5" />
      <rect x="70" y="140" width="540" height="60" className="fill-yellow-200 dark:fill-yellow-800" opacity="0.5" />
      <rect x="70" y="20" width="540" height="120" className="fill-red-200 dark:fill-red-900" opacity="0.4" />
      <line x1="70" y1="20" x2="70" y2="300" className="stroke-gray-500" strokeWidth="2" />
      <line x1="70" y1="300" x2="610" y2="300" className="stroke-gray-500" strokeWidth="2" />
      <line x1="70" y1="200" x2="610" y2="200" className="stroke-gray-500" strokeDasharray="5 4" />
      <line x1="70" y1="140" x2="610" y2="140" className="stroke-gray-500" strokeDasharray="5 4" />
      <text x="62" y="204" textAnchor="end" className={T} fontSize="12">2</text>
      <text x="62" y="144" textAnchor="end" className={T} fontSize="12">4</text>
      <Etiqueta x={62} y={14} de="Laktat [mmol/l]" es="lactato" anchor="start" size={12} />
      <Etiqueta x={610} y={322} de="Intensität (m/s)" es="intensidad (velocidad)" anchor="end" size={12} />
      <path d="M70 262 C200 258 300 245 360 190 S480 70 540 24" fill="none" className="stroke-gray-900 dark:stroke-gray-100" strokeWidth="3" />
      <Etiqueta x={200} y={282} de="dominant aerobe Energiegewinnung" es="energía predominantemente aeróbica (< 2 mmol/l)" size={12} />
      <Etiqueta x={450} y={178} de="aerob-anaerober Übergang" es="transición aeróbica-anaeróbica (2–4)" size={12} />
      <Etiqueta x={170} y={80} de="dominant anaerobe Energiegewinnung" es="energía predominantemente anaeróbica (> 4 mmol/l)" size={12} />
    </Marco>
  );
}

/* ---------- Gráfico circular de comunicación (k2-01) ---------- */
function Kommunikation() {
  const partes = [
    { v: 55, c: '#84cc16', de: 'Körpersprache', es: 'Lenguaje corporal' },
    { v: 38, c: '#15803d', de: 'Stimme', es: 'Voz' },
    { v: 7, c: '#9ca3af', de: 'Inhalt', es: 'Contenido' },
  ];
  let acc = 0;
  const cx = 160;
  const cy = 150;
  const r = 110;
  const punto = (pct: number) => {
    const a = (pct / 100) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  return (
    <Marco vb="0 0 640 300" label="Gráfico circular de comunicación">
      {partes.map((p) => {
        const [x1, y1] = punto(acc);
        acc += p.v;
        const [x2, y2] = punto(acc);
        const mid = punto(acc - p.v / 2);
        return (
          <g key={p.de}>
            <path d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${p.v > 50 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={p.c} stroke="white" strokeWidth="2" />
            <text x={cx + (mid[0] - cx) * 0.6} y={cy + (mid[1] - cy) * 0.6 + 5} textAnchor="middle" fill="white" fontWeight="700" fontSize="16" stroke="rgba(0,0,0,.35)" strokeWidth="0.5">{p.v} %</text>
          </g>
        );
      })}
      {partes.map((p, i) => (
        <g key={p.de}>
          <rect x={350} y={80 + i * 60} width={22} height={22} rx={4} fill={p.c} />
          <Etiqueta x={384} y={96 + i * 60} de={p.de} es={`${p.es} (${p.v} %)`} anchor="start" size={15} />
        </g>
      ))}
    </Marco>
  );
}

/* ---------- Tablas de Borg ---------- */
const BORG = [
  [6, 'überhaupt keine Anstrengung', 'Ningún esfuerzo', '20 %'],
  [7, 'extrem leicht', 'Extremadamente fácil', '30 %'],
  [8, '', '', '40 %'],
  [9, 'sehr leicht', 'Muy fácil', '50 %'],
  [10, '', '', '55 %'],
  [11, 'leicht', 'Fácil', '60 %'],
  [12, 'optimaler Trainingsbereich', 'Zona de entrenamiento óptima', '65 %'],
  [13, 'etwas schwer', 'Algo difícil', '70 %'],
  [14, '', '', '75 %'],
  [15, 'schwer', 'Difícil', '80 %'],
  [16, '', '', '85 %'],
  [17, 'sehr schwer', 'Muy difícil', '90 %'],
  [18, '', '', '95 %'],
  [19, 'extrem schwer', 'Extremadamente difícil', '100 %'],
  [20, 'größtmögliche Anstrengung', 'Máximo esfuerzo posible (sobrecarga)', 'Überlastung'],
] as const;

const colorBorg = (v: number) =>
  v <= 10
    ? 'bg-green-100 dark:bg-green-900/40'
    : v <= 15
      ? 'bg-yellow-100 dark:bg-yellow-900/40'
      : 'bg-red-100 dark:bg-red-900/40';

function Borg() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left dark:bg-gray-700">
            <th className="p-2">Wert<br /><span className="font-normal italic text-gray-500">valor</span></th>
            <th className="p-2">Anstrengungsgrad<br /><span className="font-normal italic text-gray-500">grado de esfuerzo</span></th>
            <th className="p-2">% max.<br /><span className="font-normal italic text-gray-500">% del máximo</span></th>
            <th className="p-2">≈ Puls<br /><span className="font-normal italic text-gray-500">≈ lat/min</span></th>
          </tr>
        </thead>
        <tbody>
          {BORG.map(([v, de, es, pct]) => (
            <tr key={v} className={colorBorg(v)}>
              <td className="p-2 font-bold text-gray-900 dark:text-white">{v}</td>
              <td className="p-2 text-gray-900 dark:text-gray-100">
                {de ? <><span className="font-semibold">{de}</span><br /><span className="italic text-gray-600 dark:text-gray-400">{es}</span></> : <span className="text-gray-400">—</span>}
              </td>
              <td className="p-2 text-gray-900 dark:text-gray-100">{pct}</td>
              <td className="p-2 text-gray-900 dark:text-gray-100">{v * 10}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CR10 = [
  [0, 'Keine Anstrengung', 'Kein Schmerz', 'Keine Atemnot', 'Ningún esfuerzo', 'Ningún dolor', 'Ninguna falta de aire'],
  [1, 'Sehr leichte Anstrengung', 'Sehr leichter Schmerz', 'Sehr leichte Atemnot', 'Esfuerzo muy ligero', 'Dolor muy leve', 'Falta de aire muy leve'],
  [2, 'Leichte Anstrengung', 'Leichter Schmerz', 'Leichte Atemnot', 'Esfuerzo ligero', 'Dolor leve', 'Falta de aire leve'],
  [3, 'Mäßige Anstrengung', 'Mäßiger Schmerz', 'Mäßige Atemnot', 'Esfuerzo moderado', 'Dolor moderado', 'Falta de aire moderada'],
  [4, 'Etwas anstrengend', 'Etwas schmerzhaft', 'Etwas Atemnot', 'Algo agotador', 'Algo doloroso', 'Algo de falta de aire'],
  [5, 'Ziemlich anstrengend', 'Ziemlich schmerzhaft', 'Ziemliche Atemnot', 'Bastante agotador', 'Bastante doloroso', 'Bastante falta de aire'],
  [6, 'Ziemlich schwer anstrengend', 'Ziemlich starke Schmerzen', 'Ziemlich starke Atemnot', 'Bastante duro', 'Dolor bastante fuerte', 'Falta de aire bastante fuerte'],
  [7, 'Sehr anstrengend', 'Starke Schmerzen', 'Starke Atemnot', 'Muy agotador', 'Dolor fuerte', 'Falta de aire fuerte'],
  [8, 'Sehr schwer anstrengend', 'Sehr starke Schmerzen', 'Sehr starke Atemnot', 'Muy duro', 'Dolor muy fuerte', 'Falta de aire muy fuerte'],
  [9, 'Sehr, sehr anstrengend', 'Sehr, sehr starke Schmerzen', 'Sehr, sehr starke Atemnot', 'Muy, muy agotador', 'Dolor muy, muy fuerte', 'Falta de aire muy, muy fuerte'],
  [10, 'Maximale Anstrengung', 'Stärkstmöglicher Schmerz', 'Stärkstmögliche Atemnot', 'Esfuerzo máximo', 'Dolor máximo imaginable', 'Falta de aire máxima'],
] as const;

const colorCr = (v: number) =>
  v <= 3 ? 'bg-green-100 dark:bg-green-900/40' : v <= 6 ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-orange-100 dark:bg-red-900/40';

function BorgCr10() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left dark:bg-gray-700">
            <th className="p-2">Wert<br /><span className="font-normal italic text-gray-500">valor</span></th>
            <th className="p-2">Anstrengung<br /><span className="font-normal italic text-gray-500">esfuerzo</span></th>
            <th className="p-2">Schmerz<br /><span className="font-normal italic text-gray-500">dolor</span></th>
            <th className="p-2">Dyspnoe<br /><span className="font-normal italic text-gray-500">falta de aire</span></th>
          </tr>
        </thead>
        <tbody>
          {CR10.map(([v, a, s, d, aes, ses, des]) => (
            <tr key={v} className={colorCr(v)}>
              <td className="p-2 font-bold text-gray-900 dark:text-white">{v}</td>
              {[
                [a, aes],
                [s, ses],
                [d, des],
              ].map(([de, es]) => (
                <td key={de} className="p-2 text-gray-900 dark:text-gray-100">
                  <span className="font-semibold">{de}</span>
                  <br />
                  <span className="italic text-gray-600 dark:text-gray-400">{es}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DIAGRAMAS: Record<string, () => ReactNode> = {
  kommunikation: Kommunikation,
  supercompensacion: Supercompensacion,
  kraftpyramide: Kraftpyramide,
  pyramide_wdh: PiramideWdh,
  pyramide_dauer: PiramideDauer,
  laktatschwellen: Laktat,
  borg_6_20: Borg,
  borg_cr10: BorgCr10,
};

export function Diagrama({ id }: { id: string }) {
  const C = DIAGRAMAS[id];
  return C ? <C /> : null;
}

