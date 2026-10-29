import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Image as ImageIcon, Search, Volume2, Sparkles, Dumbbell, BarChart3, Bone, RotateCcw } from 'lucide-react';
import capitulosData from '../../data/capitulos.json';
import { imagenes, tieneHotspots } from '../../data/imagenesInfo';
import type { Imagen } from '../../data/imagenesInfo';
import ImagenQuiz from './ImagenQuiz';
import { itemsDe } from './quizUtils';
import type { Item } from './quizUtils';
import type { Modo } from './quizUtils';
import { Diagrama } from './Diagramas';
import { hablarAleman } from './hablar';
import { claveTermino, estaPendiente, useRepasoTerminos } from '../../stores/repasoTerminos';
import { formatearTiempoProxRepaso } from '../../utils/leitner';

type Pestana = 'figuras' | 'glosario' | 'practica' | 'repaso';
type Filtro = 'todas' | Imagen['tipo'];

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'todas', texto: 'Todas' },
  { id: 'anatomia', texto: 'Anatomía' },
  { id: 'ejercicio', texto: 'Ejercicios' },
  { id: 'grafico', texto: 'Gráficos' },
  { id: 'tabla', texto: 'Tablas' },
];

const quitarTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const etiquetaCap = (id: string) => {
  const c = capitulosData.capitulos.find((x) => x.id === id);
  if (!c) return id;
  return `Cap. ${c.numero}${c.subtitulo ? `.${c.subtitulo.split('.')[1]}` : ''} – ${c.titulo_es}`;
};

function IconoTipo({ tipo }: { tipo: Imagen['tipo'] }) {
  const cls = 'h-3.5 w-3.5';
  if (tipo === 'ejercicio') return <Dumbbell className={cls} />;
  if (tipo === 'anatomia') return <Bone className={cls} />;
  return <BarChart3 className={cls} />;
}

function Tarjeta({ img }: { img: Imagen }) {
  const interactiva = tieneHotspots(img);
  return (
    <Link to={`/imagenes/${img.id}`} className="card flex flex-col gap-2 p-2 text-left transition-all hover:shadow-lg">
      <div className="relative">
        {img.diagrama ? (
          <div className="pointer-events-none aspect-square overflow-hidden rounded-lg bg-white dark:bg-gray-900">
            <div className="origin-top-left scale-[0.5]" style={{ width: '200%' }}>
              <Diagrama id={img.diagrama!} />
            </div>
          </div>
        ) : (
          <img src={img.archivo} alt={img.titulo_es} className="aspect-square w-full rounded-lg bg-white object-contain" loading="lazy" />
        )}
        <span className="absolute left-1 top-1 inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 shadow dark:bg-gray-900/90 dark:text-gray-200">
          <IconoTipo tipo={img.tipo} />
          {img.terminos.length}
        </span>
        {interactiva && (
          <span className="absolute right-1 top-1 inline-flex items-center gap-1 rounded-full bg-teal-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
            <Sparkles className="h-3 w-3" /> interactiva
          </span>
        )}
      </div>
      <div>
        <p className="line-clamp-2 text-xs font-semibold text-gray-900 dark:text-white">{img.titulo_de}</p>
        <p className="line-clamp-2 text-xs italic text-gray-600 dark:text-gray-400">{img.titulo_es}</p>
      </div>
    </Link>
  );
}

function Figuras() {
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [busqueda, setBusqueda] = useState('');

  const visibles = useMemo(() => {
    const q = quitarTildes(busqueda.trim());
    return imagenes.filter((img) => {
      if (filtro !== 'todas' && img.tipo !== filtro) return false;
      if (!q) return true;
      const texto = [img.titulo_de, img.titulo_es, ...img.terminos.flatMap((t) => [t.de, t.es])].join(' ');
      return quitarTildes(texto).includes(q);
    });
  }, [filtro, busqueda]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar un término o figura (alemán o español)…"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-3 py-1 text-sm ${filtro === f.id ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
            >
              {f.texto}
            </button>
          ))}
        </div>
      </div>

      {capitulosData.capitulos.map((cap) => {
        const imgs = visibles.filter((i) => i.capitulo_id === cap.id);
        if (imgs.length === 0) return null;
        return (
          <section key={cap.id} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {etiquetaCap(cap.id)}
              <span className="ml-2 text-xs font-normal text-gray-500">({imgs.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imgs.map((img) => <Tarjeta key={img.id} img={img} />)}
            </div>
          </section>
        );
      })}
      {visibles.length === 0 && <p className="text-center text-gray-500">Sin resultados para esa búsqueda.</p>}
    </div>
  );
}

