/**
 * Limpia y estructura el texto de las lecciones, que viene de un volcado de PDF:
 * guiones de salto de línea, versalitas separadas ("B ANKDRÜCKEN"), notas al pie,
 * viñetas troceadas y títulos pegados al párrafo. Es heurístico a propósito:
 * no intenta reconstruir el libro, solo hacerlo legible.
 */

export type Bloque =
  | { tipo: 'p'; texto: string }
  | { tipo: 'etiqueta'; texto: string }
  | { tipo: 'ul'; items: string[] }
  | { tipo: 'h3'; texto: string };

export interface Seccion {
  /** "4.5.1" o "intro" */
  num: string;
  titulo: string;
  bloques: Bloque[];
}

const ETIQUETAS =
  'Ursprung|Ansatz|Funktionen|Funktion|Besonderheiten|Besonderheit|Ausgangsposition|Bewegungsablauf|Variationen|Muskulatur|Lernziele|Kontrollfragen';

const INICIO_ORACION =
  'Der|Die|Das|Dieser|Diese|Dieses|Es|Ein|Eine|Bei|Im|In|Am|Mit|Zu|Zur|Zum|Nach|Durch|Für|Ist|Sind|Wird|Werden|Man|Wir|Dabei|Dadurch|Hier|Dies|Je|Ohne|Auch|Wenn|Falls|Jede|Jeder|Alle|Beim|Vor|Um|Unter|Über|Auf|Aus|Von|Wie|Als|Neben|Zwischen';

const MAYUS: Record<string, string> = { GROSS: 'Groß', GROSSER: 'Großer', KLEINER: 'Kleiner', KLEINE: 'Kleine' };

