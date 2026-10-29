import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Languages, Square, Type, Volume2, X } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import leccionesContenido from '../../data/lecciones_contenido.json';
import metaSecciones from '../../data/lectura_secciones.json';
import { imagenes } from '../../data/imagenesInfo';
import type { Imagen } from '../../data/imagenesInfo';
import { parsearCapitulo } from '../../lectura/parser';
import type { Bloque, Seccion } from '../../lectura/parser';
import { resaltar } from '../../lectura/vocabulario';
import type { EntradaVocab } from '../../lectura/vocabulario';
import { marcarSeccionLeida, useGamificacion } from '../../stores/gamificacion';
import { responderTermino } from '../../stores/repasoTerminos';
import { hablarAleman } from '../Imagenes/hablar';
import Comprobacion from './Comprobacion';

interface MetaSeccion {
  de: string;
  es: string;
  resumen_es: string[];
}
const META = metaSecciones as Record<string, MetaSeccion>;
const CONTENIDO = leccionesContenido as Record<string, string[]>;

const TAMAÑOS = ['text-sm', 'text-base', 'text-lg'];
const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Texto plano de una sección (para audio y para buscar figuras relacionadas). */
function textoDe(s: Seccion): string {
  return s.bloques.map((b) => (b.tipo === 'ul' ? b.items.join('. ') : b.texto)).join('. ');
}

/** Lee en voz alta, párrafo a párrafo, con la voz alemana del navegador. */
function leerSeccion(s: Seccion) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const trozos = s.bloques.flatMap((b) => (b.tipo === 'ul' ? b.items : [b.texto])).filter((t) => t.length > 2);
  for (const t of trozos) {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'de-DE';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
}

function figurasRelacionadas(cap: string, s: Seccion): Imagen[] {
  const texto = norm(textoDe(s));
  const titulosH3 = s.bloques.filter((b): b is Extract<Bloque, { tipo: 'h3' }> => b.tipo === 'h3').map((b) => norm(b.texto));
  return imagenes
    .filter((i) => i.capitulo_id === cap)
    .map((i) => {
      const t = norm(i.titulo_de);
      const porTitulo = titulosH3.some((h) => h && (t.startsWith(h) || h.startsWith(t)));
      const aciertos = i.terminos.filter((x) => {
        const base = norm(x.de.replace(/\s*\(.*?\)/g, ''));
        return base.length >= 7 && texto.includes(base);
      }).length;
      return { i, puntos: (porTitulo ? 10 : 0) + aciertos };
    })
    .filter((x) => x.puntos >= 2)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 4)
    .map((x) => x.i);
}

function Texto({
  texto,
  vistos,
  resaltarVocab,
  onTermino,
}: {
  texto: string;
  vistos: Set<string>;
  resaltarVocab: boolean;
  onTermino: (e: EntradaVocab) => void;
}) {
  if (!resaltarVocab) return <>{texto}</>;
  return (
    <>
      {resaltar(texto, vistos).map((t, i) =>
        typeof t === 'string' ? (
          t
        ) : (
          <button
            key={i}
            type="button"
            onClick={() => onTermino(t.entrada)}
            className="rounded bg-teal-100 px-0.5 font-medium text-teal-900 underline decoration-dotted underline-offset-2 hover:bg-teal-200 dark:bg-teal-900/50 dark:text-teal-200"
          >
            {t.texto}
          </button>
        ),
      )}
    </>
  );
}

