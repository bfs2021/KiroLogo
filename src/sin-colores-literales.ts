// Detector de colores escritos como literal en código TypeScript.
//
// El Tema (src/estilos/tema.css) es la única fuente de verdad del color: ningún
// módulo de src/motor/ ni de src/ui/ debe escribir un color a mano, sino leerlo
// de una variable del Tema (requisitos 9.1 y 9.2 de la spec 08). Este módulo
// contiene la lógica pura que reconoce un color literal en un texto fuente; la
// prueba homónima la aplica a todos esos módulos y falla identificando el archivo
// y el literal, sin modificar el módulo señalado.
//
// Por qué un módulo aparte y no solo la prueba: la regla «cada .test.ts acompaña
// a su módulo homónimo» (main.test.ts · 21.3) exige un .ts por cada prueba, y la
// detección es lógica pura y verificable en aislamiento, así que vive aquí.

// ============================================================================
// Tipos públicos
// ============================================================================

/** Un color escrito como literal hallado en el texto, con su ubicación. */
export interface ColorLiteral {
  /** El literal tal como aparece en el texto, p. ej. «#0d6efd» o «rgb(13,110,253)». */
  readonly texto: string;
  /** Familia del literal, para explicar el hallazgo. */
  readonly clase: 'hex' | 'funcion' | 'nombre-css';
  /** Línea (base 1) donde empieza el literal. */
  readonly linea: number;
  /** Columna (base 1) donde empieza el literal. */
  readonly columna: number;
}

// ============================================================================
// Nombres CSS de color
// ============================================================================

// Solo se buscan dentro de cadenas de texto, nunca como identificadores sueltos:
// varias de estas palabras colisionan con identificadores o con el español (p. ej.
// «red» es «network» en inglés y aparece en nombres de variables). Fuera de una
// cadena no son un color, así que buscarlas en código desnudo daría falsos
// positivos. En una cadena, en cambio, un nombre CSS de color sí ocupa una
// posición de color.
//
// Lista de los 148 nombres de color con nombre de CSS Color Module Level 4, más
// «transparent». Se comparan sin distinguir mayúsculas.
const NOMBRES_CSS: ReadonlySet<string> = new Set(
  [
    'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque',
    'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
    'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk',
    'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray',
    'darkgreen', 'darkgrey', 'darkkhaki', 'darkmagenta', 'darkolivegreen',
    'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
    'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise',
    'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
    'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro',
    'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
    'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender',
    'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral',
    'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey',
    'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
    'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen',
    'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
    'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
    'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue',
    'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
    'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
    'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
    'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red',
    'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
    'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray',
    'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
    'tomato', 'transparent', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke',
    'yellow', 'yellowgreen',
  ].map((n) => n.toLowerCase()),
);

// ============================================================================
// Despojar comentarios (conservando las cadenas)
// ============================================================================

/**
 * Reemplaza los comentarios de línea y de bloque por espacios equivalentes,
 * conservando los saltos de línea y, a propósito, **el contenido de las cadenas**:
 * un color literal en un módulo vive justamente dentro de una cadena
 * (`ctx.fillStyle = '#fff'`), así que no se puede borrar lo que hay entre comillas.
 * Mantener las posiciones intactas permite reportar línea y columna exactas.
 */
