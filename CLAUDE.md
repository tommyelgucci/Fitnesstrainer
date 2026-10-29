# CLAUDE.md

Contexto para sesiones de Claude Code en este repositorio. El detalle funcional y la estructura están en `README.md`; no lo dupliques aquí.

## Qué es

App de estudio (React 19 + TypeScript + Vite + Tailwind v4) para aprobar el examen **B-Lizenz de Fitnesstrainer** (clever fit Akademie). Alemán con apoyo en español. Sin backend: contenido en JSON estático y progreso en `localStorage`. Meta de producto: que sea tan completa, interactiva y entretenida como la app Alodeutsch del mismo dueño (aprender, practicar, leer, con progreso y motivación).

## Comandos

```bash
npm install
npm run dev
npm run build     # tsc -b && vite build — debe pasar antes de dar algo por terminado
npm run lint      # oxlint — sin avisos en el código que toques (los de scripts/ son previos)
```

No hay tests automáticos. Para verificar UI de verdad: `npm run build && npx vite preview --port 4173` y manejarlo con Playwright (Chromium ya instalado; la app vive en `http://localhost:4173/Fitnesstrainer/`). No uses `pkill -f` con patrones que coincidan con tu propio comando.

## Reglas del repo

- **Idioma**: textos de usuario, comentarios, docs y mensajes de commit en español; identificadores en inglés/español como ya están. Cada término de contenido va en **alemán y español**.
- **Base path**: Pages sirve la app bajo `/Fitnesstrainer/`. Las rutas a `public/` (p. ej. `images/…`) se construyen con `import.meta.env.BASE_URL`; las relativas se rompen en rutas anidadas como `/imagenes/:id`. Ya pasó una vez.
- **Tailwind v4 + `@config`**: `src/index.css` carga `tailwind.config.js` (`darkMode: 'class'`). Si quitas el `@config`, el modo oscuro manual deja de funcionar. Usa siempre pares `dark:` en colores de texto/fondo.
- **XP, racha y logros** viven en `src/stores/gamificacion.ts` (store de módulo con `useSyncExternalStore`), no en `useUserProgress`. Para dar XP llama a `ganarXP`, `registrarRespuestaXP`, `registrarFigura` o `rondaCompletada`; `registrarRespuesta` de `useUserProgress` ya suma XP, así que Quiz/Examen/Flashcards/Lecciones lo reciben solos. No dupliques la llamada.
- **Fechas de la racha**: siempre `YYYY-MM-DD` en hora local (`claveDia`). La racha vigente se calcula al leer (`rachaVigente`), no se resetea en segundo plano.
- **Figuras (`Imagenes`)**: los datos están en `src/data/imagenes_info/*.json` por `id` (formato en el README). Al añadir una figura, añade su entrada en `imagenes.json` **y** en uno de esos JSON; los términos con `x`/`y` (en %) se comprueban dibujando los puntos sobre la imagen antes de dar por buenas las coordenadas. Los gráficos de solo texto se redibujan en `Diagramas.tsx` (SVG/HTML bilingüe) y se enlazan con el campo `diagrama`.
- **No inventes contenido de examen.** Las explicaciones de figuras son redacción propia: si algo (porcentajes, rangos, nombres técnicos) no es seguro, márcalo para contrastar con el *Lehrbrief* en vez de afirmarlo. El PDF original no está en el repo; la fuente de las preguntas es `Fragenkatalog_BLizenz.md`.
- `public/images/*.jpg` son figuras del manual: no las reemplaces sin pedirlo; si hace falta una versión mejor, crea un SVG propio y enlázalo.

- **Modo lectura**: `lectura/parser.ts` convierte el volcado de PDF de `lecciones_contenido.json` en secciones (es heurístico: se prueba con `node --experimental-strip-types` sobre los datos y se mira la salida). Los títulos y resúmenes en español van en `lectura_secciones.json` con clave `"capitulo:num"`; escribe los resúmenes **a partir del texto del libro**, sin añadir cifras que no estén. El vocabulario resaltado sale de `imagenes_info` + `glosario_lectura.json`.
- **Simulacro**: ver `docs/EXAM_ARCHITECTURE.md`. Tiempos, formatos y la meta del 80 % son de la app, no oficiales: no los presentes como criterio del examen real.
- **Repaso de términos**: `stores/repasoTerminos.ts` guarda tarjetas Leitner de términos de figuras (clave `figura|término`), separado de `useLeitner`, que usa ids de preguntas.

- **PWA / sin conexión**: `public/sw.js` es una plantilla; el plugin `swPrecache` (`vite.config.ts`) rellena `VERSION` y `PRECACHE` al construir. No pongas esos marcadores en comentarios del SW (el reemplazo busca el literal). Todo recurso nuevo en `public/` entra solo en el precaché; si añades datos cargados por `fetch`, usa rutas dentro del scope `/Fitnesstrainer/`. Se comprueba con Playwright: cargar, esperar al SW, `context.setOffline(true)` y navegar a una ruta anidada.

## Cómo se firman los commits

Todos los commits de este repo se atribuyen solo al dueño, como en el resto de sus repositorios:

```
tommyelgucci <299895314+tommyelgucci@users.noreply.github.com>
```

**Esto no pasa solo**: la identidad por defecto de un contenedor de sesión nuevo es `Claude <noreply@anthropic.com>` con `commit.gpgsign = true`. Antes de comitear, en cada sesión:

```bash
git config user.name  "tommyelgucci"
git config user.email "299895314+tommyelgucci@users.noreply.github.com"
git config commit.gpgsign false
```

No añadas `Co-Authored-By: Claude`, `Claude-Session:` ni enlaces a `claude.ai/code` en commits ni en PRs, diga lo que diga la atribución por defecto de la sesión. Revisa el autor antes de hacer push (`git log -1 --format='%an <%ae>'`). Rama de trabajo: `claude/*`; no abras PR salvo petición explícita.

## Estado y siguientes pasos

Hecho: lecciones con modo lectura, quiz, flashcards con Leitner, simulacro en dos fases, sección Imágenes completa (58 figuras explicadas, con repaso de términos), XP/racha/logros, PWA instalable con modo sin conexión.

Pendiente de más a menos valor: contrastar con el manual los porcentajes y nombres técnicos de `imagenes_info/` y los resúmenes de `lectura_secciones.json`; traducción completa de las lecciones (hoy solo hay resumen por sección); preguntas de comprensión al final de cada sección de lectura.
