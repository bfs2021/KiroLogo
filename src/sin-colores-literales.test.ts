// Prueba de la regla «ningún color a mano» (spec 08, requisitos 9.1 y 9.2):
// ningún módulo de src/motor/ ni de src/ui/ escribe un color como literal; todo
// color sale de una variable del Tema leída por getComputedStyle. Si un módulo
// contiene un color literal, la prueba lo marca como fallo identificando el
// archivo y el literal, sin modificar el módulo.
//
// src/main.ts queda excluido a propósito: es el cableador y mantiene valores de
// reserva del lector de tema y constantes de presentación (ESCALA_PERSONAJES,
// GROSOR_ESTELA_DE_FONDO, …). La prueba abarca solo src/motor/ y src/ui/.
//
// Esta prueba GENERALIZA la comprobación específica de personajes.test.ts (que
// sigue vigente para personajes.ts) a todos los módulos de esos dos directorios.

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buscarColoresLiterales,
  despojarComentarios,
  tieneColorLiteral,
  type ColorLiteral,
} from './sin-colores-literales.js';

const RAIZ_SRC = dirname(fileURLToPath(import.meta.url)); // este archivo vive en src/

/** Rutas absolutas de los módulos .ts (sin pruebas) de un directorio, en profundidad. */
function modulosDe(dir: string): string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) {
      salida.push(...modulosDe(ruta));
    } else if (ruta.endsWith('.ts') && !ruta.endsWith('.test.ts')) {
      salida.push(ruta);
    }
  }
  return salida;
}

/** Ruta relativa a src/, con barras normales para los mensajes. */
function rel(ruta: string): string {
  return relative(RAIZ_SRC, ruta).split(sep).join('/');
}

const DIRECTORIOS = ['motor', 'ui'];

// src/main.ts se excluye explícitamente, aunque no viva en motor/ ni en ui/: deja
// constancia en el nombre de que su exclusión es deliberada.
const EXCLUIDOS = new Set<string>(['main.ts']);

const MODULOS = DIRECTORIOS.flatMap((d) => modulosDe(join(RAIZ_SRC, d))).filter(
  (ruta) => !EXCLUIDOS.has(rel(ruta)),
);

/** Formatea un hallazgo para el mensaje de fallo: archivo, lugar y literal. */
function describir(relativo: string, c: ColorLiteral): string {
  return `${relativo}:${c.linea}:${c.columna} → ${c.clase} «${c.texto}»`;
}

// ============================================================================
// La regla sobre los módulos reales de src/motor/ y src/ui/
// ============================================================================

describe('sin colores literales · módulos de motor/ y ui/', () => {
  it('encuentra módulos que recorrer en ambos directorios', () => {
    // Guarda contra un recorrido vacío que haría pasar la prueba por error.
    expect(MODULOS.length).toBeGreaterThan(0);
    for (const d of DIRECTORIOS) {
      expect(MODULOS.some((r) => rel(r).startsWith(`${d}/`))).toBe(true);
    }
  });

  it('excluye src/main.ts del recorrido', () => {
    expect(MODULOS.map(rel)).not.toContain('main.ts');
  });

  it('ningún módulo contiene un color escrito como literal', () => {
    const infracciones: string[] = [];
    for (const ruta of MODULOS) {
      const fuente = readFileSync(ruta, 'utf8');
      for (const hallazgo of buscarColoresLiterales(fuente)) {
        infracciones.push(describir(rel(ruta), hallazgo));
      }
    }
    expect(infracciones, infracciones.join('\n')).toEqual([]);
  });
});

// ============================================================================
// El detector: ejemplos y casos borde
// ============================================================================