export function despojarComentarios(fuente: string): string {
  let salida = '';
  let i = 0;
  type Modo = 'codigo' | 'linea' | 'bloque' | 'comilla' | 'doble' | 'plantilla';
  let modo: Modo = 'codigo';
  while (i < fuente.length) {
    const c = fuente[i]!;
    const d = i + 1 < fuente.length ? fuente[i + 1]! : '';
    if (modo === 'codigo') {
      if (c === '/' && d === '/') { modo = 'linea'; salida += '  '; i += 2; continue; }
      if (c === '/' && d === '*') { modo = 'bloque'; salida += '  '; i += 2; continue; }
      if (c === "'") { modo = 'comilla'; salida += c; i += 1; continue; }
      if (c === '"') { modo = 'doble'; salida += c; i += 1; continue; }
      if (c === '`') { modo = 'plantilla'; salida += c; i += 1; continue; }
      salida += c; i += 1; continue;
    }
    if (modo === 'linea') {
      if (c === '\n') { modo = 'codigo'; salida += '\n'; } else salida += ' ';
      i += 1; continue;
    }
    if (modo === 'bloque') {
      if (c === '*' && d === '/') { modo = 'codigo'; salida += '  '; i += 2; continue; }
      salida += c === '\n' ? '\n' : ' '; i += 1; continue;
    }
    // Dentro de una cadena: se conserva su contenido tal cual, respetando el
    // escape para no cerrar la cadena en una comilla escapada.
    if (c === '\\') { salida += fuente.slice(i, i + 2); i += 2; continue; }
    if (
      (modo === 'comilla' && c === "'") ||
      (modo === 'doble' && c === '"') ||
      (modo === 'plantilla' && c === '`')
    ) {
      modo = 'codigo'; salida += c; i += 1; continue;
    }
    salida += c; i += 1; continue;
  }
  return salida;
}

// ============================================================================
// Detección
// ============================================================================

// Un color hexadecimal CSS: # seguido de 3, 4, 6 u 8 dígitos hex, sin que lo siga
// otro carácter de palabra (para no cortar un #abcdef9 raro por la mitad).
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;

// Una función de color CSS: rgb/rgba/hsl/hsla seguida de un paréntesis de apertura.
// El límite \b evita confundirla con un identificador que termine en esas letras.
const FUNCION = /\b(?:rgba?|hsla?)\s*\(/gi;

// Un nombre CSS de color dentro de una cadena simple o doble: "red", 'teal'. Se
// exige que la comilla abra y cierre pegada al nombre, de modo que solo se marque
// una cadena cuyo único contenido sea el nombre de color (una posición de color
// inequívoca), no una frase que lo contenga como palabra.
const CADENA_NOMBRE = /(['"])([a-zA-Z]+)\1/g;

/** Número de línea (base 1) de un índice dentro del texto. */
function lineaDe(texto: string, indice: number): number {
  let linea = 1;
  for (let i = 0; i < indice; i++) if (texto[i] === '\n') linea++;
  return linea;
}

/** Número de columna (base 1) de un índice dentro del texto. */
function columnaDe(texto: string, indice: number): number {
  const ultimoSalto = texto.lastIndexOf('\n', indice - 1);
  return indice - ultimoSalto;
}

/**
 * Busca colores escritos como literal en un texto fuente de TypeScript. Devuelve
 * cada hallazgo con su clase y su ubicación. No lanza; un texto sin literales
 * devuelve una lista vacía.
 */
export function buscarColoresLiterales(fuente: string): ColorLiteral[] {
  const texto = despojarComentarios(fuente);
  const hallazgos: ColorLiteral[] = [];

  for (const m of texto.matchAll(HEX)) {
    const indice = m.index;
    hallazgos.push({
      texto: m[0],
      clase: 'hex',
      linea: lineaDe(texto, indice),
      columna: columnaDe(texto, indice),
    });
  }

  for (const m of texto.matchAll(FUNCION)) {
    const indice = m.index;
    hallazgos.push({
      texto: m[0].replace(/\s*\($/, '(…)'),
      clase: 'funcion',
      linea: lineaDe(texto, indice),
      columna: columnaDe(texto, indice),
    });
  }

  for (const m of texto.matchAll(CADENA_NOMBRE)) {
    const nombre = m[2]!;
    if (!NOMBRES_CSS.has(nombre.toLowerCase())) continue;
    const indice = m.index;
    hallazgos.push({
      texto: m[0],
      clase: 'nombre-css',
      linea: lineaDe(texto, indice),
      columna: columnaDe(texto, indice),
    });
  }

  hallazgos.sort((a, b) => a.linea - b.linea || a.columna - b.columna);
  return hallazgos;
}

/** Da `true` si el texto contiene al menos un color escrito como literal. */
export function tieneColorLiteral(fuente: string): boolean {
  return buscarColoresLiterales(fuente).length > 0;
}
