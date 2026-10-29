# FitnessB Exam

App web para preparar el examen **B-Lizenz de Fitnesstrainer** (clever fit Akademie, *Lehrbrief B-Lizenz*, 3. Auflage). Está pensada para estudiar en alemán con apoyo en español: cada pregunta, término y figura aparece en los dos idiomas.

**Se puede instalar y usar sin conexión** (PWA). Funciona sin servidor: el contenido es JSON estático y todo el progreso vive en `localStorage` del navegador.

## Qué incluye

| Sección | Para qué sirve |
|---|---|
| **Dashboard** | Nivel, XP, racha de días, meta diaria, últimos 7 días y logros |
| **Lecciones** | Contenido por capítulo + preguntas (80 % para avanzar) y **modo lectura**: el texto del manual por secciones, con resumen en español, vocabulario tocable, audio y XP |
| **Flashcards** | Términos alemanes con repetición espaciada (Leitner, 5 cajas) |
| **Quiz** | Preguntas tipo test por capítulo |
| **Examen** | Simulacro cronometrado en dos fases (examen y corrección) con formatos completo/medio/rápido/errores, sesión que sobrevive a recargas e historial |
| **Imágenes** | 58 figuras del manual explicadas en español, con términos DE/ES, pronunciación, puntos interactivos, glosario, práctica y repaso Leitner de los términos fallados |

### Progreso y gamificación

- **XP**: +10 por acierto, +2 por intentarlo, +3 por abrir una figura nueva, +5 por completar una ronda de práctica de imágenes (+20 si es perfecta).
- **Niveles**: Neuling → Lehrling → Praktikant → Trainer → Profi → Meister.
- **Racha**: días seguidos con alguna actividad (se rompe si pasa un día entero sin estudiar).
- **Lectura**: +5 XP por sección marcada como leída. **Simulacro**: +10 XP al terminar (+30 si llega al 80 %).
- **Meta diaria**: 50 XP. **Logros**: definidos en `src/stores/gamificacion.ts`.

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # tsc -b && vite build  → dist/
npm run lint      # oxlint
npm run preview   # sirve el build (base /Fitnesstrainer/)
```

La app se publica en GitHub Pages con `.github/workflows/deploy.yml` en cada push a `main` (`ci.yml` compila los PR). Los cambios llegan a Pages al fusionarse en `main`; el workflow ya está activado en el repositorio.

### Modo sin conexión (PWA)

`public/sw.js` precachea todo el build; el plugin `swPrecache` de `vite.config.ts` le inyecta la lista de archivos y una versión derivada de su contenido, así que cada despliegue crea una caché nueva y borra las antiguas. Navegación: red primero (3 s) y, si falla, el `index.html` guardado. El estado (sin conexión, lista offline, versión nueva, instalar) vive en `src/stores/pwa.ts`. Solo se registra en producción; para probarlo: `npm run build && npx vite preview`. El audio en alemán usa las voces del dispositivo, así que sin conexión depende de las que tenga instaladas. Como vive bajo `/Fitnesstrainer/`, el `base` de Vite y el `basename` del router están configurados con ese prefijo; las rutas a `public/` deben usar `import.meta.env.BASE_URL`.

## Estructura

```
src/
  components/      Dashboard, Lecciones, Flashcards, Quiz, Exam, Imagenes, Leitner
  lectura/         parser.ts (limpia el texto de las lecciones), vocabulario.ts (resaltado)
  stores/          useUserProgress, useLeitner (hooks con localStorage)
                   repasoTerminos.ts (Leitner de términos de figuras), simulacros.ts
                   gamificacion.ts (XP, racha, logros: store a nivel de módulo)
  data/            preguntas.json, lecciones_contenido.json, capitulos.json
                   imagenes.json + imagenes_info/*.json  (ver abajo)
                   lectura_secciones.json (títulos y resumen en español por sección)
                   glosario_lectura.json (vocabulario extra del modo lectura)
  utils/leitner.ts algoritmo de cajas
public/images/     figuras del manual (JPG)
scripts/           parseMarkdown.*: genera preguntas a partir de Fragenkatalog_BLizenz.md
docs/              arquitectura y uso de cada módulo
```

### Datos de las figuras

`src/data/imagenes.json` lista las figuras (id, capítulo, archivo, título DE/ES). Todo lo demás está en `src/data/imagenes_info/*.json`, indexado por `id`, y `src/data/imagenesInfo.ts` lo une en un único array tipado:

```jsonc
"k3.6-02": {
  "tipo": "anatomia",          // anatomia | ejercicio | grafico | tabla
  "diagrama": "…",             // opcional: SVG propio de Diagramas.tsx en lugar del JPG
  "resumen_es": "…",
  "claves_es": ["…"],
  "terminos": [
    { "de": "Aorta", "es": "Aorta", "nota": "…", "x": 36.4, "y": 11 }  // x,y = % sobre la imagen (opcional)
  ],
  // solo ejercicios:
  "ejecucion_es": [], "musculos": [{ "de": "", "es": "", "rol": "principal" }], "errores_es": []
}
```

Los términos con `x`/`y` generan puntos tocables y entran en el modo de práctica «Identificar en la imagen».

## Contenido y fuentes

Las preguntas y respuestas proceden del *Lehrbrief B-Lizenz* (ver `Fragenkatalog_BLizenz.md`). Las explicaciones y traducciones de las figuras son redacción propia y conviene contrastarlas con el manual antes del examen.
