import * as fs from 'fs';
import * as path from 'path';

interface Pregunta {
  id: string;
  capitulo_id: string;
  numero: string;
  pregunta_de: string;
  pregunta_es: string;
  respuesta_de?: string;
  respuesta_es?: string;
  explicacion_es: string;
  terminos_clave: string[];
  dificultad: 1 | 2 | 3;
}

interface Capitulo {
  id: string;
  numero: number;
  subtitulo?: string;
  titulo_de: string;
  titulo_es: string;
  peso: number;
}

const CAPITULO_PESOS: Record<string, number> = {
  k2: 0.08,
  'k3.2': 0.10,
  'k3.3': 0.15,
  'k3.4': 0.15,
  'k3.5': 0.12,
  'k3.6': 0.06,
  'k3.7': 0.06,
  k4: 0.12,
  'k5-7': 0.11,
  k8: 0.05,
};

const CAPITULO_INFO: Record<string, { titulo_de: string; titulo_es: string }> = {
  k2: {
    titulo_de: 'Grundsätze Trainerverhalten',
    titulo_es: 'Principios del comportamiento del entrenador',
  },
  'k3.2': {
    titulo_de: 'Der Zellaufbau',
    titulo_es: 'La estructura celular',
  },
  'k3.3': {
    titulo_de: 'Passiver Bewegungsapparat',
    titulo_es: 'Aparato locomotor pasivo',
  },
  'k3.4': {
    titulo_de: 'Aktiver Bewegungsapparat',
    titulo_es: 'Aparato locomotor activo',
  },
  'k3.5': {
    titulo_de: 'Muskelkatalog & Dysbalancen',
    titulo_es: 'Catálogo muscular y desequilibrios',
  },
  'k3.6': {
    titulo_de: 'Herz-Kreislauf-System',
    titulo_es: 'Sistema cardiovascular',
  },
  'k3.7': {
    titulo_de: 'Nervensystem',
    titulo_es: 'Sistema nervioso',
  },
  k4: {
    titulo_de: 'Trainings- und Bewegungslehre',
    titulo_es: 'Teoría del entrenamiento y movimiento',
  },
  'k5-7': {
    titulo_de: 'Entrenamiento y planificación',
    titulo_es: 'Entrenamiento y planificación',
  },
  k8: {
    titulo_de: 'Übungskatalog',
    titulo_es: 'Catálogo de ejercicios',
  },
};

export function parseMarkdown(filePath: string): {
  capitulos: Capitulo[];
  preguntas: Pregunta[];
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const capitulos: Capitulo[] = [];
  const preguntas: Pregunta[] = [];

  // Crear capítulos base
  Object.entries(CAPITULO_INFO).forEach(([id, info]) => {
    capitulos.push({
      id,
      numero: parseInt(id.replace('k', '').split('.')[0]),
      subtitulo: id.includes('.') ? id.split('.')[1] : undefined,
      titulo_de: info.titulo_de,
      titulo_es: info.titulo_es,
      peso: CAPITULO_PESOS[id],
    });
  });

  // Parse preguntas: patrón "**F X.Y —" o "**F X.Y — "
  const preguntaPattern = /\*\*F\s+([\d.]+)\s+—\s+(.+?)\*\*(?:\s*\*\((.+?)\)\*)?/g;
  const respuestaPattern = /✅\s+\*\*Antwort\*\*:?\s*\n?(?:>?\s*)?(.+?)(?=🇪🇸|$)/s;
  const explicacionPattern = /🇪🇸\s+\*(.+?)(?=\*\*Por qué|Por qué:|$)/s;

  let match;
  let preguntaIndex = 1;

  // Find all question blocks
  const blocksPattern = /\*\*F\s+[\d.]+.*?(?=\n\*\*F\s+[\d.]|$)/gs;
  const blocks = content.match(blocksPattern) || [];

  blocks.forEach((block) => {
    // Extract question number
    const numMatch = block.match(/F\s+([\d.]+)/);
    const questionNum = numMatch ? numMatch[1] : '';

    // Determine chapter
    const firstDigit = questionNum.split('.')[0];
    let capId = `k${firstDigit}`;
    if (firstDigit === '3') {
      const subNum = questionNum.split('.')[1];
      if (subNum && subNum !== '5') {
        capId = `k3.${subNum}`;
      } else {
        capId = 'k3.5';
      }
    }

    // Extract German question
    const pregMatch = block.match(/\*\*F\s+[\d.]+\s+—\s+(.+?)\*\*/);
    const pregDe = pregMatch ? pregMatch[1].trim() : '';

    // Extract Spanish question (after 🇪🇸)
    let pregEs = '';
    const respMatch = block.match(/✅\s+\*\*Antwort\*\*:?\s*\n?>(.*?)(?=🇪🇸|$)/s);
    if (respMatch) {
      const fullResp = respMatch[1];
      const lines = fullResp.split('\n');
      pregEs = lines.length > 0 ? lines[0].replace(/^>/, '').trim() : '';
    }

    // Extract explanation
    const explMatch = block.match(/🇪🇸\s+\*(.+?)(?=\*\*Por qué|Por qué:|$)/s);
    const explicacion = explMatch ? explMatch[1].trim() : '';

    if (pregDe && pregEs) {
      preguntas.push({
        id: `p${preguntaIndex}`,
        capitulo_id: capId,
        numero: `F ${questionNum}`,
        pregunta_de: pregDe,
        pregunta_es: pregEs,
        explicacion_es: explicacion,
        terminos_clave: extractTerminos(block),
        dificultad: 1,
      });
      preguntaIndex++;
    }
  });

  return { capitulos, preguntas };
}

function extractTerminos(text: string): string[] {
  const terminos: Set<string> = new Set();
  // Buscar palabras en negrita en alemán
  const boldPattern = /\*\*([A-Z][a-z\s]+[a-z])\*\*/g;
  let match;
  while ((match = boldPattern.exec(text)) !== null) {
    if (match[1].length > 3) {
      terminos.add(match[1]);
    }
  }
  return Array.from(terminos);
}

// Main execution
const mdPath = path.join(process.cwd(), 'Fragenkatalog_BLizenz.md');
if (fs.existsSync(mdPath)) {
  const { capitulos, preguntas } = parseMarkdown(mdPath);

  // Save JSONs
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/capitulos.json'),
    JSON.stringify({ capitulos }, null, 2)
  );
  fs.writeFileSync(
    path.join(process.cwd(), 'src/data/preguntas.json'),
    JSON.stringify({ preguntas }, null, 2)
  );

  console.log(`✅ Parsed ${capitulos.length} chapters and ${preguntas.length} questions`);
} else {
  console.error(`❌ File not found: ${mdPath}`);
}