export default function LeccionLectura() {
  const { capitulo_id } = useParams<{ capitulo_id: string }>();
  const navigate = useNavigate();
  const gam = useGamificacion();
  const [idx, setIdx] = useState(0);
  const [tam, setTam] = useState(1);
  const [vocab, setVocab] = useState(true);
  const [esAbierto, setEsAbierto] = useState(true);
  const [termino, setTermino] = useState<EntradaVocab | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [hablando, setHablando] = useState(false);

  const capitulo = capitulosData.capitulos.find((c) => c.id === capitulo_id);
  const secciones = useMemo(() => (capitulo_id && CONTENIDO[capitulo_id] ? parsearCapitulo(CONTENIDO[capitulo_id]) : []), [capitulo_id]);
  const seccion = secciones[idx];

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setTermino(null);
    return () => window.speechSynthesis?.cancel();
  }, [idx, capitulo_id]);

  if (!capitulo || !capitulo_id || secciones.length === 0) {
    return (
      <div className="mx-auto max-w-2xl card text-center">
        <p className="text-gray-700 dark:text-gray-300">No hay lección de lectura para este capítulo.</p>
        <Link to="/lecciones" className="btn btn-primary mt-3">Volver a lecciones</Link>
      </div>
    );
  }

  const clave = (s: Seccion) => `${capitulo_id}:${s.num}`;
  const leidas = secciones.filter((s) => gam.seccionesLeidas.includes(clave(s))).length;
  const meta = META[clave(seccion)];
  const leida = gam.seccionesLeidas.includes(clave(seccion));
  const vistos = new Set<string>();
  const figuras = figurasRelacionadas(capitulo_id, seccion);
  const esUltima = idx === secciones.length - 1;

  const tituloDe = meta?.de ?? seccion.titulo;
  const cls = TAMAÑOS[tam];

  const txt = (t: string) => <Texto texto={t} vistos={vistos} resaltarVocab={vocab} onTermino={(e) => { setTermino(e); setGuardado(false); }} />;

  const ir = (n: number) => {
    window.speechSynthesis?.cancel();
    setHablando(false);
    setIdx(n);
  };

  const terminar = () => {
    marcarSeccionLeida(clave(seccion));
    if (!esUltima) ir(idx + 1);
  };

  const guardarParaRepaso = (e: EntradaVocab) => {
    if (e.figuraId && e.terminoDe) {
      responderTermino(e.figuraId, e.terminoDe, false);
      setGuardado(true);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-24">
      <div className="flex items-center justify-between text-sm">
        <button onClick={() => navigate(`/lecciones/${capitulo_id}`)} className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Capítulo {capitulo.numero}
          {capitulo.subtitulo ? `.${capitulo.subtitulo.split('.')[1]}` : ''}
        </button>
        <span className="text-gray-600 dark:text-gray-400">{leidas}/{secciones.length} leídas</span>
      </div>

      <div className="h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
        <div className="h-full bg-green-500 transition-all" style={{ width: `${(leidas / secciones.length) * 100}%` }} />
      </div>

      <div className="card space-y-3">
        <label className="sr-only" htmlFor="sec">Sección</label>
        <select
          id="sec"
          value={idx}
          onChange={(e) => ir(Number(e.target.value))}
          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {secciones.map((s, i) => (
            <option key={clave(s) + i} value={i}>
              {gam.seccionesLeidas.includes(clave(s)) ? '✓ ' : ''}
              {s.num === 'intro' ? '' : `${s.num} · `}
              {META[clave(s)]?.de ?? s.titulo}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button className="btn btn-secondary" onClick={() => setTam((t) => (t + 1) % TAMAÑOS.length)} aria-label="Cambiar tamaño de letra">
            <Type className="mr-1 h-4 w-4" /> Letra
          </button>
          <button className={`btn ${vocab ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setVocab((v) => !v)}>
            <Languages className="mr-1 h-4 w-4" /> Vocabulario {vocab ? 'on' : 'off'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (hablando) {
                window.speechSynthesis.cancel();
                setHablando(false);
              } else {
                leerSeccion(seccion);
                setHablando(true);
              }
            }}
          >
            {hablando ? <Square className="mr-1 h-4 w-4" /> : <Volume2 className="mr-1 h-4 w-4" />}
            {hablando ? 'Parar' : 'Escuchar'}
          </button>
        </div>
      </div>

      <article className="space-y-4">
        <header>
          {seccion.num !== 'intro' && <p className="text-xs uppercase tracking-wide text-gray-500">Sección {seccion.num}</p>}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tituloDe}</h1>
          {meta && <p className="italic text-gray-600 dark:text-gray-400">{meta.es}</p>}
        </header>

        {meta && (
          <div className="card border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setEsAbierto((v) => !v)}>
              <span className="font-semibold text-gray-900 dark:text-white">En español</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{esAbierto ? 'ocultar' : 'mostrar'}</span>
            </button>
            {esAbierto && (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-gray-800 dark:text-gray-200">
                {meta.resumen_es.map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="card space-y-3 leading-relaxed text-gray-900 dark:text-gray-100">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Texto original (alemán)</p>
          {seccion.bloques.map((b, i) => {
            if (b.tipo === 'h3') {
              const fig = figuras.find((f) => norm(f.titulo_de).startsWith(norm(b.texto)) || norm(b.texto).startsWith(norm(f.titulo_de)));
              return (
                <h3 key={i} className="flex items-center gap-3 pt-2 text-lg font-semibold">
                  {fig && (
                    <Link to={`/imagenes/${fig.id}`} aria-label={`Ver figura: ${fig.titulo_es}`}>
                      <img src={fig.archivo} alt="" className="h-12 w-12 rounded bg-white object-contain" />
                    </Link>
                  )}
                  {b.texto}
                </h3>
              );
            }
            if (b.tipo === 'etiqueta') return <p key={i} className="pt-1 text-sm font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400">{b.texto}</p>;
            if (b.tipo === 'ul') {
              return (
                <ul key={i} className={`list-disc space-y-1 pl-5 ${cls}`}>
                  {b.items.map((it, k) => <li key={k}>{txt(it)}</li>)}
                </ul>
              );
            }
            return <p key={i} className={cls}>{txt(b.texto)}</p>;
          })}
        </div>

        {figuras.length > 0 && (
          <div className="card">
            <p className="mb-2 font-semibold text-gray-900 dark:text-white">Figuras relacionadas</p>
            <div className="flex gap-3 overflow-x-auto">
              {figuras.map((f) => (
                <Link key={f.id} to={`/imagenes/${f.id}`} className="w-28 flex-shrink-0 text-center">
                  <img src={f.archivo} alt={f.titulo_es} className="h-24 w-28 rounded bg-white object-contain" loading="lazy" />
                  <span className="mt-1 block text-xs text-gray-700 dark:text-gray-300">{f.titulo_es}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Comprobacion key={clave(seccion)} clave={clave(seccion)} />

      <div className="flex items-center justify-between gap-2">
        <button className="btn btn-secondary" disabled={idx === 0} onClick={() => ir(idx - 1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Anterior
        </button>
        {leida ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-400"><CheckCircle2 className="h-5 w-5" /> Leída</span>
        ) : (
          <button className="btn btn-success" onClick={terminar}>
            <BookOpenCheck className="mr-1 h-4 w-4" /> Marcar como leída (+5 XP)
          </button>
        )}
        <button className="btn btn-secondary" disabled={esUltima} onClick={() => ir(idx + 1)}>
          Siguiente <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>

      {termino && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex max-w-3xl items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                {termino.de}
                <button onClick={() => hablarAleman(termino.de)} aria-label="Escuchar en alemán" className="text-teal-600 dark:text-teal-400"><Volume2 className="h-5 w-5" /></button>
              </p>
              <p className="italic text-gray-700 dark:text-gray-300">{termino.es}</p>
              {termino.nota && <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{termino.nota}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {termino.figuraId && (
                  <>
                    <Link to={`/imagenes/${termino.figuraId}`} className="btn btn-secondary">Ver figura</Link>
                    <button className="btn btn-secondary" disabled={guardado} onClick={() => guardarParaRepaso(termino)}>
                      {guardado ? '✓ Guardado para repaso' : 'Guardar para repasar'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => setTermino(null)} aria-label="Cerrar" className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