function Glosario() {
  const [busqueda, setBusqueda] = useState('');

  const terminos = useMemo(() => {
    const mapa = new Map<string, { de: string; es: string; nota?: string; figuras: Imagen[] }>();
    for (const img of imagenes) {
      for (const t of img.terminos) {
        const clave = quitarTildes(t.de);
        const e = mapa.get(clave);
        if (e) {
          if (!e.figuras.includes(img)) e.figuras.push(img);
        } else {
          mapa.set(clave, { de: t.de, es: t.es, nota: t.nota, figuras: [img] });
        }
      }
    }
    return [...mapa.values()].sort((a, b) => a.de.localeCompare(b.de, 'de'));
  }, []);

  const q = quitarTildes(busqueda.trim());
  const lista = q ? terminos.filter((t) => quitarTildes(`${t.de} ${t.es} ${t.nota ?? ''}`).includes(q)) : terminos;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={`Buscar entre ${terminos.length} términos…`}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{lista.length} términos · alemán → español</p>
      <ul className="card divide-y divide-gray-200 p-0 dark:divide-gray-700">
        {lista.map((t) => (
          <li key={t.de} className="flex items-start gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">{t.de}</p>
              <p className="text-sm italic text-gray-600 dark:text-gray-400">{t.es}</p>
              {t.nota && <p className="text-sm text-gray-700 dark:text-gray-300">{t.nota}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {t.figuras.slice(0, 3).map((f, k) => (
                  <span key={f.id}>
                    {k > 0 && ' · '}
                    <Link to={`/imagenes/${f.id}`} className="text-teal-600 hover:underline dark:text-teal-400">{f.titulo_es}</Link>
                  </span>
                ))}
              </p>
            </div>
            <button onClick={() => hablarAleman(t.de)} aria-label={`Escuchar ${t.de}`} className="mt-1 text-teal-600 dark:text-teal-400">
              <Volume2 className="h-5 w-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Practica() {
  const [modo, setModo] = useState<Modo | null>(null);
  const [capitulo, setCapitulo] = useState('todos');

  const conImagenes = capitulosData.capitulos.filter((c) => imagenes.some((i) => i.capitulo_id === c.id));
  const lista = capitulo === 'todos' ? imagenes : imagenes.filter((i) => i.capitulo_id === capitulo);
  const items = useMemo(() => (modo ? itemsDe(lista, modo) : []), [modo, lista]);

  if (modo) return <ImagenQuiz key={`${modo}-${capitulo}`} items={items} modo={modo} onSalir={() => setModo(null)} />;

  return (
    <div className="space-y-4">
      <div className="card space-y-2">
        <label className="text-sm font-medium text-gray-900 dark:text-white" htmlFor="cap-practica">¿De qué capítulo?</label>
        <select
          id="cap-practica"
          value={capitulo}
          onChange={(e) => setCapitulo(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="todos">Todos los capítulos</option>
          {conImagenes.map((c) => <option key={c.id} value={c.id}>{etiquetaCap(c.id)}</option>)}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="card text-left transition-all hover:shadow-lg" onClick={() => setModo('puntos')}>
          <Sparkles className="mb-2 h-6 w-6 text-teal-600" />
          <p className="font-semibold text-gray-900 dark:text-white">Identificar en la imagen</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Te mostramos un punto sobre la figura y eliges cómo se llama en alemán.</p>
        </button>
        <button className="card text-left transition-all hover:shadow-lg" onClick={() => setModo('vocab')}>
          <Volume2 className="mb-2 h-6 w-6 text-teal-600" />
          <p className="font-semibold text-gray-900 dark:text-white">Vocabulario alemán → español</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Términos de todas las figuras, con pronunciación al responder.</p>
        </button>
      </div>
    </div>
  );
}

function Repaso() {
  const tarjetas = useRepasoTerminos();
  const [repasando, setRepasando] = useState(false);

  const porClave = useMemo(() => {
    const m = new Map<string, Item>();
    for (const it of itemsDe(imagenes, 'vocab')) m.set(claveTermino(it.img.id, it.t.de), it);
    return m;
  }, []);

  const conItem = tarjetas.flatMap((c) => {
    const it = porClave.get(c.pregunta_id);
    return it ? [{ c, it }] : [];
  });
  const pendientes = conItem.filter(({ c }) => estaPendiente(c));
  const porCaja = [1, 2, 3, 4, 5].map((n) => conItem.filter(({ c }) => c.numero_caja === n).length);
  const items = useMemo(
    () => (repasando ? pendientes.map((p) => p.it) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [repasando],
  );

  if (repasando) return <ImagenQuiz key="repaso" items={items} modo="mixto" onSalir={() => setRepasando(false)} />;

  if (conItem.length === 0) {
    return (
      <div className="card text-center">
        <RotateCcw className="mx-auto mb-2 h-8 w-8 text-teal-600" />
        <p className="font-semibold text-gray-900 dark:text-white">Todavía no tienes términos para repasar</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Cada término que falles en la pestaña Práctica (o en el quiz de una figura) llegará aquí y volverá a salir en el momento justo: al día siguiente, a los 3 días, a la semana…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <p className="text-gray-900 dark:text-white">
          <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{pendientes.length}</span>{' '}
          {pendientes.length === 1 ? 'término toca' : 'términos tocan'} hoy
        </p>
        <button className="btn btn-primary" disabled={pendientes.length === 0} onClick={() => setRepasando(true)}>
          {pendientes.length === 0 ? 'Nada pendiente por hoy' : `Repasar ahora (${pendientes.length})`}
        </button>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {porCaja.map((n, k) => (
            <div key={k} className="rounded-lg bg-gray-100 p-2 dark:bg-gray-700">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{n}</p>
              <p className="text-gray-600 dark:text-gray-400">{k === 4 ? 'Dominado' : `Caja ${k + 1}`}</p>
            </div>
          ))}
        </div>
      </div>

      <ul className="card divide-y divide-gray-200 p-0 dark:divide-gray-700">
        {[...conItem]
          .sort((a, b) => a.c.fecha_proximo_repaso - b.c.fecha_proximo_repaso)
          .map(({ c, it }) => (
            <li key={c.pregunta_id} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{it.t.de}</p>
                <p className="text-sm italic text-gray-600 dark:text-gray-400">{it.t.es}</p>
                <Link to={`/imagenes/${it.img.id}`} className="text-xs text-teal-600 hover:underline dark:text-teal-400">{it.img.titulo_es}</Link>
              </div>
              <div className="text-right text-xs text-gray-600 dark:text-gray-400">
                <p>Caja {c.numero_caja}</p>
                <p className={estaPendiente(c) ? 'font-semibold text-amber-700 dark:text-amber-400' : ''}>{formatearTiempoProxRepaso(c.fecha_proximo_repaso)}</p>
              </div>
              <button onClick={() => hablarAleman(it.t.de)} aria-label={`Escuchar ${it.t.de}`} className="text-teal-600 dark:text-teal-400">
                <Volume2 className="h-5 w-5" />
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default function Imagenes() {
  const [params] = useSearchParams();
  const inicial = params.get('tab');
  const [pestana, setPestana] = useState<Pestana>(inicial === 'repaso' ? 'repaso' : 'figuras');
  const pendientes = useRepasoTerminos().filter((t) => estaPendiente(t)).length;
  const tabs: { id: Pestana; texto: string }[] = [
    { id: 'figuras', texto: 'Figuras' },
    { id: 'glosario', texto: 'Glosario' },
    { id: 'practica', texto: 'Práctica' },
    { id: 'repaso', texto: pendientes > 0 ? `Repaso (${pendientes})` : 'Repaso' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="card bg-teal-50 dark:bg-teal-900/20">
        <div className="flex items-start gap-3">
          <ImageIcon className="h-6 w-6 flex-shrink-0 text-teal-600 dark:text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Imágenes</h1>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {imagenes.length} figuras del manual explicadas en español, con cada término en alemán y español, pronunciación,
              puntos interactivos y práctica. Toca una figura para estudiarla.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setPestana(t.id)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${pestana === t.id ? 'bg-white text-teal-700 shadow dark:bg-gray-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400'}`}
          >
            {t.texto}
          </button>
        ))}
      </div>

      {pestana === 'figuras' && <Figuras />}
      {pestana === 'glosario' && <Glosario />}
      {pestana === 'practica' && <Practica />}
      {pestana === 'repaso' && <Repaso />}
    </div>
  );
}