describe('sin colores literales · detector', () => {
  it('marca un hexadecimal de 3 y de 6 dígitos', () => {
    expect(buscarColoresLiterales(`const a = '#fff';`).map((c) => c.texto)).toEqual(['#fff']);
    expect(buscarColoresLiterales(`const a = '#0d6efd';`).map((c) => c.texto)).toEqual(['#0d6efd']);
  });

  it('marca un hexadecimal de 4 y de 8 dígitos (con alfa)', () => {
    expect(buscarColoresLiterales(`x = '#abcd'`).map((c) => c.texto)).toEqual(['#abcd']);
    expect(buscarColoresLiterales(`x = '#0d6efd80'`).map((c) => c.texto)).toEqual(['#0d6efd80']);
  });

  it('marca rgb, rgba, hsl y hsla con y sin espacios', () => {
    const fuente = `
      a = 'rgb(13,110,253)';
      b = 'rgba(13,110,253,0.1)';
      c = 'hsl(210, 100%, 56%)';
      d = 'hsla (210,100%,56%,0.5)';
    `;
    const clases = buscarColoresLiterales(fuente);
    expect(clases.every((c) => c.clase === 'funcion')).toBe(true);
    expect(clases.length).toBe(4);
  });

  it('marca un nombre CSS de color cuando es el único contenido de una cadena', () => {
    expect(buscarColoresLiterales(`ctx.fillStyle = 'red'`).map((c) => c.clase)).toEqual([
      'nombre-css',
    ]);
    expect(buscarColoresLiterales(`x = "TEAL"`).map((c) => c.clase)).toEqual(['nombre-css']);
  });

  it('identifica el archivo-equivalente por línea y columna del literal', () => {
    const fuente = `línea uno\nconst color = '#0d6efd';`;
    const [hallazgo] = buscarColoresLiterales(fuente);
    expect(hallazgo?.linea).toBe(2);
    // La columna apunta al # dentro de la cadena.
    expect(fuente.split('\n')[1]!.charAt(hallazgo!.columna - 1)).toBe('#');
  });

  it('no marca el nombre de las propiedades fillStyle ni strokeStyle', () => {
    const fuente = `ctx.fillStyle = estilo.relleno; ctx.strokeStyle = estilo.contorno;`;
    expect(tieneColorLiteral(fuente)).toBe(false);
  });

  it('no confunde «red» del español (una red, la red) con un color', () => {
    // «red» solo es color dentro de una cadena que sea exactamente ese nombre.
    const fuente = `const red = crearRed(); // configurar la red\nconectar(red);`;
    expect(buscarColoresLiterales(fuente)).toEqual([]);
  });

  it('no marca un nombre de color embebido en una frase', () => {
    // Una cadena que contiene la palabra pero no es una posición de color.
    const fuente = `const msg = 'el error quedó en rojo intenso en pantalla';`;
    expect(buscarColoresLiterales(fuente)).toEqual([]);
  });

  it('no marca un hexadecimal que aparece solo en un comentario', () => {
    const fuente = `// el acento era #0d6efd en la primera versión\nconst x = leerTema('--acento');`;
    expect(buscarColoresLiterales(fuente)).toEqual([]);
  });

  it('no marca un rgba mencionado dentro de un comentario de bloque', () => {
    const fuente = `/* antes: rgba(13,110,253,0.1) */\nconst x = leer();`;
    expect(buscarColoresLiterales(fuente)).toEqual([]);
  });

  it('sí marca un color dentro de una cadena, no en un comentario', () => {
    const fuente = `const malo = '#dc3545'; // color de peligro`;
    expect(buscarColoresLiterales(fuente).map((c) => c.texto)).toEqual(['#dc3545']);
  });

  it('no marca un identificador que termina en rgb sin paréntesis', () => {
    const fuente = `const valorRgb = convertir(); const sinHsl = 1;`;
    expect(tieneColorLiteral(fuente)).toBe(false);
  });

  it('un texto sin colores literales da lista vacía', () => {
    const fuente = `import { leerTema } from './tema.js';\nexport const x = leerTema('--acento');`;
    expect(buscarColoresLiterales(fuente)).toEqual([]);
  });

  it('ordena los hallazgos por línea y columna', () => {
    const fuente = `a = 'rgb(0,0,0)'; b = '#fff'\nc = 'teal'`;
    const lineas = buscarColoresLiterales(fuente).map((c) => c.linea);
    expect(lineas).toEqual([...lineas].sort((x, y) => x - y));
  });

  it('despojarComentarios conserva el contenido de las cadenas y borra los comentarios', () => {
    const fuente = `const c = '#fff'; // comentario con #000\n/* bloque con rgb(1,2,3) */`;
    const limpio = despojarComentarios(fuente);
    expect(limpio).toContain(`'#fff'`);
    expect(limpio).not.toContain('#000');
    expect(limpio).not.toContain('rgb(1,2,3)');
  });

  it('despojarComentarios conserva las posiciones (misma longitud por línea)', () => {
    const fuente = `const c = '#fff'; // cola\nsegunda línea`;
    const limpio = despojarComentarios(fuente);
    const origen = fuente.split('\n');
    const salida = limpio.split('\n');
    expect(salida.length).toBe(origen.length);
    origen.forEach((l, i) => expect(salida[i]!.length).toBe(l.length));
  });
});
