import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCapituloId(questionNum) {
  const parts = questionNum.split('.');
  const mainNum = parseInt(parts[0]);

  if (mainNum === 3 && parts[1]) {
    const subNum = parseInt(parts[1]);
    const mapping = { 1: 'k3', 2: 'k3.2', 3: 'k3.3', 4: 'k3.4', 5: 'k3.5', 6: 'k3.6', 7: 'k3.7' };
    return mapping[subNum] || 'k3.5';
  }

  const mapping = {
    2: 'k2', 4: 'k4', 5: 'k5', 6: 'k6', 7: 'k7', 8: 'k8',
    9: 'k9', 10: 'k10', 11: 'k11', 12: 'k12', 13: 'k13', 14: 'k14',
  };

  return mapping[mainNum] || 'k2';
}

function extractTerminos(text) {
  const terminos = [];
  const seen = new Set();
  const terminoPattern = /\*\*([A-Z][a-z\s\-äöüß]+?(?:\s+[a-z]+)*)\*\*/g;
  let match;
  while ((match = terminoPattern.exec(text)) !== null) {
    const term = match[1].trim();
    if (term.length > 2 && !seen.has(term) && term.length < 50) {
      terminos.push(term);
      seen.add(term);
    }
  }
  return terminos.slice(0, 8);
}

function cleanText(text) {
  return text
    .replace(/^>\s*/gm, '')
    .replace(/\*\*/g, '')
    .trim();
}

function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const preguntas = [];

  let i = 0;
  let index = 1;

  while (i < lines.length) {
    const line = lines[i];

    // Buscar línea de pregunta
    const preguntaMatch = line.match(/^\*\*F\s+([\d.]+)\s+—\s+(.+?)\*\*(.*)$/);
    if (!preguntaMatch) {
      i++;
      continue;
    }

    const numeroQuestion = preguntaMatch[1];
    let preguntaDe = preguntaMatch[2].trim();
    const trailing = preguntaMatch[3];

    // Remover *(KONTROLLFRAGE...)* si existe
    preguntaDe = preguntaDe.replace(/\*\s*\(.*?\)\*?$/, '').trim();

    // Buscar ✅ **Antwort** en próximas líneas
    let respuestaDe = '';
    let respuestaIdx = -1;
    for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
      if (lines[j].includes('✅') && lines[j].includes('Antwort')) {
        respuestaIdx = j;
        break;
      }
    }

    if (respuestaIdx === -1) {
      i++;
      continue;
    }

    // Leer respuesta hasta 🇪🇸
    let explicacionIdx = -1;
    const respuestaLines = [];

    for (let j = respuestaIdx + 1; j < Math.min(respuestaIdx + 25, lines.length); j++) {
      const checkLine = lines[j];
      if (checkLine.includes('🇪🇸')) {
        explicacionIdx = j;
        break;
      }
      if (checkLine.trim()) {
        respuestaLines.push(checkLine);
      }
    }

    respuestaDe = cleanText(respuestaLines.join('\n'));

    // Extraer explicación
    let explicacionEs = '';
    if (explicacionIdx > -1) {
      const explicacionLine = lines[explicacionIdx];
      const explicacionMatch = explicacionLine.match(/🇪🇸\s+\*?([^*]+?)(?:\*\*|$)/);
      if (explicacionMatch) {
        explicacionEs = explicacionMatch[1].trim();
      }
    }

    if (!respuestaDe) {
      i++;
      continue;
    }

    // Determinar dificultad
    let dificultad = 1;
    const qNum = parseInt(numeroQuestion.split('.')[0]);
    if ([3, 4, 5].includes(qNum)) dificultad = 2;
    if (qNum === 8) dificultad = 3;

    // Extraer términos de todo el bloque
    const bloqueTexto = lines.slice(i, Math.min(explicacionIdx + 3, lines.length)).join('\n');
    const terminos = extractTerminos(bloqueTexto);

    const pregunta = {
      id: `p${index}`,
      capitulo_id: getCapituloId(numeroQuestion),
      numero: `F ${numeroQuestion}`,
      pregunta_de: preguntaDe,
      pregunta_es: preguntaDe,
      respuesta_de: respuestaDe,
      respuesta_es: explicacionEs || respuestaDe,
      explicacion_es: explicacionEs || respuestaDe,
      terminos_clave: terminos,
      dificultad: dificultad,
    };

    preguntas.push(pregunta);
    index++;
    i = Math.max(i + 1, explicacionIdx + 1 || i + 1);
  }

  return preguntas;
}

try {
  const mdPath = path.join(__dirname, '../Fragenkatalog_BLizenz.md');
  const preguntas = parseMarkdown(mdPath);

  const output = {
    preguntas: preguntas,
    metadata: {
      total: preguntas.length,
      por_capitulo: groupBy(preguntas, 'capitulo_id'),
      fecha_generacion: new Date().toISOString(),
    }
  };

  const outputPath = path.join(__dirname, '../src/data/preguntas.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`✅ Parsed ${preguntas.length} questions\n`);
  console.log(`📊 Distribution by chapter:`);
  const sorted = Object.entries(output.metadata.por_capitulo).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([cap, count]) => {
    console.log(`   ${cap.padEnd(5)}: ${String(count).padStart(3)} qs`);
  });

  console.log(`\n📈 Total: ${preguntas.length} preguntas`);
} catch (error) {
  console.error('❌ Parse failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key];
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}
