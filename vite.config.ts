import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * Rellena public/sw.js (ya copiado a dist) con la lista de archivos del build y una
 * versión derivada de su contenido: cada despliegue distinto genera una caché nueva.
 */
function swPrecache(): Plugin {
  let outDir = 'dist'
  const listar = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? listar(p) : [p]
    })
  return {
    name: 'sw-precache',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir
    },
    closeBundle() {
      const archivos = listar(outDir)
        .map((p) => relative(outDir, p).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && f !== '404.html')
        .sort()
      const hash = createHash('sha256')
      for (const f of archivos) hash.update(f).update(readFileSync(join(outDir, f)))
      const ruta = join(outDir, 'sw.js')
      const sw = readFileSync(ruta, 'utf8')
        .replace("'__VERSION__'", `'${hash.digest('hex').slice(0, 10)}'`)
        .replace('= __PRECACHE__;', `= ${JSON.stringify(['./', ...archivos])};`)
      writeFileSync(ruta, sw)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/Fitnesstrainer/',
  plugins: [react(), swPrecache()],
})