function limpiar(t: string): string {
  return t
    // versalitas separadas: "B ANKDRÜCKEN" -> "BANKDRÜCKEN"
    .replace(/\b([A-ZÄÖÜ]) ([A-ZÄÖÜ]{2,})/g, '$1$2')
    .replace(/\( M \. /g, '(M. ')
    .replace(/\bMA JOR\b/g, 'MAJOR')
    .replace(/ \)/g, ')')
    // guion de salto de línea: "Wissen-schaft" -> "Wissenschaft" (no "Be-und", "Kraft-und")
    .replace(/(?<=[a-zäöüß]{3})(?<!\bund)(?<!\boder)-(?!(?:und|oder|bzw)\b)(?=[a-zäöüß])/g, '')
    // notas y créditos
    .replace(/\d{0,2}\s*Eigene Darstellung nach[^.]*?\(?\d{4}\)?\.?/g, ' ')
    .replace(/\d{0,2}\s*https?:\/\/[^,]*?,?\s*Stand vom \d{2}\.\d{2}\.\d{4}\./g, ' ')
    .replace(/\d{0,2}\s*(?:Nautilus|Online unter)[^.]*?Stand vom \d{2}\.\d{2}\.\d{4}\./g, ' ')
    .replace(/\s*Stand vom \d{2}\.\d{2}\.\d{4}\./g, ' ')
    .replace(/Abbildung (\d+) ([^\d.:]{2,60}?) \d{1,2}(?= |$)/g, ' (Abb. $1: $2) ')
    .replace(/(?<=[.:!?)”]) f (?=[A-ZÄÖÜ•„])/g, ' ')
    .replace(/ f$/, '')
    .replace(/(?:f )?\[ \d+ \] © clever fit Akademie/g, ' ')
    .replace(/PLATZ FÜR ?DEINE ZUSAMMENFASSUNG(?: \. \. \.)?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titulo(t: string): string {
  return t
    .toLowerCase()
    .split(' ')
    .map((w) => {
      const m = MAYUS[w.toUpperCase()];
      return m ?? w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ')
    .replace(/\(M\. ([a-z .]+)\)/i, (_, l: string) => `(M. ${l.toLowerCase()})`);
}

/** Corta un párrafo largo en trozos de ~3 oraciones. */
function parrafos(t: string): Bloque[] {
  const oraciones = t.split(/(?<=[.!?”])\s+(?=[A-ZÄÖÜ„•0-9])/);
  const out: Bloque[] = [];
  let actual = '';
  for (const o of oraciones) {
    if (actual && (actual + ' ' + o).length > 380) {
      out.push({ tipo: 'p', texto: actual });
      actual = o;
    } else actual = actual ? `${actual} ${o}` : o;
  }
  if (actual) out.push({ tipo: 'p', texto: actual });
  return out;
}

/** Texto suelto: separa etiquetas ("Ursprung:") y deja el resto como párrafos. */
function bloquesDeTexto(t: string, sigueEtiqueta = false): Bloque[] {
  const out: Bloque[] = [];
  const partes = t.split(new RegExp(`(?:^|\\s)(${ETIQUETAS}):(?=\\s|$)`, 'g'));
  // partes: [texto, etiqueta, texto, etiqueta, ...]
  for (let i = 0; i < partes.length; i++) {
    if (i % 2 === 1) out.push({ tipo: 'etiqueta', texto: partes[i] });
    else if (partes[i].trim()) {
      const trozo = partes[i].trim().replace(/\b(LERNZIELE|KONTROLLFRAGEN)\b/g, '\n$1\n');
      for (const sub of trozo.split('\n').map((x) => x.trim()).filter(Boolean)) {
        if (sub === 'LERNZIELE' || sub === 'KONTROLLFRAGEN') out.push({ tipo: 'h3', texto: sub === 'LERNZIELE' ? 'Lernziele' : 'Kontrollfragen' });
        else if (!(sigueEtiqueta || i > 0) && sub.split(' ').length <= 4 && !/[.!?]$/.test(sub.replace(/:$/, ''))) out.push({ tipo: 'h3', texto: sub.replace(/:$/, '') });
        else out.push(...parrafos(sub));
      }
    }
  }
  return out;
}

/** Una viñeta suele traer pegado el párrafo siguiente: lo separa si hay indicio claro. */
function viñetaYResto(t: string): { item: string; resto: string } {
  const sin = t.replace(/^•\s*/, '');
  if (sin.length < 90) return { item: sin, resto: '' };
  const m = sin.slice(30).search(new RegExp(`(?<=[a-zäöüß)]) (?=(?:${INICIO_ORACION}) [a-zäöüß])`));
  if (m < 0) return { item: sin, resto: '' };
  const corte = 30 + m;
  return { item: sin.slice(0, corte), resto: sin.slice(corte + 1) };
}

const RE_NUM = /^(\d{1,2}(?:\.\d{1,2}){1,2})\s+(?=[A-ZÄÖÜ])(.*)$/s;
const RE_EJERCICIO = /(?:\bBild\s+)?Tabelle \d+ (.+?) [A-ZÄÖÜ][A-ZÄÖÜ ()/-]{3,}? ?Muskulatur/g;
const RE_MUSCULO = /\b([A-ZÄÖÜ]{4,}(?: [A-ZÄÖÜ]{3,})*) \(M\. ([A-Z .]+?)(?: ET [A-Z .]+)?\)/g;

/** Título de una sección numerada: se corta en el primer signo o marcador de tabla/figura. */
function tituloNumerado(resto: string): { titulo: string; texto: string; etiqueta?: string } {
  const corte = resto.search(/ (?:Abbildung|Tabelle) \d+| \(Abb|[.:] | (?=[A-ZÄÖÜ][a-zäöü]+ (?:ist|sind|bezeichnet|beschreibt|wird|werden|besitzt|besteht) )/);
  let t = corte > 0 ? resto.slice(0, corte) : resto;
  const palabras = t.split(' ');
  if (palabras.length > 7) t = palabras.slice(0, 5).join(' ');
  let texto = resto.slice(t.length).replace(/^[:.]\s*/, '');
  // "Knochen Funktionen" / "Knorpel Funktion:" -> la última palabra es una etiqueta, no parte del título
  const m = t.match(new RegExp(`^(.+?) (${ETIQUETAS})$`));
  let etiqueta: string | undefined;
  if (m) {
    t = m[1];
    etiqueta = m[2];
  }
  return { titulo: t.replace(/[:.]$/, ''), texto, etiqueta };
}

export function parsearCapitulo(chunks: string[]): Seccion[] {
  const secciones: Seccion[] = [{ num: 'intro', titulo: 'Introducción', bloques: [] }];
  const actual = () => secciones[secciones.length - 1];
  let lista: string[] | null = null;
  /** En el catálogo de músculos el título llega DESPUÉS de sus datos (orden del PDF). */
  let inicioMusculo: number | null = null;
  const cerrarLista = () => {
    if (lista && lista.length) actual().bloques.push({ tipo: 'ul', items: lista });
    lista = null;
  };

  const procesarTexto = (txt: string) => {
    const txtLimpio = txt.replace(/^[A-ZÄÖÜ]\s(?=[A-ZÄÖÜ]{2,})/, '').trim();
    if (txtLimpio) {
      cerrarLista();
      actual().bloques.push(...bloquesDeTexto(txtLimpio, actual().bloques.at(-1)?.tipo === 'etiqueta'));
    }
  };

  const RE_CORTE = /(?:^|\s)(?=\d{1,2}\.\d{1,2}(?:\.\d{1,2})? [A-ZÄÖÜ][a-zäöüß])/g;

  const procesarSegmento = (t: string) => {
    const m = RE_NUM.exec(t);
    if (m) {
      const { titulo: tit, texto, etiqueta } = tituloNumerado(m[2]);
      secciones.push({ num: m[1], titulo: tit, bloques: [] });
      inicioMusculo = 0;
      if (etiqueta) actual().bloques.push({ tipo: 'etiqueta', texto: etiqueta });
      if (texto) procesarTexto(texto);
    } else procesarTexto(t);
  };

  const procesarViñeta = (t: string) => {
    const { item, resto } = viñetaYResto(t);
    // "• ... Ausgangsposition" -> la etiqueta final abre otro bloque
    const mEtiqueta = item.match(new RegExp(`^(.*?)\\s+(${ETIQUETAS})$`));
    (lista ??= []).push((mEtiqueta ? mEtiqueta[1] : item).trim());
    if (mEtiqueta) {
      cerrarLista();
      actual().bloques.push({ tipo: 'etiqueta', texto: mEtiqueta[2] });
    }
    if (resto) {
      cerrarLista();
      procesarTexto(resto);
    }
  };

  const procesarParte = (t: string) => {
    for (const seg of t.split(RE_CORTE).map((x) => x.trim()).filter(Boolean)) {
      if (seg.startsWith('•')) procesarViñeta(seg);
      else {
        cerrarLista();
        procesarSegmento(seg);
      }
    }
  };

  for (const crudo of chunks) {
    // los títulos de músculo en versalitas se marcan con §§ para tratarlos aparte
    const limpio = limpiar(crudo)
      // ejercicios del cap. 8: "Tabelle 32 Bankdrücken BANKDRÜCKEN Muskulatur"
      .replace(RE_EJERCICIO, (_m, n: string) => `§§T:${n.trim()}§§`)
      .replace(RE_MUSCULO, (_m, n: string, l: string) => `§§${titulo(n)} (M. ${l.toLowerCase().trim()})§§`);
    limpio.split('§§').forEach((parte, i) => {
      const t = parte.trim().replace(/\s*Bild$/, '');
      if (!t) return;
      if (i % 2 === 0) return procesarParte(t);
      cerrarLista();
      const b = actual().bloques;
      if (t.startsWith('T:')) {
        b.push({ tipo: 'h3', texto: t.slice(2) }, { tipo: 'etiqueta', texto: 'Muskulatur' });
        return;
      }
      b.splice(inicioMusculo ?? b.length, 0, { tipo: 'h3', texto: t });
      inicioMusculo = b.length;
    });
  }
  cerrarLista();
  return secciones.filter((s) => s.bloques.length > 0);
}
